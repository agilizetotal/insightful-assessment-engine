
import { QuizResponse, Quiz, GroupScore } from '@/types/quiz';

interface ScarfDimensions {
  status: number;
  certainty: number;
  autonomy: number;
  relatedness: number;
  fairness: number;
}

interface ScarfResult {
  fitScore: number;
  fitRange: string;
  leadershipProfile: string;
  userDimensions: ScarfDimensions;
  organizationDimensions: ScarfDimensions;
  groupScores: GroupScore[];
}

export const useScarfCalculation = () => {
  
  const calculateDimensionScore = (responses: QuizResponse[], startIndex: number, questionsPerDimension: number = 5): ScarfDimensions => {
    const dimensions = {
      status: 0,
      certainty: 0,
      autonomy: 0,
      relatedness: 0,
      fairness: 0
    };
    
    // Organizar perguntas por dimensão (5 perguntas cada)
    const dimensionNames = ['status', 'certainty', 'autonomy', 'relatedness', 'fairness'];
    
    dimensionNames.forEach((dimension, dimIndex) => {
      let dimensionTotal = 0;
      let dimensionCount = 0;
      
      for (let i = 0; i < questionsPerDimension; i++) {
        const questionIndex = startIndex + (dimIndex * questionsPerDimension) + i;
        const response = responses[questionIndex];
        
        if (response) {
          // As opções agora vão de 1 a 6
          const score = parseInt(response.answer as string) || 3;
          dimensionTotal += score;
          dimensionCount++;
        }
      }
      
      // Calcular média da dimensão
      if (dimensionCount > 0) {
        dimensions[dimension as keyof ScarfDimensions] = dimensionTotal / dimensionCount;
      }
    });
    
    return dimensions;
  };
  
  const calculateOrganizationDimensions = (responses: QuizResponse[]): ScarfDimensions => {
    // Calcular C-Level (perguntas 10-34, peso 65%)
    const clevelDimensions = calculateDimensionScore(responses, 10);
    
    // Calcular Líderes/Gestores (perguntas 35-59, peso 35%)
    const managersDimensions = calculateDimensionScore(responses, 35);
    
    // Aplicar pesos conforme especificação: C-Level 65%, Gestores 35%
    return {
      status: (clevelDimensions.status * 0.65) + (managersDimensions.status * 0.35),
      certainty: (clevelDimensions.certainty * 0.65) + (managersDimensions.certainty * 0.35),
      autonomy: (clevelDimensions.autonomy * 0.65) + (managersDimensions.autonomy * 0.35),
      relatedness: (clevelDimensions.relatedness * 0.65) + (managersDimensions.relatedness * 0.35),
      fairness: (clevelDimensions.fairness * 0.65) + (managersDimensions.fairness * 0.35)
    };
  };
  
  const calculateUserDimensions = (responses: QuizResponse[]): ScarfDimensions => {
    // Calcular perfil do usuário (perguntas 60-84)
    return calculateDimensionScore(responses, 60);
  };
  
  const calculateFitScore = (orgDimensions: ScarfDimensions, userDimensions: ScarfDimensions): number => {
    // Calcular diferença absoluta para cada dimensão
    const differences = {
      status: Math.abs(orgDimensions.status - userDimensions.status),
      certainty: Math.abs(orgDimensions.certainty - userDimensions.certainty),
      autonomy: Math.abs(orgDimensions.autonomy - userDimensions.autonomy),
      relatedness: Math.abs(orgDimensions.relatedness - userDimensions.relatedness),
      fairness: Math.abs(orgDimensions.fairness - userDimensions.fairness)
    };
    
    // Somar todas as diferenças
    const totalDifference = Object.values(differences).reduce((sum, diff) => sum + diff, 0);
    
    // Diferença máxima possível: 5 dimensões × 5 pontos máximos = 25
    const maxPossibleDifference = 25;
    
    // Score SCARF = 100 - (Diferença ponderada / Diferença máxima) * 100
    const fitScore = 100 - ((totalDifference / maxPossibleDifference) * 100);
    
    return Math.max(0, Math.min(100, fitScore));
  };
  
  const determineFitRange = (fitScore: number): string => {
    if (fitScore >= 85) return "Fit Excelente";
    if (fitScore >= 70) return "Fit Elevado";
    if (fitScore >= 55) return "Fit Moderado";
    if (fitScore >= 40) return "Fit em Desenvolvimento";
    return "Fit Desafiador";
  };
  
  const determineLeadershipProfile = (userDimensions: ScarfDimensions): string => {
    // Encontrar as duas dimensões mais altas
    const dimensionScores = [
      { name: 'Status', score: userDimensions.status },
      { name: 'Certainty', score: userDimensions.certainty },
      { name: 'Autonomy', score: userDimensions.autonomy },
      { name: 'Relatedness', score: userDimensions.relatedness },
      { name: 'Fairness', score: userDimensions.fairness }
    ];
    
    // Ordenar por pontuação decrescente
    dimensionScores.sort((a, b) => b.score - a.score);
    
    const top1 = dimensionScores[0].name;
    const top2 = dimensionScores[1].name;
    
    // Aplicar correlações específicas conforme modelo
    const combination = [top1, top2].sort().join(' + ');
    
    switch (combination) {
      case 'Certainty + Status':
        return 'Executivo/Tradicional';
      case 'Autonomy + Relatedness':
        return 'Colaborativo/Coach';
      case 'Autonomy + Certainty':
        return 'Visionário/Estratégico';
      case 'Autonomy + Status':
        return 'Transformacional/Disruptivo';
      case 'Fairness + Relatedness':
        return 'Liderança Servidora';
      case 'Fairness + Status':
        return 'Líder Justo/Ético';
      case 'Certainty + Relatedness':
        return 'Facilitador/Estável';
      case 'Autonomy + Fairness':
        return 'Inovador/Íntegro';
      case 'Certainty + Fairness':
        return 'Sistemático/Confiável';
      case 'Relatedness + Status':
        return 'Influenciador/Carismático';
      default:
        return `${top1}/${top2} Dominante`;
    }
  };
  
  const calculateScarfResult = (quiz: Quiz, responses: QuizResponse[]): ScarfResult => {
    console.log("Calculating SCARF result with", responses.length, "responses");
    
    // Calcular dimensões organizacionais (média ponderada C-Level + Gestores)
    const organizationDimensions = calculateOrganizationDimensions(responses);
    console.log("Organization dimensions:", organizationDimensions);
    
    // Calcular dimensões do usuário
    const userDimensions = calculateUserDimensions(responses);
    console.log("User dimensions:", userDimensions);
    
    // Calcular score de compatibilidade
    const fitScore = calculateFitScore(organizationDimensions, userDimensions);
    console.log("Fit score:", fitScore);
    
    // Determinar faixa e perfil
    const fitRange = determineFitRange(fitScore);
    const leadershipProfile = determineLeadershipProfile(userDimensions);
    
    // Criar group scores para visualização
    const groupScores: GroupScore[] = [
      {
        groupId: 'status',
        groupTitle: 'Status',
        score: Math.round(userDimensions.status * 10) / 10,
        maxScore: 6,
        percentage: (userDimensions.status / 6) * 100
      },
      {
        groupId: 'certainty',
        groupTitle: 'Certainty',
        score: Math.round(userDimensions.certainty * 10) / 10,
        maxScore: 6,
        percentage: (userDimensions.certainty / 6) * 100
      },
      {
        groupId: 'autonomy',
        groupTitle: 'Autonomy',
        score: Math.round(userDimensions.autonomy * 10) / 10,
        maxScore: 6,
        percentage: (userDimensions.autonomy / 6) * 100
      },
      {
        groupId: 'relatedness',
        groupTitle: 'Relatedness',
        score: Math.round(userDimensions.relatedness * 10) / 10,
        maxScore: 6,
        percentage: (userDimensions.relatedness / 6) * 100
      },
      {
        groupId: 'fairness',
        groupTitle: 'Fairness',
        score: Math.round(userDimensions.fairness * 10) / 10,
        maxScore: 6,
        percentage: (userDimensions.fairness / 6) * 100
      }
    ];
    
    return {
      fitScore: Math.round(fitScore),
      fitRange,
      leadershipProfile,
      userDimensions,
      organizationDimensions,
      groupScores
    };
  };
  
  return {
    calculateScarfResult
  };
};
