
import { TabsContent } from "@/components/ui/tabs";
import { OutlineItem } from "./ContentOutline";
import KeywordsPanel from "./tab-panels/KeywordsPanel";
import OutlinePanel from "./tab-panels/OutlinePanel";
import ContentPanel from "./tab-panels/ContentPanel";
import KnowledgePanel from "./tab-panels/KnowledgePanel";
import FormatPanel from "./tab-panels/FormatPanel";
import LinksPanel from "./tab-panels/LinksPanel";
import ImagesPanel from "./tab-panels/ImagesPanel";

interface ContentTabPanelsProps {
  mainKeyword: string;
  setMainKeyword: (value: string) => void;
  subKeywords: string[];
  setSubKeywords: (keywords: string[]) => void;
  relatedKeywords: string[];
  setRelatedKeywords: (keywords: string[]) => void;
  outlineItems: OutlineItem[];
  setOutlineItems: (items: OutlineItem[]) => void;
  webConnection: boolean;
  setWebConnection: (value: boolean) => void;
  reference: string;
  setReference: (value: string) => void;
  bold: boolean;
  setBold: (value: boolean) => void;
  italic: boolean;
  setItalic: (value: boolean) => void;
  useList: boolean;
  setUseList: (value: boolean) => void;
  links: Array<{ keyword: string; url: string }>;
  setLinks: (links: Array<{ keyword: string; url: string }>) => void;
  imageSize: string;
  setImageSize: (size: string) => void;
  resolution: number;
  setResolution: (value: number) => void;
  keepAspectRatio: boolean;
  setKeepAspectRatio: (value: boolean) => void;
  optimizeImages: boolean;
  setOptimizeImages: (value: boolean) => void;
}

const ContentTabPanels = (props: ContentTabPanelsProps) => {
  return (
    <div className="flex-1">
      <KeywordsPanel
        mainKeyword={props.mainKeyword}
        setMainKeyword={props.setMainKeyword}
        subKeywords={props.subKeywords}
        setSubKeywords={props.setSubKeywords}
        relatedKeywords={props.relatedKeywords}
        setRelatedKeywords={props.setRelatedKeywords}
      />
      
      <OutlinePanel
        outlineItems={props.outlineItems}
        onOutlineChange={props.setOutlineItems}
      />
      
      <ContentPanel
        language="vi"
        setLanguage={() => {}}
        country="vn"
        setCountry={() => {}}
        tone="Neutral"
        setTone={() => {}}
        narrator="tự động"
        setNarrator={() => {}}
        formality="tự động"
        setFormality={() => {}}
      />

      <KnowledgePanel
        webConnection={props.webConnection}
        setWebConnection={props.setWebConnection}
        reference={props.reference}
        setReference={props.setReference}
      />

      <FormatPanel
        bold={props.bold}
        setBold={props.setBold}
        italic={props.italic}
        setItalic={props.setItalic}
        useList={props.useList}
        setUseList={props.setUseList}
      />

      <LinksPanel
        links={props.links}
        setLinks={props.setLinks}
      />

      <ImagesPanel
        imageSize={props.imageSize}
        setImageSize={props.setImageSize}
      />
    </div>
  );
};

export default ContentTabPanels;
