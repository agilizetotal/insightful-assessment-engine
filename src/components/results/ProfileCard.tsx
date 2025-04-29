
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, Send, Download, Lock } from "lucide-react";
import { Quiz, QuizResult, ProfileRange } from "@/types/quiz";

interface ProfileCardProps {
  quiz: Quiz;
  result: QuizResult;
  profileRange?: ProfileRange;
  onSendEmail?: () => void;
  onDownload: () => void;
  onUpgrade?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  quiz,
  result,
  profileRange,
  onSendEmail,
  onDownload,
  onUpgrade
}) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Based on your assessment responses</CardDescription>
          </div>
          <Badge className="bg-quiz-primary">{result.score} points</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-bold mb-3 text-quiz-primary">
          {profileRange?.profile || result.profile}
        </h3>
        <p className="mb-4">
          {profileRange?.description || "Your profile description is available in the full report."}
        </p>
        
        {!result.isPremium && (
          <Alert className="mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Limited Results</AlertTitle>
            <AlertDescription>
              Upgrade to access your complete assessment report with detailed insights and recommendations.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button 
          onClick={onDownload}
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Results
        </Button>
        
        {onSendEmail && (
          <Button 
            onClick={onSendEmail}
            variant="outline"
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Email Results
          </Button>
        )}
        
        {!result.isPremium && onUpgrade && (
          <Button 
            onClick={onUpgrade}
            size="sm"
          >
            <Lock className="h-4 w-4 mr-2" />
            Unlock Full Report
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProfileCard;
