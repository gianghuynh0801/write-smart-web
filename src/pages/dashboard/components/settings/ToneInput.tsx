
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ToneInputProps {
  tone: string;
  setTone: (value: string) => void;
}

const ToneInput = ({ tone, setTone }: ToneInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="tone">Giọng nói</Label>
      <Input
        id="tone"
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        placeholder="Ví dụ: Trung lập"
        maxLength={80}
      />
      <p className="text-sm text-muted-foreground">
        Ví dụ: vui vẻ, trung lập, học thuật
      </p>
    </div>
  );
};

export default ToneInput;
