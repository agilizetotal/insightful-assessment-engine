
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PremiumUpgradeCardProps {
  onUpgrade: () => void;
}

export const PremiumUpgradeCard: React.FC<PremiumUpgradeCardProps> = ({
  onUpgrade
}) => {
  return (
    <Card className="border-quiz-primary border-2 mb-8">
      <CardHeader className="bg-quiz-light">
        <CardTitle className="text-quiz-primary">Unlock Your Full Assessment Report</CardTitle>
        <CardDescription>
          Get detailed insights, personalized recommendations, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-quiz-primary">✓</div>
              <div>Detailed breakdown of all competency areas</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-quiz-primary">✓</div>
              <div>Personalized improvement recommendations</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-quiz-primary">✓</div>
              <div>Comparison with industry benchmarks</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-quiz-primary">✓</div>
              <div>Exportable PDF report with all insights</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-quiz-primary">✓</div>
              <div>Action plan based on your results</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-quiz-primary">✓</div>
              <div>Email delivery of your complete report</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onUpgrade} className="w-full bg-quiz-primary hover:bg-quiz-secondary">
          Upgrade Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PremiumUpgradeCard;
