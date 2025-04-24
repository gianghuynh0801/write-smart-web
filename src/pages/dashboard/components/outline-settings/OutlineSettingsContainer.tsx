
import ContentOutline, { OutlineItem } from "../ContentOutline";

interface OutlineSettingsContainerProps {
  outlineItems: OutlineItem[];
  onOutlineChange: (items: OutlineItem[]) => void;
}

const OutlineSettingsContainer = (props: OutlineSettingsContainerProps) => {
  return (
    <ContentOutline
      outlineItems={props.outlineItems}
      onOutlineChange={props.onOutlineChange}
    />
  );
};

export default OutlineSettingsContainer;
