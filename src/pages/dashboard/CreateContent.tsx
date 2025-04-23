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
  Save,
  FileUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { generateContent } from "@/utils/webhookService";
import dynamic from "react-quill";
import RichTextEditor from "@/components/RichTextEditor";

interface OutlineItem {
  heading: "H2" | "H3";
  title: string;
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
  const [savedContent, setSavedContent] = useState("");

  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([
    { heading: "H2", title: "" }
  ]);

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

  const handleAddOutlineItem = () => {
    setOutlineItems([...outlineItems, { heading: "H2", title: "" }]);
  };

  const handleRemoveOutlineItem = (index: number) => {
    setOutlineItems(outlineItems.filter((_, i) => i !== index));
  };

  const handleOutlineItemChange = (index: number, field: keyof OutlineItem, value: string) => {
    const newItems = [...outlineItems];
    newItems[index] = { 
      ...newItems[index], 
      [field]: field === "heading" ? value : value 
    };
    setOutlineItems(newItems);
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

  const handleSave = () => {
    setSavedContent(editableContent);
    toast({
      title: "Đã lưu nháp",
      description: "Nội dung bài viết đã được lưu vào bộ nhớ tạm.",
    });
  };

  const handlePublish = () => {
    console.log("Nội dung sẽ đăng:", editableContent);
    toast({
      title: "Đăng bài viết",
      description: "Đã gửi nội dung lên hệ thống (demo - log ra console).",
    });
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
                  <div role="alert" className="flex items-start gap-3 p-5 rounded-lg bg-gray-100">
                    <svg 
                      stroke="currentColor" 
                      fill="currentColor" 
                      strokeWidth="0" 
                      viewBox="0 0 1024 1024" 
                      className="size-5 shrink-0 text-primary"
                      height="1em" 
                      width="1em" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z" />
                    </svg>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between gap-6">
                        <div className="space-y-1">
                          <p className="text-base font-medium tracking-tight text-gray-950">
                            Tùy chỉnh cấu trúc bài viết
                          </p>
                          <div className="text-sm font-normal text-gray-600">
                            Nếu bạn bỏ trống, thì AI sẽ tạo ra cấu trúc bài viết cho bạn
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="stucture-container mt-4 space-y-4">
                    {outlineItems.map((item, index) => (
                      <div key={index} className="flex gap-4 py-2 items-center">
                        <select
                          className="border border-gray-300 p-2 rounded-lg text-gray-950 shadow-xs text-base"
                          value={item.heading}
                          onChange={(e) => handleOutlineItemChange(index, "heading", e.target.value)}
                        >
                          <option value="H2">H2</option>
                          <option value="H3">H3</option>
                        </select>
                        <input
                          required
                          type="text"
                          placeholder="Nhập tiêu đề bạn muốn"
                          value={item.title}
                          onChange={(e) => handleOutlineItemChange(index, "title", e.target.value)}
                          className="border border-gray-300 p-2 block w-full rounded-lg text-gray-950 shadow-xs text-base"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => handleRemoveOutlineItem(index)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <g fill="none">
                              <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                              <path fill="currentColor" d="M14.28 2a2 2 0 0 1 1.897 1.368L16.72 5H20a1 1 0 1 1 0 2l-.003.071l-.867 12.143A3 3 0 0 1 16.138 22H7.862a3 3 0 0 1-2.992-2.786L4.003 7.07L4 7a1 1 0 0 1 0-2h3.28l.543-1.632A2 2 0 0 1 9.721 2zm3.717 5H6.003l.862 12.071a1 1 0 0 0 .997.929h8.276a1 1 0 0 0 .997-.929zM10 10a1 1 0 0 1 .993.883L11 11v5a1 1 0 0 1-1.993.117L9 16v-5a1 1 0 0 1 1-1m4 0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1m.28-6H9.72l-.333 1h5.226z" />
                            </g>
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="py-5">
                    <Button 
                      variant="link" 
                      className="text-primary hover:text-primary/90"
                      onClick={handleAddOutlineItem}
                    >
                      <svg 
                        stroke="currentColor" 
                        fill="currentColor" 
                        strokeWidth="0" 
                        viewBox="0 0 512 512" 
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M416 277.333H277.333V416h-42.666V277.333H96v-42.666h138.667V96h42.666v138.667H416v42.666z" />
                      </svg>
                      <span>Thêm cấu trúc</span>
                    </Button>
                  </div>
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
            <DialogDescription>
              Soạn thảo, lưu nháp hoặc đăng bài viết từ AI:
            </DialogDescription>
          </DialogHeader>
          <RichTextEditor
            value={editableContent}
            onChange={setEditableContent}
            placeholder="Nội dung bài viết ..."
            className="mb-2"
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Lưu bài viết
            </Button>
            <Button variant="default" onClick={handlePublish}>
              <FileUp className="w-4 h-4 mr-1" />
              Đăng bài viết
            </Button>
            <Button onClick={() => setOpenDialog(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateContent;
