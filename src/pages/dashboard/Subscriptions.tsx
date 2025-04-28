
import { useSubscription } from "./hooks/useSubscription";
import SubscriptionLayout from "./components/subscription/SubscriptionLayout";

const Subscriptions = () => {
  const {
    subscriptions,
    currentSubscription,
    isLoading,
    isUpdating,
    handleUpgrade,
    handleCancel
  } = useSubscription();

  return (
    <SubscriptionLayout
      isLoading={isLoading}
      isUpdating={isUpdating}
      currentSubscription={currentSubscription}
      subscriptions={subscriptions}
      handleUpgrade={handleUpgrade}
      handleCancel={handleCancel}
    />
  );
};

export default Subscriptions;
