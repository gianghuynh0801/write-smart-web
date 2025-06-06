
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateContent } from "@/services/webhook/webhookService";
import { OutlineItem } from "../components/ContentOutline";

interface ContentGenerationParams {
  mainKeyword: string;
  subKeywords: string[];
  relatedKeywords: string[];
  outlineItems: OutlineItem[];
  webConnection: boolean;
  reference: string;
  bold: boolean;
  italic: boolean;
  useList: boolean;
  links: Array<{ keyword: string; url: string }>;
  imageSize: string;
  language?: string;
  country?: string;
  tone?: string;
  narrator?: string;
  formality?: string;
}

export const useContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const generateContentHandler = async (params: ContentGenerationParams) => {
    if (!params.mainKeyword) {
      toast({
        title: "Thiếu từ khoá chính",
        description: "Vui lòng nhập từ khoá chính.",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const link_keywords = params.links.map(link => link.keyword);
      const link_urls = params.links.map(link => link.url);

      const requestParams = {
        keywords: {
          main: params.mainKeyword,
          sub: params.subKeywords,
          related: params.relatedKeywords,
        },
        outline: params.outlineItems,
        knowledge: {
          webConnection: params.webConnection,
          reference: params.reference,
        },
        format: {
          bold: params.bold,
          italic: params.italic,
          useList: params.useList,
        },
        link_keywords,
        link_urls,
        images: {
          size: params.imageSize,
        },
        content: {
          language: params.language || 'vi',
          country: params.country || 'vn',
          tone: params.tone || 'Neutral',
          narrator: params.narrator || 'tự động',
          formality: params.formality || 'tự động'
        }
      };

      const resp = await generateContent(requestParams);
      
      if (resp.status === "success" && resp.content) {
        setGeneratedContent(resp.content);
        
        if (resp.rawResponse && Array.isArray(resp.rawResponse)) {
          toast({
            title: "Kết quả test webhook",
            description: "Đã nhận được dữ liệu test từ webhook.",
          });
        } else {
          toast({
            title: "Tạo nội dung thành công!",
            description: "Bài viết đã được tạo.",
          });
        }
        return resp.content;
      } else {
        console.error("Response đầy đủ từ webhook:", resp);
        toast({
          title: "Lỗi",
          description: resp.error || "Đã xảy ra lỗi khi tạo nội dung!",
          variant: "destructive",
        });
        console.error("Lỗi từ webhook:", resp.error);
        return null;
      }
    } catch (error) {
      console.error("Lỗi exception:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi gọi webhook.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatedContent,
    generateContent: generateContentHandler,
  };
};
