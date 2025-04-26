
import { supabase } from "@/integrations/supabase/client";
import { ContentGenerationParams, WebhookResponse } from "./types";

const getWebhookUrl = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('system_configurations')
    .select('value')
    .eq('key', 'webhook_url')
    .single();

  if (error) {
    console.error('Lỗi khi lấy webhook URL từ database:', error);
    return '';
  }

  return data?.value || '';
};

export const generateContent = async (
  params: ContentGenerationParams,
): Promise<WebhookResponse> => {
  try {
    const webhookUrl = await getWebhookUrl();
    
    if (!webhookUrl) {
      console.error('Không có URL webhook nào được cung cấp');
      return {
        status: 'error',
        error: 'Không tìm thấy URL webhook. Vui lòng liên hệ quản trị viên để cấu hình webhook.'
      };
    }
    
    try {
      new URL(webhookUrl);
    } catch (urlError) {
      console.error('URL không hợp lệ:', webhookUrl);
      return {
        status: 'error',
        error: 'URL webhook không hợp lệ. Vui lòng liên hệ quản trị viên để kiểm tra định dạng URL.'
      };
    }
    
    console.log('Gửi yêu cầu đến webhook:', webhookUrl);
    console.log('Tham số yêu cầu:', params);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
      mode: 'cors',
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Phản hồi lỗi HTTP:', response.status, response.statusText);
      throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const responseText = await response.text();
    console.log('Phản hồi gốc từ server:', responseText);
    
    if (!responseText || responseText.trim() === '') {
      return {
        status: 'error',
        error: 'Máy chủ trả về phản hồi trống. Vui lòng kiểm tra cấu hình webhook.',
      };
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('Dữ liệu JSON đã parse:', data);
      
      return {
        status: 'success',
        content: JSON.stringify(data, null, 2),
        rawResponse: data
      };
      
    } catch (jsonError) {
      console.error('Lỗi parse JSON:', jsonError);
      return {
        status: 'success',
        content: responseText,
        error: 'Dữ liệu không ở định dạng JSON, hiển thị dưới dạng text.',
      };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Lỗi mạng - Không thể kết nối:', error);
      return {
        status: 'error',
        error: 'Không thể kết nối tới webhook URL. Vui lòng kiểm tra kết nối mạng và URL webhook.'
      };
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Yêu cầu hết thời gian chờ:', error);
      return {
        status: 'error',
        error: 'Yêu cầu quá thời gian chờ (10 phút). Vui lòng thử lại sau.'
      };
    }
    
    console.error('Lỗi khi gọi webhook:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi gọi webhook',
    };
  }
};
