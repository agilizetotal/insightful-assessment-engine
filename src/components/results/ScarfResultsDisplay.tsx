
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quiz, QuizResult } from '@/types/quiz';
import { Progress } from '@/components/ui/progress';

interface ScarfResultsDisplayProps {
  quiz: Quiz;
  result: QuizResult;
}

export const ScarfResultsDisplay = ({ quiz, result }: ScarfResultsDisplayProps) => {
  // Extrair informações do perfil
  const [leadershipProfile, fitRange] = result.profile.includes('(') 
    ? result.profile.split(' (')
    : [result.profile, ''];
  
  const cleanFitRange = fitRange.replace(')', '');
  
  // Determinar cor baseada no FIT score
  const getFitColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };
  
  const getFitDescription = (score: number) => {
    if (score >= 80) return 'Excelente compatibilidade! Seu perfil está altamente alinhado com a liderança da organização.';
    if (score >= 60) return 'Boa compatibilidade com algumas oportunidades de desenvolvimento específico.';
    if (score >= 40) return 'Compatibilidade moderada - há áreas importantes que podem ser desenvolvidas.';
    return 'Baixa compatibilidade - recomenda-se revisão estratégica e desenvolvimento focado.';
  };
  
  return (
    <div className="space-y-6">
      {/* Score Principal */}
      <Card className={`border-2 ${getFitColor(result.score)}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Score de Compatibilidade (FIT)</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl font-bold">{result.score}%</div>
          <div className="text-xl font-semibold">{cleanFitRange}</div>
          <Progress value={result.score} className="w-full h-3" />
          <p className="text-sm mt-4">{getFitDescription(result.score)}</p>
        </CardContent>
      </Card>

      {/* Perfil de Liderança */}
      <Card>
        <CardHeader>
          <CardTitle>Seu Perfil de Liderança Preferido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-4">{leadershipProfile}</div>
            <p className="text-gray-600">
              Este perfil é baseado nas suas duas dimensões SCARF dominantes. 
              Representa o estilo de liderança com o qual você se sente mais confortável e efetivo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dimensões SCARF */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Dimensões SCARF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.groupScores?.map((group) => (
              <div key={group.groupId}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{group.groupTitle}</span>
                  <span className="text-sm text-gray-500">
                    {group.score}/{group.maxScore} ({Math.round(group.percentage)}%)
                  </span>
                </div>
                <Progress value={group.percentage} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {getDimensionDescription(group.groupTitle)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getRecommendations(result.score, result.groupScores || []).map((rec, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const getDimensionDescription = (dimension: string) => {
  switch (dimension) {
    case 'Status':
      return 'Seu senso de importância, reconhecimento e posição relativa';
    case 'Certainty':
      return 'Sua necessidade de clareza, previsibilidade e segurança';
    case 'Autonomy':
      return 'Seu desejo de controle, liberdade e autodeterminação';
    case 'Relatedness':
      return 'Sua necessidade de conexão, pertencimento e relacionamentos';
    case 'Fairness':
      return 'Sua necessidade de justiça, equidade e transparência';
    default:
      return '';
  }
};

const getRecommendations = (fitScore: number, groupScores: any[]) => {
  const recommendations = [];
  
  if (fitScore < 60) {
    recommendations.push('Considere desenvolver maior flexibilidade nas dimensões onde há maior diferença com a organização');
    recommendations.push('Busque oportunidades de diálogo com líderes para entender melhor as expectativas organizacionais');
  }
  
  if (fitScore >= 80) {
    recommendations.push('Mantenha o alinhamento atual e considere se tornar um mentor para outros líderes');
    recommendations.push('Explore oportunidades de liderança de maior complexidade e responsabilidade');
  }
  
  // Recomendações baseadas nas dimensões mais baixas
  const sortedDimensions = [...groupScores].sort((a, b) => a.percentage - b.percentage);
  const lowestDimension = sortedDimensions[0];
  
  if (lowestDimension && lowestDimension.percentage < 60) {
    switch (lowestDimension.groupTitle) {
      case 'Status':
        recommendations.push('Trabalhe no desenvolvimento da sua confiança e presença de liderança');
        break;
      case 'Certainty':
        recommendations.push('Pratique a comunicação clara e o planejamento estratégico');
        break;
      case 'Autonomy':
        recommendations.push('Desenvolva habilidades de delegação e empowerment de equipes');
        break;
      case 'Relatedness':
        recommendations.push('Invista no desenvolvimento de relacionamentos e habilidades interpessoais');
        break;
      case 'Fairness':
        recommendations.push('Aprimore processos de tomada de decisão transparente e inclusiva');
        break;
    }
  }
  
  return recommendations;
};

export default ScarfResultsDisplay;
