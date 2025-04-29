
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
    console.log('[admin-subscription] Nhận request mới')
    
    // Xác thực người dùng
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[admin-subscription] Thiếu Authorization header')
      return new Response(
        JSON.stringify({ error: 'Thiếu thông tin xác thực' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('[admin-subscription] Đang xác thực token')
    
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !caller) {
      console.error('[admin-subscription] Lỗi xác thực:', authError)
      return new Response(
        JSON.stringify({ error: `Xác thực không thành công: ${authError?.message || 'Token không hợp lệ'}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log('[admin-subscription] Xác thực thành công cho user:', caller.id)
    
    // Kiểm tra quyền admin
    try {
      const { data: isAdmin, error: adminCheckError } = await supabaseAdmin.rpc('is_admin', { uid: caller.id })
      
      if (adminCheckError) {
        console.error('[admin-subscription] Lỗi khi kiểm tra quyền admin:', adminCheckError)
        return new Response(
          JSON.stringify({ error: `Lỗi khi kiểm tra quyền quản trị: ${adminCheckError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
      
      if (!isAdmin) {
        console.error('[admin-subscription] Người dùng không có quyền admin:', caller.id)
        return new Response(
          JSON.stringify({ error: 'Bạn không có quyền thực hiện thao tác này' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
      
      console.log('[admin-subscription] Xác nhận quyền admin thành công')
    } catch (adminError) {
      console.error('[admin-subscription] Lỗi khi kiểm tra quyền admin:', adminError)
      return new Response(
        JSON.stringify({ error: `Lỗi xác thực quyền: ${adminError instanceof Error ? adminError.message : String(adminError)}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Lấy dữ liệu từ request
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      console.error('[admin-subscription] Lỗi khi parse dữ liệu request:', parseError)
      return new Response(
        JSON.stringify({ error: 'Dữ liệu request không hợp lệ' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { action, userId } = requestData
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Thiếu thông tin người dùng' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Xử lý các action khác nhau
    switch (action) {
      // Lấy gói đăng ký đang hoạt động của người dùng
      case 'get-active': {
        console.log(`[admin-subscription] Lấy gói đăng ký đang hoạt động cho user: ${userId}`)
        
        const { data, error } = await supabaseAdmin
          .from('user_subscriptions')
          .select(`
            id,
            subscription_id,
            start_date,
            end_date,
            status,
            subscriptions (
              id,
              name,
              price,
              period,
              features
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle()
        
        if (error) {
          console.error('[admin-subscription] Lỗi khi lấy gói đăng ký:', error)
          return new Response(
            JSON.stringify({ error: `Lỗi khi lấy gói đăng ký: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }
        
        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
      
      // Hủy tất cả gói đăng ký đang hoạt động
      case 'deactivate-all': {
        console.log(`[admin-subscription] Hủy tất cả gói đăng ký đang hoạt động cho user: ${userId}`)
        
        const { data, error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({ status: 'inactive' })
          .eq('user_id', userId)
          .eq('status', 'active')
        
        if (error) {
          console.error('[admin-subscription] Lỗi khi hủy gói đăng ký:', error)
          return new Response(
            JSON.stringify({ error: `Lỗi khi hủy gói đăng ký: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }
        
        return new Response(
          JSON.stringify({ message: 'Đã hủy tất cả gói đăng ký đang hoạt động' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
      
      // Tạo gói đăng ký mới
      case 'create': {
        const { subscriptionId, startDate, endDate, status } = requestData
        
        if (!subscriptionId || !startDate || !endDate || !status) {
          return new Response(
            JSON.stringify({ error: 'Thiếu thông tin gói đăng ký' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }
        
        console.log(`[admin-subscription] Tạo gói đăng ký mới cho user: ${userId}`, {
          subscriptionId,
          startDate,
          endDate,
          status
        })
        
        const { data, error } = await supabaseAdmin
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            subscription_id: subscriptionId,
            start_date: startDate,
            end_date: endDate,
            status
          })
          .select()
        
        if (error) {
          console.error('[admin-subscription] Lỗi khi tạo gói đăng ký:', error)
          return new Response(
            JSON.stringify({ error: `Lỗi khi tạo gói đăng ký: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }
        
        // Cập nhật thông tin subscription trong bảng users
        try {
          // Lấy tên gói đăng ký
          const { data: subData, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('name')
            .eq('id', subscriptionId)
            .single()
          
          if (!subError && subData && subData.name) {
            const { error: updateError } = await supabaseAdmin
              .from('users')
              .update({ subscription: subData.name })
              .eq('id', userId)
            
            if (updateError) {
              console.error('[admin-subscription] Lỗi khi cập nhật trường subscription trong users:', updateError)
            }
          }
        } catch (updateError) {
          console.error('[admin-subscription] Lỗi khi cập nhật thông tin subscription:', updateError)
        }
        
        return new Response(
          JSON.stringify({ message: 'Đã tạo gói đăng ký mới', data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
      
      default:
        return new Response(
          JSON.stringify({ error: `Action không hợp lệ: ${action}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('[admin-subscription] Lỗi không mong đợi:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
