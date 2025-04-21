import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Send,
  Shuffle,
  FileText,
  Facebook,
  Globe,
  Image,
  Key,
  LayoutList,
  Book,
  Text,
  Link as LinkIcon,
  Plus,
  Tag,
  List,
  Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const illustrationImages = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80",
];

function getRandomImage() {
  return illustrationImages[Math.floor(Math.random() * illustrationImages.length)];
}

const verticalTabs = [
  {
    value: "keywords",
    label: "Từ khoá",
    icon: Key,
  },
  {
    value: "outline",
    label: "Outline",
    icon: LayoutList,
  },
  {
    value: "content",
    label: "Nội dung",
    icon: FileText,
  },
  {
    value: "knowledge",
    label: "Kiến thức",
    icon: Book,
  },
  {
    value: "format",
    label: "Định dạng",
    icon: Text,
  },
  {
    value: "links",
    label: "Liên kết",
    icon: LinkIcon,
  },
  {
    value: "images",
    label: "Hình ảnh",
    icon: Image,
  },
];

const CreateContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [formData, setFormData] = useState({
    topic: "",
    keywords: "",
    length: "medium",
    tone: "professional",
    language: "vietnamese",
  });
  const [activeTab, setActiveTab] = useState(verticalTabs[0].value);
  const [illustrationUrl, setIllustrationUrl] = useState(getRandomImage());
  const { toast } = useToast();

  const [mainKeyword, setMainKeyword] = useState("");
  const [subKeywords, setSubKeywords] = useState<string[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const [subKeywordInput, setSubKeywordInput] = useState("");
  const [relatedKeywordInput, setRelatedKeywordInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.topic) {
      toast({
        title: "Chủ đ��� trống",
        description: "Vui lòng nhập chủ đề cho bài viết của bạn.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      setTimeout(() => {
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

  const handleRandomTopic = () => {
    const randomTopics = [
      "Cách tối ưu SEO cho website",
      "Chiến lược content marketing hiệu quả",
      "Hướng dẫn xây dựng thương hiệu cá nhân",
      "Các xu hướng digital marketing năm 2023",
    ];
    const randomTopic =
      randomTopics[Math.floor(Math.random() * randomTopics.length)];
    setFormData((prev) => ({ ...prev, topic: randomTopic }));
    setIllustrationUrl(getRandomImage());
  };

  const handleTopicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    if (e.target.value.trim() === "") {
      setIllustrationUrl(getRandomImage());
    }
  };

  const handleAddSubKeyword = () => {
    if (subKeywordInput.trim() && !subKeywords.includes(subKeywordInput.trim())) {
      setSubKeywords([...subKeywords, subKeywordInput.trim()]);
      setSubKeywordInput("");
    }
  };

  const handleRemoveSubKeyword = (keyword: string) => {
    setSubKeywords(subKeywords.filter((item) => item !== keyword));
  };

  const handleAddRelatedKeyword = () => {
    if (relatedKeywordInput.trim() && !relatedKeywords.includes(relatedKeywordInput.trim())) {
      setRelatedKeywords([...relatedKeywords, relatedKeywordInput.trim()]);
      setRelatedKeywordInput("");
    }
  };

  const handleRemoveRelatedKeyword = (keyword: string) => {
    setRelatedKeywords(relatedKeywords.filter((item) => item !== keyword));
  };

  return (
    <div className="w-full min-h-screen py-8 px-2 md:px-10 flex flex-col bg-background">
      <h1 className="text-2xl font-bold mb-1">Tạo nội dung</h1>
      <p className="text-gray-500 mb-6">Tạo bài viết chuẩn SEO với công nghệ AI</p>
      
      <div className="flex flex-col md:flex-row gap-6">
        <Tabs 
          orientation="vertical" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex flex-col md:flex-row gap-6"
        >
          <TabsList className="flex flex-col h-auto w-56 bg-muted/70 p-1.5 rounded-xl shadow">
            {verticalTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex items-center justify-start gap-2 mb-1 px-4 py-3 text-left text-base",
                  activeTab === tab.value ? "bg-background text-primary font-medium" : ""
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex flex-1 flex-col md:flex-row gap-6">
            <div className="flex-1">
              <TabsContent value="keywords" className="mt-0 animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" /> Từ khoá cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ ép các từ khoá này vào phần ai tạo. Đảm bảo các từ khóa có liên quan đến chủ đề của bài viết.
                  </p>
                </div>

                <form className="space-y-6 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="main-keyword">Từ khoá chính <span className="text-destructive">*</span></Label>
                    <Input
                      id="main-keyword"
                      name="main-keyword"
                      placeholder="Nhập từ khoá chính"
                      value={mainKeyword}
                      onChange={(e) => setMainKeyword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground ml-1">
                      Bài viết sẽ tập trung vào từ khoá này.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sub-keyword">Từ khoá phụ</Label>
                    <div className="flex gap-2">
                      <Input
                        id="sub-keyword"
                        name="sub-keyword"
                        placeholder="Nhập từ khoá phụ"
                        value={subKeywordInput}
                        onChange={(e) => setSubKeywordInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSubKeyword();
                          }
                        }}
                      />
                      <Button variant="ghost" type="button" onClick={handleAddSubKeyword} className="px-2">
                        <Plus className="h-4 w-4" />
                        Thêm mới
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {subKeywords.map(keyword => (
                        <span key={keyword} className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {keyword}
                          <Button variant="ghost" size="icon" type="button"
                            onClick={() => handleRemoveSubKeyword(keyword)} className="ml-1 text-gray-500 hover:text-destructive"
                            aria-label="Xoá từ khoá phụ">
                            <List className="w-3 h-3" />
                          </Button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground ml-1">
                      Chúng tôi sẽ ép các từ khoá phụ này vào bài viết. Đảm bảo các từ khóa có liên quan đến chủ đề của bài viết và không chứa lỗi đánh máy.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="related-keyword">Từ khoá liên quan</Label>
                    <div className="flex gap-2">
                      <Input
                        id="related-keyword"
                        name="related-keyword"
                        placeholder="Nhập từ khoá liên quan"
                        value={relatedKeywordInput}
                        onChange={(e) => setRelatedKeywordInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddRelatedKeyword();
                          }
                        }}
                      />
                      <Button variant="ghost" type="button" onClick={handleAddRelatedKeyword} className="px-2">
                        <Plus className="h-4 w-4" />
                        Thêm mới
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {relatedKeywords.map(keyword => (
                        <span key={keyword} className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {keyword}
                          <Button variant="ghost" size="icon" type="button"
                            onClick={() => handleRemoveRelatedKeyword(keyword)} className="ml-1 text-gray-500 hover:text-destructive"
                            aria-label="Xoá từ khoá liên quan">
                            <List className="w-3 h-3" />
                          </Button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground ml-1">
                      Chúng tôi sẽ ép các từ khoá liên quan này vào bài viết. Đảm bảo các từ khóa có liên quan đến chủ đề của bài viết và không chứa lỗi đánh máy.
                    </p>
                  </div>
                </form>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      <div className="mt-10 w-full grid md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 bg-card border rounded-xl shadow px-6 py-8">
              <div className="space-y-2">
                <Label htmlFor="topic">Chủ đề</Label>
                <Input
                  id="topic"
                  name="topic"
                  placeholder="Nhập chủ đề bài viết"
                  value={formData.topic}
                  onChange={handleTopicInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Độ dài</Label>
                  <select
                    id="length"
                    name="length"
                    className="input w-full border border-input rounded-md px-3 py-2 text-sm"
                    value={formData.length}
                    onChange={e => handleSelectChange("length", e.target.value)}
                  >
                    <option value="short">Ngắn (500 từ)</option>
                    <option value="medium">Trung bình (1000 từ)</option>
                    <option value="long">Dài (2000 từ)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Giọng điệu</Label>
                  <select
                    id="tone"
                    name="tone"
                    className="input w-full border border-input rounded-md px-3 py-2 text-sm"
                    value={formData.tone}
                    onChange={e => handleSelectChange("tone", e.target.value)}
                  >
                    <option value="professional">Chuyên nghiệp</option>
                    <option value="casual">Thân thiện</option>
                    <option value="formal">Trang trọng</option>
                    <option value="persuasive">Thuyết phục</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Ngôn ngữ</Label>
                <select
                  id="language"
                  name="language"
                  className="input w-full border border-input rounded-md px-3 py-2 text-sm"
                  value={formData.language}
                  onChange={e => handleSelectChange("language", e.target.value)}
                >
                  <option value="vietnamese">Tiếng Việt</option>
                  <option value="english">Tiếng Anh</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button type="button" variant="outline" onClick={handleRandomTopic}>
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
              </div>
            </div>
          </form>
        </div>
        <div>
          <div className={`${!generatedContent && 'hidden'}`}>
            <div className="bg-card border rounded-xl shadow px-6 py-6 mb-4">
              <h3 className="text-lg font-semibold mb-2">Bài viết đã tạo</h3>
              <div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
