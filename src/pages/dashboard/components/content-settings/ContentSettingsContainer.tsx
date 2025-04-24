
import ContentSettings from "../ContentSettings";

interface ContentSettingsContainerProps {
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

const ContentSettingsContainer = (props: ContentSettingsContainerProps) => {
  return <ContentSettings {...props} />;
};

export default ContentSettingsContainer;
