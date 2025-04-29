
import { Quiz, QuizResponse, QuizResult } from "@/types/quiz";

// Helper function to calculate category scores
export function calculateCategoryScores(quiz: Quiz, responses: QuizResponse[]) {
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
export function calculateResponseDistribution(quiz: Quiz, responses: QuizResponse[]) {
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
export function calculateMaxScore(quiz: Quiz) {
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

// Helper function to create CSV content for download
export function createCsvContent(quiz: Quiz, result: QuizResult): string {
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
  return [
    headers,
    ...rows
  ].map(row => row.join(',')).join('\n');
}
