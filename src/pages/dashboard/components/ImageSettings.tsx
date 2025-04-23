
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Image as ImageIcon, 
  ZoomIn,
  ImageDown,
} from "lucide-react";

interface ImageSettingsProps {
  imageSize: string;
  setImageSize: (size: string) => void;
  resolution: number;
  setResolution: (value: number) => void;
  keepAspectRatio: boolean;
  setKeepAspectRatio: (value: boolean) => void;
  optimizeImages: boolean;
  setOptimizeImages: (value: boolean) => void;
}

const ImageSettings = ({
  imageSize,
  setImageSize,
  resolution,
  setResolution,
  keepAspectRatio,
  setKeepAspectRatio,
  optimizeImages,
  setOptimizeImages,
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

      <div className="space-y-2">
        <Label className="text-base">Độ phân giải (DPI)</Label>
        <div className="flex flex-col space-y-4">
          <Slider
            value={[resolution]}
            onValueChange={(value) => setResolution(value[0])}
            max={300}
            min={72}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>72 DPI</span>
            <span>{resolution} DPI</span>
            <span>300 DPI</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Giữ tỷ lệ khung hình</Label>
            <p className="text-sm text-muted-foreground">
              Duy trì tỷ lệ gốc của hình ảnh
            </p>
          </div>
          <Switch
            checked={keepAspectRatio}
            onCheckedChange={setKeepAspectRatio}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Tối ưu hóa hình ảnh</Label>
            <p className="text-sm text-muted-foreground">
              Nén và tối ưu hóa hình ảnh để tăng tốc độ tải
            </p>
          </div>
          <Switch
            checked={optimizeImages}
            onCheckedChange={setOptimizeImages}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageSettings;
