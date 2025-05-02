
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PremiumUpgradeCardProps {
  onUpgrade?: () => void;
}

export const PremiumUpgradeCard: React.FC<PremiumUpgradeCardProps> = ({
  onUpgrade
}) => {
  // Safety check for the onUpgrade function
  const handleUpgrade = () => {
    if (typeof onUpgrade === 'function') {
      onUpgrade();
    }
  };

  return (
    <Card className="border-quiz-primary border-2 mb-8">
      <CardHeader className="bg-quiz-light">
        <CardTitle>Upgrade to Premium Report</CardTitle>
        <CardDescription>
          Get detailed insights and personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium">Detailed Analysis</h4>
              <p className="text-sm text-gray-500">
                Get in-depth analysis of your performance across all areas
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium">Personalized Recommendations</h4>
              <p className="text-sm text-gray-500">
                Receive custom recommendations based on your specific results
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium">Comparative Analysis</h4>
              <p className="text-sm text-gray-500">
                See how your results compare to others in your industry
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpgrade} className="w-full bg-quiz-primary hover:bg-quiz-secondary">
          Upgrade Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PremiumUpgradeCard;
