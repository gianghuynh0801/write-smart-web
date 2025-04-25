
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type SmtpConfig } from "./types";

interface SmtpConfigFormProps {
  config: SmtpConfig;
  onChange: (config: SmtpConfig) => void;
}

export function SmtpConfigForm({ config, onChange }: SmtpConfigFormProps) {
  const handleChange = (field: keyof SmtpConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ ...config, [field]: e.target.value });
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="smtp-host">SMTP Host</Label>
          <Input 
            id="smtp-host"
            value={config.host}
            onChange={handleChange('host')}
            placeholder="smtp.gmail.com"
          />
        </div>
        <div>
          <Label htmlFor="smtp-port">SMTP Port</Label>
          <Input 
            id="smtp-port"
            value={config.port}
            onChange={handleChange('port')}
            placeholder="587"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="smtp-username">Tên đăng nhập</Label>
          <Input 
            id="smtp-username"
            value={config.username}
            onChange={handleChange('username')}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <Label htmlFor="smtp-password">Mật khẩu</Label>
          <Input 
            id="smtp-password"
            type="password"
            value={config.password}
            onChange={handleChange('password')}
            placeholder="••••••••"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="from-email">Email người gửi</Label>
          <Input 
            id="from-email"
            value={config.from_email}
            onChange={handleChange('from_email')}
            placeholder="no-reply@yourcompany.com"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Lưu ý: Nhiều máy chủ SMTP yêu cầu email người gửi phải khớp với email đăng nhập
          </p>
        </div>
        <div>
          <Label htmlFor="from-name">Tên người gửi</Label>
          <Input 
            id="from-name"
            value={config.from_name}
            onChange={handleChange('from_name')}
            placeholder="Your Company Name"
          />
        </div>
      </div>
    </div>
  );
}
