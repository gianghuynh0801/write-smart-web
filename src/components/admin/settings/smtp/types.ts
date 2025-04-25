
export interface SmtpConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  test_email?: string;
}

export interface TestResult {
  success?: boolean;
  message?: string;
}
