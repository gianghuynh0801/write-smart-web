
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon } from "lucide-react";

interface ImageSettingsProps {
  imageSize: string;
  setImageSize: (size: string) => void;
}

const ImageSettings = ({
  imageSize,
  setImageSize,
}: ImageSettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-base">Kích thước hình ảnh</Label>
        <RadioGroup
          value={imageSize}
          onValueChange={setImageSize}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { value: "small", label: "Nhỏ (640x480)", icon: ImageIcon },
            { value: "medium", label: "Trung bình (1280x720)", icon: ImageIcon },
            { value: "large", label: "Lớn (1920x1080)", icon: ImageIcon },
          ].map(({ value, label, icon: Icon }) => (
            <div
              key={value}
              className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
            >
              <RadioGroupItem value={value} id={value} />
              <Label htmlFor={value} className="flex items-center gap-2 cursor-pointer">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default ImageSettings;
