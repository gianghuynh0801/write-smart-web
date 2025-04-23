
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type PlanDB = {
  id: number;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string;
};

interface GridProps {
  subscriptions: PlanDB[];
  currentSubscription: { plan: string };
  handleUpgrade: (planName: string) => void;
}

const SubscriptionPlansGrid = ({ subscriptions, currentSubscription, handleUpgrade }: GridProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Tất cả gói đăng ký</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {subscriptions.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden cursor-pointer transition-all ${
              currentSubscription.plan === plan.name
                ? 'ring-2 ring-primary'
                : 'hover:shadow-md'
            } ${plan.name === 'Chuyên nghiệp' ? 'shadow-md' : ''}`}
          >
            {plan.name === 'Chuyên nghiệp' && (
              <div className="absolute top-0 right-0 bg-primary text-white text-xs py-1 px-3 rounded-bl-lg">
                Phổ biến
              </div>
            )}
            {currentSubscription.plan === plan.name && (
              <div className="absolute top-0 right-0 bg-green-600 text-white text-xs py-1 px-3 rounded-bl-lg">
                Gói hiện tại
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="mb-4">
                <span className="text-2xl font-bold">{plan.price.toLocaleString()}đ</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              <ul className="space-y-2 text-sm">
                {JSON.parse(plan.features).map((feature: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentSubscription.plan === plan.name ? (
                <div className="w-full p-2 bg-green-50 text-green-700 font-medium rounded-md text-center">
                  Gói hiện tại
                </div>
              ) : (
                <Button
                  variant={plan.name === "Doanh nghiệp" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {currentSubscription.plan === "Doanh nghiệp"
                    ? "Hạ cấp xuống gói này"
                    : plan.name === "Doanh nghiệp"
                      ? "Nâng cấp lên gói này"
                      : "Chuyển sang gói này"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlansGrid;
