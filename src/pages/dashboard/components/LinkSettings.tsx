
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Plus } from "lucide-react";

interface Link {
  keyword: string;
  url: string;
}

interface LinkSettingsProps {
  links: Link[];
  setLinks: (links: Link[]) => void;
}

const LinkSettings = ({ links, setLinks }: LinkSettingsProps) => {
  const MAX_LINKS = 3;

  const handleAddLink = () => {
    if (links.length < MAX_LINKS) {
      setLinks([...links, { keyword: "", url: "" }]);
    }
  };

  const handleLinkChange = (index: number, field: keyof Link, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-base font-medium" htmlFor="links">
          Danh sách liên kết
        </label>
        <div className="space-y-4 mt-2" id="links-container">
          {links.map((link, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Từ khóa
                </label>
                <Input
                  type="text"
                  value={link.keyword}
                  onChange={(e) => handleLinkChange(index, "keyword", e.target.value)}
                  placeholder="Từ khóa"
                  name={`link_keywords[${index}]`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Liên kết
                </label>
                <Input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                  placeholder="Liên kết"
                  name={`link_urls[${index}]`}
                />
              </div>
            </div>
          ))}
        </div>

        {links.length < MAX_LINKS && (
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleAddLink}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm liên kết
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkSettings;
