
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Quiz, QuizResult } from "@/types/quiz";
import ResultsChart from "./ResultsChart";
import ProfileCard from "./results/ProfileCard";
import ScoreCard from "./results/ScoreCard";
import PremiumUpgradeCard from "./results/PremiumUpgradeCard";
import { 
  calculateCategoryScores, 
  calculateResponseDistribution,
  calculateMaxScore,
  createCsvContent
} from "@/utils/resultsHelpers";

interface ResultsSummaryProps {
  quiz: Quiz;
  result: QuizResult;
  onSendEmail?: () => void;
  onUpgrade?: () => void;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  quiz,
  result,
  onSendEmail,
  onUpgrade
}) => {
  // Early return with an error message if quiz or result is missing
  if (!quiz || !result) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <CardContent>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Results Unavailable</h2>
              <p>The quiz or result data could not be loaded. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Find the profile range for this result
  const profileRange = quiz.profileRanges?.find(range => 
    result.score >= range.min && result.score <= range.max
  );
  
  // Calculate category scores for radar chart
  const categoryScores = calculateCategoryScores(quiz, result.responses);
  
  // Convert responses to CSV for download
  const handleDownloadResults = () => {
    const csv = createCsvContent(quiz, result);
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `quiz-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Your Assessment Results</h1>
        <p className="text-gray-500">
          Completed on {new Date(result.completedAt || new Date()).toLocaleDateString()}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ProfileCard 
          quiz={quiz}
          result={result}
          profileRange={profileRange}
          onSendEmail={onSendEmail}
          onDownload={handleDownloadResults}
          onUpgrade={onUpgrade}
        />
        
        <ScoreCard 
          quiz={quiz}
          result={result}
          calculateMaxScore={calculateMaxScore}
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Object.keys(categoryScores).length > 0 && (
          <ResultsChart
            type="radar"
            title="Competency Areas"
            data={{
              labels: Object.keys(categoryScores),
              values: Object.values(categoryScores),
            }}
            downloadFileName="competency-areas"
          />
        )}
        
        <ResultsChart
          type="bar"
          title="Response Distribution"
          data={{
            labels: ["Strong", "Moderate", "Developing", "Needs Work"],
            values: calculateResponseDistribution(quiz, result.responses),
          }}
          downloadFileName="response-distribution"
        />
      </div>
      
      {/* Premium Upgrade Card */}
      {!result.isPremium && onUpgrade && (
        <PremiumUpgradeCard onUpgrade={onUpgrade} />
      )}
    </div>
  );
};

export default ResultsSummary;
