
import FormatSettings from "../FormatSettings";

interface FormatSettingsContainerProps {
  bold: boolean;
  setBold: (value: boolean) => void;
  italic: boolean;
  setItalic: (value: boolean) => void;
  useList: boolean;
  setUseList: (value: boolean) => void;
}

const FormatSettingsContainer = (props: FormatSettingsContainerProps) => {
  return <FormatSettings {...props} />;
};

export default FormatSettingsContainer;
