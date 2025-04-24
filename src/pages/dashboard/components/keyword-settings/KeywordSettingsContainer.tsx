
import KeywordInputs from "../KeywordInputs";

interface KeywordSettingsContainerProps {
  mainKeyword: string;
  setMainKeyword: (value: string) => void;
  subKeywords: string[];
  setSubKeywords: (keywords: string[]) => void;
  relatedKeywords: string[];
  setRelatedKeywords: (keywords: string[]) => void;
}

const KeywordSettingsContainer = (props: KeywordSettingsContainerProps) => {
  return <KeywordInputs {...props} />;
};

export default KeywordSettingsContainer;
