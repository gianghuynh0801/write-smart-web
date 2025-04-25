
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function EmailVerificationToggle() {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggleChange = (checked: boolean) => {
    setIsEnabled(checked);
    // In the future, this could update user preferences
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="email-verification"
        checked={isEnabled}
        onCheckedChange={handleToggleChange}
      />
      <Label htmlFor="email-verification">
        Nhận thông báo qua email
      </Label>
    </div>
  );
}
