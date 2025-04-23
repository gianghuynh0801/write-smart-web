
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "../contentData";

interface CountrySelectorProps {
  country: string;
  setCountry: (value: string) => void;
}

const CountrySelector = ({ country, setCountry }: CountrySelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="country">Quốc gia</Label>
      <Select value={country} onValueChange={setCountry}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn quốc gia" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Quốc gia mục tiêu mà nội dung sẽ tập trung hướng đến
      </p>
    </div>
  );
};

export default CountrySelector;
