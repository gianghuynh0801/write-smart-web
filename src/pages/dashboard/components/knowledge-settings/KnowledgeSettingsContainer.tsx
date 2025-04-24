
import KnowledgePanel from "../KnowledgePanel";

interface KnowledgeSettingsContainerProps {
  webConnection: boolean;
  setWebConnection: (value: boolean) => void;
  reference: string;
  setReference: (value: string) => void;
}

const KnowledgeSettingsContainer = (props: KnowledgeSettingsContainerProps) => {
  return <KnowledgePanel {...props} />;
};

export default KnowledgeSettingsContainer;
