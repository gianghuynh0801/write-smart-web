
import { ReactNode } from "react";

interface TabLayoutProps {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}

const TabLayout = ({ icon, title, description, children }: TabLayoutProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {children}
    </div>
  );
};

export default TabLayout;
