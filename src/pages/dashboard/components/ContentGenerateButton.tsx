
import { Button } from "@/components/ui/button";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ContentGenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const ContentGenerateButton = ({ onClick, isLoading }: ContentGenerateButtonProps) => {
  const [hasWebhook, setHasWebhook] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkWebhookUrl = async () => {
      try {
        const { data, error } = await supabase
          .from('system_configurations')
          .select('value')
          .eq('key', 'webhook_url')
          .maybeSingle();

        if (error) {
          console.error('Lỗi khi kiểm tra webhook URL:', error);
          setHasWebhook(false);
        } else {
          setHasWebhook(!!data?.value);
        }
      } catch (error) {
        console.error('Lỗi exception khi kiểm tra webhook URL:', error);
        setHasWebhook(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkWebhookUrl();
  }, []);

  const showTooltip = hasWebhook === false;
  
  return (
    <div className="mt-8 flex justify-end w-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <Button 
                onClick={onClick} 
                className="flex items-center gap-2" 
                disabled={isLoading || isChecking}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : showTooltip ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Tạo bài viết
              </Button>
            </div>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent>
              <p>Chưa có cấu hình webhook URL. Vui lòng liên hệ quản trị viên.</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ContentGenerateButton;
