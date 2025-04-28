
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = "https://lxhawtndkubaeljbaylp.supabase.co"
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

Deno.serve(async (req) => {
  // Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Xác thực người dùng
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !caller) {
      throw new Error('Invalid token')
    }

    // Kiểm tra quyền admin
    const { data: isAdmin } = await supabaseAdmin.rpc('is_admin', { uid: caller.id })
    if (!isAdmin) {
      throw new Error('Unauthorized - Admin access required')
    }

    // Lấy dữ liệu từ request
    const { id, userData } = await req.json()

    console.log("[update-user] Đang cập nhật user:", { id, userData })

    // Kiểm tra user tồn tại
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (getUserError || !existingUser) {
      throw new Error('User not found')
    }

    // Cập nhật thông tin user
    const { data, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        name: userData.name,
        email: userData.email,
        credits: userData.credits,
        status: userData.status,
        role: userData.role
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (updateError) {
      console.error('[update-user] Lỗi khi cập nhật:', updateError)
      throw new Error(`Lỗi cập nhật: ${updateError.message}`)
    }

    if (!data) {
      throw new Error('Không nhận được dữ liệu sau khi cập nhật')
    }

    // Nếu thay đổi gói đăng ký
    if (existingUser.subscription !== userData.subscription) {
      console.log('[update-user] Cập nhật gói đăng ký:', { 
        from: existingUser.subscription, 
        to: userData.subscription 
      })
      
      // Tìm subscription id
      const { data: subscriptionData } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('name', userData.subscription)
        .maybeSingle()

      if (subscriptionData) {
        const startDate = new Date().toISOString().split('T')[0]
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)
        const endDateStr = endDate.toISOString().split('T')[0]

        // Hủy các gói đăng ký cũ
        await supabaseAdmin
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('user_id', id)
          .eq('status', 'active')

        // Tạo gói đăng ký mới
        if (userData.subscription !== 'Không có') {
          await supabaseAdmin
            .from('user_subscriptions')
            .insert({
              user_id: id,
              subscription_id: subscriptionData.id,
              start_date: startDate,
              end_date: endDateStr,
              status: 'active'
            })
        }
      }
    }

    return new Response(JSON.stringify({ 
      data: { ...data, subscription: userData.subscription }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('[update-user] Lỗi:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
