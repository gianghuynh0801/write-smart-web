
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Tạo response chuẩn cho API
 * @param data Dữ liệu trả về
 * @param error Lỗi nếu có
 * @param status Mã trạng thái HTTP
 * @returns Response object
 */
export const standardResponse = (data: any = null, error: string | null = null, status = 200) => {
  return new Response(
    JSON.stringify({ data, error }), 
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  )
};
