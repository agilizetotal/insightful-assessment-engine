
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Send, Download, Lock } from "lucide-react";
import ResultsChart from "./ResultsChart";
import { QuizResult, Quiz, QuizResponse, ProfileRange } from "@/types/quiz";

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
  // Find the profile range for this result
  const profileRange = quiz.profileRanges.find(range => 
    result.score >= range.min && result.score <= range.max
  );
  
  // Calculate category scores for radar chart
  const categoryScores = calculateCategoryScores(quiz, result.responses);
  
  // Convert responses to CSV for download
  const handleDownloadResults = () => {
    // Create CSV content
    const headers = ["Question", "Response", "Score"];
    const rows = result.responses.map(response => {
      const question = quiz.questions.find(q => q.id === response.questionId);
      let responseText = '';
      let score = 0;
      
      if (question?.type === 'multiple-choice') {
        const selectedOption = question.options?.find(opt => opt.id === response.answer);
        responseText = selectedOption?.text || '';
        score = selectedOption?.weight || 0;
      } else if (question?.type === 'checkbox') {
        const selectedOptions = question.options?.filter(opt => 
          (response.answer as string[]).includes(opt.id)
        );
        responseText = selectedOptions?.map(opt => opt.text).join(', ') || '';
        score = selectedOptions?.reduce((sum, opt) => sum + opt.weight, 0) || 0;
      } else {
        responseText = response.answer as string;
      }
      
      return [
        question?.text || '',
        responseText,
        score.toString()
      ];
    });
    
    // Add summary row
    rows.push(['', 'Total Score:', result.score.toString()]);
    rows.push(['', 'Profile:', result.profile]);
    
    // Convert to CSV
    const csv = [
      headers,
      ...rows
    ].map(row => row.join(',')).join('\n');
    
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
          Completed on {new Date(result.completedAt).toLocaleDateString()}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              onClick={handleDownloadResults}
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
              {/* Show just a preview of the score breakdown */}
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
                  {Math.round((result.responses.length / quiz.questions.length) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ResultsChart
          type="radar"
          title="Competency Areas"
          data={{
            labels: Object.keys(categoryScores),
            values: Object.values(categoryScores),
          }}
          downloadFileName="competency-areas"
        />
        
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
      )}
    </div>
  );
};

// Helper function to calculate category scores
function calculateCategoryScores(quiz: Quiz, responses: QuizResponse[]) {
  // This is a simplified implementation - in a real app,
  // you would likely categorize questions and calculate scores by category
  
  // For this demo, we'll create mock categories based on question indexes
  const categories: Record<string, number> = {
    'Leadership': 0,
    'Communication': 0,
    'Strategy': 0,
    'Execution': 0,
    'Innovation': 0
  };
  
  // Randomly assign questions to categories and calculate scores
  responses.forEach((response, index) => {
    const question = quiz.questions.find(q => q.id === response.questionId);
    if (!question) return;
    
    const categoryIndex = index % Object.keys(categories).length;
    const categoryName = Object.keys(categories)[categoryIndex];
    
    if (question.type === 'multiple-choice') {
      const selectedOption = question.options?.find(opt => opt.id === response.answer);
      if (selectedOption) {
        categories[categoryName] += selectedOption.weight;
      }
    } else if (question.type === 'checkbox') {
      const selectedOptions = question.options?.filter(opt => 
        (response.answer as string[]).includes(opt.id)
      );
      if (selectedOptions) {
        categories[categoryName] += selectedOptions.reduce((sum, opt) => sum + opt.weight, 0);
      }
    }
  });
  
  // Normalize scores to a 0-10 scale
  Object.keys(categories).forEach(key => {
    categories[key] = Math.min(10, Math.max(0, categories[key]));
  });
  
  return categories;
}

// Helper function to calculate response distribution
function calculateResponseDistribution(quiz: Quiz, responses: QuizResponse[]) {
  // This is a simplified implementation
  // We'll categorize responses into 4 buckets based on their weights
  
  const distribution = [0, 0, 0, 0]; // Strong, Moderate, Developing, Needs Work
  
  responses.forEach(response => {
    const question = quiz.questions.find(q => q.id === response.questionId);
    if (!question || question.type === 'open-ended') return;
    
    let weight = 0;
    
    if (question.type === 'multiple-choice') {
      const selectedOption = question.options?.find(opt => opt.id === response.answer);
      weight = selectedOption?.weight || 0;
    } else if (question.type === 'checkbox') {
      const selectedOptions = question.options?.filter(opt => 
        (response.answer as string[]).includes(opt.id)
      );
      weight = selectedOptions?.reduce((sum, opt) => sum + opt.weight, 0) || 0;
    }
    
    // Categorize based on weight
    // This logic would be more sophisticated in a real app
    const maxPossibleWeight = question.options?.reduce((max, opt) => 
      Math.max(max, opt.weight), 0
    ) || 0;
    
    const ratio = weight / (maxPossibleWeight || 1);
    
    if (ratio > 0.75) distribution[0]++; // Strong
    else if (ratio > 0.5) distribution[1]++; // Moderate
    else if (ratio > 0.25) distribution[2]++; // Developing
    else distribution[3]++; // Needs Work
  });
  
  return distribution;
}

// Helper function to calculate maximum possible score
function calculateMaxScore(quiz: Quiz) {
  let maxScore = 0;
  
  quiz.questions.forEach(question => {
    if (question.type === 'open-ended') return;
    
    if (question.type === 'multiple-choice') {
      const maxWeight = Math.max(...(question.options?.map(opt => opt.weight) || [0]));
      maxScore += maxWeight;
    } else if (question.type === 'checkbox') {
      const totalWeight = (question.options?.reduce((sum, opt) => sum + opt.weight, 0) || 0);
      maxScore += totalWeight;
    }
  });
  
  return maxScore;
}

export default ResultsSummary;
