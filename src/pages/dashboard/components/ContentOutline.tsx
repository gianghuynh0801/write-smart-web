
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface OutlineItem {
  heading: "H2" | "H3";
  title: string;
}

interface ContentOutlineProps {
  outlineItems: OutlineItem[];
  onOutlineChange: (items: OutlineItem[]) => void;
}

const ContentOutline = ({ outlineItems, onOutlineChange }: ContentOutlineProps) => {
  const handleAddOutlineItem = () => {
    onOutlineChange([...outlineItems, { heading: "H2", title: "" }]);
  };

  const handleRemoveOutlineItem = (index: number) => {
    onOutlineChange(outlineItems.filter((_, i) => i !== index));
  };

  const handleOutlineItemChange = (index: number, field: keyof OutlineItem, value: string) => {
    const newItems = [...outlineItems];
    newItems[index] = { 
      ...newItems[index], 
      [field]: field === "heading" ? value : value 
    };
    onOutlineChange(newItems);
  };

  return (
    <div>
      <div role="alert" className="flex items-start gap-3 p-5 rounded-lg bg-gray-100">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" className="size-5 shrink-0 text-primary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"></path>
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
          <Plus className="h-4 w-4" />
          <span>Thêm cấu trúc</span>
        </Button>
      </div>
    </div>
  );
};

export default ContentOutline;
