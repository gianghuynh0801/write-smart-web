
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
    if (!id || !userData) {
      throw new Error('Missing required data')
    }

    console.log("[update-user] Đang cập nhật user:", { id, userData })

    // Kiểm tra user tồn tại
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (getUserError) {
      console.error('[update-user] Lỗi khi kiểm tra user:', getUserError)
      return new Response(JSON.stringify({ 
        data: null, 
        error: `Lỗi khi kiểm tra user: ${getUserError.message}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!existingUser) {
      return new Response(JSON.stringify({ 
        data: null, 
        error: 'User not found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Cập nhật thông tin user
    const { data: updatedUser, error: updateError } = await supabaseAdmin
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
      .single()

    if (updateError) {
      console.error('[update-user] Lỗi khi cập nhật:', updateError)
      return new Response(JSON.stringify({ 
        data: null, 
        error: `Lỗi cập nhật: ${updateError.message}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Nếu thay đổi gói đăng ký
    if (existingUser.subscription !== userData.subscription) {
      console.log('[update-user] Cập nhật gói đăng ký:', { 
        from: existingUser.subscription, 
        to: userData.subscription 
      })
      
      // Tìm subscription id
      const { data: subscriptionData, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('name', userData.subscription)
        .maybeSingle()

      if (subError) {
        console.error('[update-user] Lỗi khi tìm gói đăng ký:', subError)
        return new Response(JSON.stringify({ 
          data: null, 
          error: `Lỗi khi tìm gói đăng ký: ${subError.message}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      if (subscriptionData) {
        const startDate = new Date().toISOString().split('T')[0]
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)
        const endDateStr = endDate.toISOString().split('T')[0]

        // Hủy các gói đăng ký cũ
        const { error: cancelError } = await supabaseAdmin
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('user_id', id)
          .eq('status', 'active')

        if (cancelError) {
          console.error('[update-user] Lỗi khi hủy gói đăng ký cũ:', cancelError)
          return new Response(JSON.stringify({ 
            data: null, 
            error: `Lỗi khi hủy gói đăng ký cũ: ${cancelError.message}` 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          })
        }

        // Tạo gói đăng ký mới
        if (userData.subscription !== 'Không có') {
          const { error: createSubError } = await supabaseAdmin
            .from('user_subscriptions')
            .insert({
              user_id: id,
              subscription_id: subscriptionData.id,
              start_date: startDate,
              end_date: endDateStr,
              status: 'active'
            })

          if (createSubError) {
            console.error('[update-user] Lỗi khi tạo gói đăng ký mới:', createSubError)
            return new Response(JSON.stringify({ 
              data: null, 
              error: `Lỗi khi tạo gói đăng ký mới: ${createSubError.message}` 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            })
          }
        }
      }
    }

    // Trả về kết quả thành công
    return new Response(JSON.stringify({ 
      data: { ...updatedUser, subscription: userData.subscription },
      error: null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('[update-user] Lỗi:', error)
    return new Response(JSON.stringify({ 
      data: null,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
