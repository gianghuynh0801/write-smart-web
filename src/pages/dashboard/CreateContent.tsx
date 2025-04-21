import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Send,
  Key,
  LayoutList,
  FileText,
  Book,
  Text,
  Link as LinkIcon,
  Plus,
  Tag,
  List,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateContent } from "@/utils/webhookService";

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
    icon: LinkIcon,
  },
];

const SUB_KEY_LIMIT = 3;
const RELATED_KEY_LIMIT = 3;

const CreateContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [activeTab, setActiveTab] = useState(verticalTabs[0].value);
  const { toast } = useToast();

  const [mainKeyword, setMainKeyword] = useState("");
  const [subKeywords, setSubKeywords] = useState<string[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const [subKeywordInput, setSubKeywordInput] = useState("");
  const [relatedKeywordInput, setRelatedKeywordInput] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editableContent, setEditableContent] = useState("");

  const handleAddSubKeyword = () => {
    const trimmed = subKeywordInput.trim();
    if (!trimmed) return;
    if (subKeywords.includes(trimmed)) {
      setSubKeywordInput("");
      return;
    }
    if (subKeywords.length >= SUB_KEY_LIMIT) {
      toast({
        title: "Đã đạt giới hạn",
        description: "Bạn chỉ có thể thêm tối đa 3 từ khoá phụ.",
        variant: "destructive",
      });
      return;
    }
    setSubKeywords([...subKeywords, trimmed]);
    setSubKeywordInput("");
  };

  const handleRemoveSubKeyword = (keyword: string) => {
    setSubKeywords(subKeywords.filter((item) => item !== keyword));
  };

  const handleAddRelatedKeyword = () => {
    const trimmed = relatedKeywordInput.trim();
    if (!trimmed) return;
    if (relatedKeywords.includes(trimmed)) {
      setRelatedKeywordInput("");
      return;
    }
    if (relatedKeywords.length >= RELATED_KEY_LIMIT) {
      toast({
        title: "Đã đạt giới hạn",
        description: "Bạn chỉ có thể thêm tối đa 3 từ khoá liên quan.",
        variant: "destructive",
      });
      return;
    }
    setRelatedKeywords([...relatedKeywords, trimmed]);
    setRelatedKeywordInput("");
  };

  const handleRemoveRelatedKeyword = (keyword: string) => {
    setRelatedKeywords(relatedKeywords.filter((item) => item !== keyword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mainKeyword) {
      toast({
        title: "Thiếu từ khoá chính",
        description: "Vui lòng nhập từ khoá chính.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setEditableContent("");
    try {
      const params = {
        topic: mainKeyword,
        keywords: [mainKeyword, ...subKeywords, ...relatedKeywords].join(", "),
      };

      console.log("Gửi yêu cầu tạo nội dung với params:", params);
      
      const resp = await generateContent(
        params,
        "https://workflow.matbao.support/webhook-test/80808e9c-a56a-4b4f-83da-7710fae0bda7"
      );
      
      if (resp.status === "success" && resp.content) {
        setGeneratedContent(resp.content);
        setEditableContent(resp.content);
        toast({
          title: "Tạo nội dung thành công!",
          description: "Bài viết đã được tạo.",
        });
        setOpenDialog(true);
      } else {
        toast({
          title: "Lỗi",
          description: resp.error || "Đã xảy ra lỗi khi tạo nội dung!",
          variant: "destructive",
        });
        console.error("Lỗi từ webhook:", resp.error);
      }
    } catch (error) {
      console.error("Lỗi exception:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi gọi webhook.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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

                <div className="space-y-6 max-w-xl">
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
                    {Array.from({ length: subKeywords.length + (subKeywords.length < SUB_KEY_LIMIT ? 1 : 0) }).map((_, idx) => (
                      <div className="flex gap-2 mt-2" key={idx}>
                        {idx < subKeywords.length ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {subKeywords[idx]}
                            <Button variant="ghost" size="icon" type="button"
                              onClick={() => handleRemoveSubKeyword(subKeywords[idx])} className="ml-1 text-gray-500 hover:text-destructive"
                              aria-label="Xoá từ khoá phụ">
                              <List className="w-3 h-3" />
                            </Button>
                          </span>
                        ) : (
                          <>
                            <Input
                              id={"sub-keyword-input-row"}
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
                              disabled={subKeywords.length >= SUB_KEY_LIMIT}
                            />
                            <Button variant="ghost" type="button" onClick={handleAddSubKeyword} className="px-2"
                              disabled={subKeywords.length >= SUB_KEY_LIMIT}>
                              <Plus className="h-4 w-4" />
                              Thêm mới
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground ml-1">
                      Chúng tôi sẽ ép các từ khoá phụ này vào bài viết. Đảm bảo các từ khóa có liên quan đến chủ đề của bài viết và không chứa lỗi đánh máy.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="related-keyword">Từ khoá liên quan</Label>
                    {Array.from({ length: relatedKeywords.length + (relatedKeywords.length < RELATED_KEY_LIMIT ? 1 : 0) }).map((_, idx) => (
                      <div className="flex gap-2 mt-2" key={idx}>
                        {idx < relatedKeywords.length ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {relatedKeywords[idx]}
                            <Button variant="ghost" size="icon" type="button"
                              onClick={() => handleRemoveRelatedKeyword(relatedKeywords[idx])} className="ml-1 text-gray-500 hover:text-destructive"
                              aria-label="Xoá từ khoá liên quan">
                              <List className="w-3 h-3" />
                            </Button>
                          </span>
                        ) : (
                          <>
                            <Input
                              id={"related-keyword-input-row"}
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
                              disabled={relatedKeywords.length >= RELATED_KEY_LIMIT}
                            />
                            <Button variant="ghost" type="button" onClick={handleAddRelatedKeyword} className="px-2"
                              disabled={relatedKeywords.length >= RELATED_KEY_LIMIT}>
                              <Plus className="h-4 w-4" />
                              Thêm mới
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground ml-1">
                      Chúng tôi sẽ ép các từ khoá liên quan này vào bài viết. Đảm bảo các từ khóa có liên quan đến chủ đề của bài viết và không chứa lỗi đánh máy.
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="outline" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <LayoutList className="h-5 w-5 text-primary" /> Outline cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ tạo outline cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="content" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Nội dung cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ tạo nội dung cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="knowledge" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Book className="h-5 w-5 text-primary" /> Kiến thức cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ cung cấp kiến thức cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="format" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Text className="h-5 w-5 text-primary" /> Định dạng cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ định dạng cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="links" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" /> Liên kết cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ tạo liên kết cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="images" className="mt-0 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" /> Hình ảnh cho bài viết
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hệ thống sẽ tạo hình ảnh cho bài viết của bạn.
                  </p>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
      <div className="mt-8 flex justify-end w-full">
        <Button onClick={handleSubmit} className="flex items-center gap-2" disabled={isGenerating}>
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Tạo bài viết
        </Button>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bài viết đã tạo ({mainKeyword})</DialogTitle>
          </DialogHeader>
          <textarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            rows={18}
            className="w-full p-3 border rounded text-sm bg-background resize-y"
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateContent;
