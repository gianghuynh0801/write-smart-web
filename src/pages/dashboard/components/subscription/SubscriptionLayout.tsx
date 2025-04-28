
import React from "react";
import { Loader2 } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import SubscriptionHeader from "./SubscriptionHeader";
import CurrentSubscriptionCard from "../CurrentSubscriptionCard";
import SubscriptionPlansGrid from "../SubscriptionPlansGrid";
import PaymentHistoryCard from "../PaymentHistoryCard";

interface SubscriptionLayoutProps {
  isLoading: boolean;
  isUpdating: boolean;
  currentSubscription: any;
  subscriptions: any[];
  handleUpgrade: (planId: number) => void;
  handleCancel: () => void;
}

const SubscriptionLayout: React.FC<SubscriptionLayoutProps> = ({
  isLoading,
  isUpdating,
  currentSubscription,
  subscriptions,
  handleUpgrade,
  handleCancel,
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <SubscriptionHeader />
      
      {isUpdating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Đang xử lý...</p>
          </div>
        </div>
      )}
      
      <CurrentSubscriptionCard
        currentSubscription={currentSubscription}
        handleUpgrade={handleUpgrade}
        handleCancel={handleCancel}
      />
      
      <SubscriptionPlansGrid
        subscriptions={subscriptions}
        currentSubscription={currentSubscription}
        handleUpgrade={handleUpgrade}
      />
      
      <PaymentHistoryCard />
    </div>
  );
};

export default SubscriptionLayout;
