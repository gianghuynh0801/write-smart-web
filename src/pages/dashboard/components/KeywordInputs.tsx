
import MainKeywordInput from "./keyword-inputs/MainKeywordInput";
import SubKeywordInput from "./keyword-inputs/SubKeywordInput";
import RelatedKeywordInput from "./keyword-inputs/RelatedKeywordInput";

interface KeywordInputsProps {
  mainKeyword: string;
  setMainKeyword: (value: string) => void;
  subKeywords: string[];
  setSubKeywords: (keywords: string[]) => void;
  relatedKeywords: string[];
  setRelatedKeywords: (keywords: string[]) => void;
}

const KeywordInputs = ({
  mainKeyword,
  setMainKeyword,
  subKeywords,
  setSubKeywords,
  relatedKeywords,
  setRelatedKeywords,
}: KeywordInputsProps) => {
  return (
    <div className="space-y-6 max-w-xl">
      <MainKeywordInput 
        mainKeyword={mainKeyword}
        setMainKeyword={setMainKeyword}
      />
      
      <SubKeywordInput
        subKeywords={subKeywords}
        setSubKeywords={setSubKeywords}
      />

      <RelatedKeywordInput
        relatedKeywords={relatedKeywords}
        setRelatedKeywords={setRelatedKeywords}
      />
    </div>
  );
};

export default KeywordInputs;
