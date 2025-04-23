
import { ReactNode } from "react";

interface ContentHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

const ContentHeader = ({ title, description, children }: ContentHeaderProps) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      <p className="text-gray-500 mb-6">{description}</p>
      {children}
    </div>
  );
};

export default ContentHeader;
