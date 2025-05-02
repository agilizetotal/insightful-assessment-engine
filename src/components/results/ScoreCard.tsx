
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Quiz, QuizResult } from "@/types/quiz";

interface ScoreCardProps {
  quiz: Quiz;
  result: QuizResult;
  calculateMaxScore: (quiz: Quiz) => number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  quiz,
  result,
  calculateMaxScore
}) => {
  // Ensure quiz and result exist before rendering
  if (!quiz || !result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center h-[300px]">
          <div className="text-center">Loading score data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center h-[300px]">
        <div className="text-center mb-2">
          <div className="text-5xl font-bold text-quiz-primary">{result.score}</div>
          <div className="text-sm text-gray-500">Total Score</div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Max Possible:</span>
            <span className="font-medium">{calculateMaxScore(quiz)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Questions Answered:</span>
            <span className="font-medium">{result.responses.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Completion:</span>
            <span className="font-medium">
              {Math.round((result.responses.length / (quiz?.questions?.length || 1)) * 100)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
