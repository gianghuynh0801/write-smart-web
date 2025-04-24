
export interface ContentGenerationParams {
  keywords: {
    main: string;
    sub: string[];
    related: string[];
  };
  outline: Array<{
    heading: "H2" | "H3";
    title: string;
  }>;
  knowledge: {
    webConnection: boolean;
    reference: string;
  };
  format: {
    bold: boolean;
    italic: boolean;
    useList: boolean;
  };
  links: Array<{
    keyword: string;
    url: string;
  }>;
  images: {
    size: string;
  };
  content?: {
    language: string;
    country: string;
    tone: string;
    narrator: string;
    formality: string;
  };
}

export interface WebhookResponse {
  status: 'success' | 'error';
  content?: string;
  error?: string;
  rawResponse?: any;
}
