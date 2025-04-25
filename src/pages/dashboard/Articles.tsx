import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Eye, Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Article {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  platform: string[];
  publish_history: {
    status: string;
    timestamp: number;
    platform: string[];
  }[];
}

const statusColors = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Đã lưu trữ",
};

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài viết",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArticles(articles.filter(article => article.id !== id));
      toast({
        title: "Thành công",
        description: "Đã xóa bài viết",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài viết",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return format(new Date(date), "dd/MM/yyyy HH:mm");
  };

  const formatPlatforms = (platforms: string[]) => {
    if (!platforms || platforms.length === 0) return "—";
    return platforms.join(", ");
  };

  const getLastPublishInfo = (history: Article['publish_history']) => {
    if (!history || history.length === 0) return null;
    const lastPublish = history
      .filter(h => h.status === 'published')
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    return lastPublish;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bài viết của tôi</h2>
          <p className="text-gray-500">Quản lý tất cả bài viết của bạn</p>
        </div>
        <Button onClick={() => navigate("/dashboard/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo bài viết mới
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Nền tảng</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Xuất bản</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    {article.title}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[article.status]}>
                    {statusLabels[article.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatPlatforms(article.platform)}</TableCell>
                <TableCell>{article.view_count}</TableCell>
                <TableCell>{formatDate(article.created_at)}</TableCell>
                <TableCell>{formatDate(article.published_at)}</TableCell>
                <TableCell>{formatDate(article.updated_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {articles.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Bạn chưa có bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Articles;
