
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, Shuffle, FileText, Facebook, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [formData, setFormData] = useState({
    topic: "",
    keywords: "",
    length: "medium",
    tone: "professional",
    language: "vietnamese"
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic) {
      toast({
        title: "Chủ đề trống",
        description: "Vui lòng nhập chủ đề cho bài viết của bạn.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedContent(""); // Reset previous content
    
    try {
      // Simulate content generation with n8n webhook
      // In a real implementation, you would call your n8n webhook here
      // const response = await fetch("your-n8n-webhook-url", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      
      // Simulate API delay
      setTimeout(() => {
        // Sample generated content
        const sampleContent = `
# ${formData.topic}

## Giới thiệu

Trong thời đại số hóa ngày nay, việc tối ưu hóa nội dung cho công cụ tìm kiếm (SEO) đóng vai trò quan trọng đối với bất kỳ chiến lược tiếp thị trực tuyến nào. Bài viết này sẽ khám phá các khía cạnh cơ bản của ${formData.topic} và cách áp dụng vào chiến lược tiếp thị của bạn.

## Tầm quan trọng của ${formData.topic}

Khi người dùng tìm kiếm thông tin trên Google hoặc các công cụ tìm kiếm khác, họ thường sử dụng từ khóa cụ thể. Việc hiểu và tối ưu hóa nội dung của bạn cho các từ khóa này là yếu tố cốt lõi của ${formData.topic}.

## Các chiến lược hiệu quả

1. **Nghiên cứu từ khóa**: Xác định những từ khóa có liên quan đến ngành của bạn mà khách hàng tiềm năng đang tìm kiếm.
2. **Tạo nội dung chất lượng**: Viết nội dung thông tin, hữu ích và hấp dẫn tập trung vào các từ khóa mục tiêu.
3. **Tối ưu hóa kỹ thuật**: Đảm bảo trang web của bạn có tốc độ tải nhanh, thân thiện với thiết bị di động và có cấu trúc tốt.
4. **Xây dựng liên kết**: Phát triển chiến lược backlink để tăng uy tín và thứ hạng của trang web.

## Kết luận

${formData.topic} không phải là một nỗ lực một lần, mà là một quá trình liên tục cần được giám sát và điều chỉnh theo thời gian. Bằng cách áp dụng các nguyên tắc và chiến lược được nêu trong bài viết này, bạn có thể cải thiện đáng kể khả năng hiển thị trực tuyến của mình và thu hút nhiều khách hàng tiềm năng hơn.
        `;
        
        setGeneratedContent(sampleContent);
        toast({
          title: "Tạo nội dung thành công!",
          description: "Bài viết của bạn đã được tạo thành công.",
        });
        setIsGenerating(false);
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tạo nội dung. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tạo nội dung</h1>
        <p className="text-gray-500">
          Tạo bài viết chuẩn SEO với công nghệ AI
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bài viết</CardTitle>
            <CardDescription>
              Nhập thông tin chi tiết để tạo bài viết
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Chủ đề</Label>
                <Input
                  id="topic"
                  name="topic"
                  placeholder="Nhập chủ đề bài viết"
                  value={formData.topic}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords">Từ khóa</Label>
                <Input
                  id="keywords"
                  name="keywords"
                  placeholder="Nhập từ khóa (phân cách bởi dấu phẩy)"
                  value={formData.keywords}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Độ dài</Label>
                  <Select
                    defaultValue={formData.length}
                    onValueChange={(value) => handleSelectChange("length", value)}
                  >
                    <SelectTrigger id="length">
                      <SelectValue placeholder="Chọn độ dài" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Ngắn (500 từ)</SelectItem>
                      <SelectItem value="medium">Trung bình (1000 từ)</SelectItem>
                      <SelectItem value="long">Dài (2000 từ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tone">Giọng điệu</Label>
                  <Select
                    defaultValue={formData.tone}
                    onValueChange={(value) => handleSelectChange("tone", value)}
                  >
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Chọn giọng điệu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Chuyên nghiệp</SelectItem>
                      <SelectItem value="casual">Thân thiện</SelectItem>
                      <SelectItem value="formal">Trang trọng</SelectItem>
                      <SelectItem value="persuasive">Thuyết phục</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Ngôn ngữ</Label>
                <Select
                  defaultValue={formData.language}
                  onValueChange={(value) => handleSelectChange("language", value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Chọn ngôn ngữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vietnamese">Tiếng Việt</SelectItem>
                    <SelectItem value="english">Tiếng Anh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Random topic generator would go here
                  const randomTopics = [
                    "Cách tối ưu SEO cho website",
                    "Chiến lược content marketing hiệu quả",
                    "Hướng dẫn xây dựng thương hiệu cá nhân",
                    "Các xu hướng digital marketing năm 2023"
                  ];
                  const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
                  setFormData(prev => ({ ...prev, topic: randomTopic }));
                }}
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Gợi ý ngẫu nhiên
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Tạo bài viết
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="space-y-6">
          <Card className={`${!generatedContent && 'hidden'}`}>
            <CardHeader>
              <CardTitle>Bài viết đã tạo</CardTitle>
              <CardDescription>
                Bài viết được tạo bởi AI dựa trên thông tin của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm p-4 bg-gray-50 rounded border">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  {isGenerating ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Đang tạo nội dung...</p>
                    </div>
                  ) : (
                    <p>Chưa có nội dung nào được tạo</p>
                  )}
                </div>
              )}
            </CardContent>
            {generatedContent && (
              <CardFooter>
                <Tabs defaultValue="wordpress" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="wordpress">
                      <Globe className="mr-2 h-4 w-4" />
                      WordPress
                    </TabsTrigger>
                    <TabsTrigger value="facebook">
                      <Facebook className="mr-2 h-4 w-4" />
                      Facebook
                    </TabsTrigger>
                    <TabsTrigger value="save">
                      <FileText className="mr-2 h-4 w-4" />
                      Lưu
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="wordpress" className="pt-4">
                    <Button className="w-full">Đăng lên WordPress</Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Bạn cần kết nối WordPress trước khi đăng bài
                    </p>
                  </TabsContent>
                  <TabsContent value="facebook" className="pt-4">
                    <Button className="w-full">Đăng lên Facebook</Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Bạn cần kết nối Facebook trước khi đăng bài
                    </p>
                  </TabsContent>
                  <TabsContent value="save" className="pt-4">
                    <Button className="w-full">Lưu bài viết</Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Lưu bài viết này vào thư viện của bạn để sử dụng sau
                    </p>
                  </TabsContent>
                </Tabs>
              </CardFooter>
            )}
          </Card>
          
          {!generatedContent && !isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn tạo nội dung</CardTitle>
                <CardDescription>
                  Làm thế nào để tạo nội dung chất lượng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Các mẹo tạo bài viết tốt</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Sử dụng chủ đề cụ thể và tập trung vào một nội dung chính</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Thêm từ khóa liên quan để cải thiện chất lượng SEO</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Chọn độ dài phù hợp với mục đích của bạn (bài dài thường tốt hơn cho SEO)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Điều chỉnh giọng điệu phù hợp với đối tượng mục tiêu của bạn</span>
                    </li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full" onClick={handleSubmit}>
                  Tạo bài viết mẫu
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
