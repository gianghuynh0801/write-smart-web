
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
  activeTab: string;
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
  language: string;
  setLanguage: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  tone: string;
  setTone: (value: string) => void;
  narrator: string;
  setNarrator: (value: string) => void;
  formality: string;
  setFormality: (value: string) => void;
}

const ContentTabPanels = (props: ContentTabPanelsProps) => {
  return (
    <div className="flex-1">
      <KeywordsPanel
        activeTab={props.activeTab}
        mainKeyword={props.mainKeyword}
        setMainKeyword={props.setMainKeyword}
        subKeywords={props.subKeywords}
        setSubKeywords={props.setSubKeywords}
        relatedKeywords={props.relatedKeywords}
        setRelatedKeywords={props.setRelatedKeywords}
      />
      
      <OutlinePanel
        activeTab={props.activeTab}
        outlineItems={props.outlineItems}
        onOutlineChange={props.setOutlineItems}
      />
      
      <ContentPanel
        activeTab={props.activeTab}
        language={props.language}
        setLanguage={props.setLanguage}
        country={props.country}
        setCountry={props.setCountry}
        tone={props.tone}
        setTone={props.setTone}
        narrator={props.narrator}
        setNarrator={props.setNarrator}
        formality={props.formality}
        setFormality={props.setFormality}
      />

      <KnowledgePanel
        activeTab={props.activeTab}
        webConnection={props.webConnection}
        setWebConnection={props.setWebConnection}
        reference={props.reference}
        setReference={props.setReference}
      />

      <FormatPanel
        activeTab={props.activeTab}
        bold={props.bold}
        setBold={props.setBold}
        italic={props.italic}
        setItalic={props.setItalic}
        useList={props.useList}
        setUseList={props.setUseList}
      />

      <LinksPanel
        activeTab={props.activeTab}
        links={props.links}
        setLinks={props.setLinks}
      />

      <ImagesPanel
        activeTab={props.activeTab}
        imageSize={props.imageSize}
        setImageSize={props.setImageSize}
      />
    </div>
  );
};

export default ContentTabPanels;
