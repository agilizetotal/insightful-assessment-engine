
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
  
  const calculateDimensionScore = (responses: QuizResponse[], startIndex: number, weight: number = 1): ScarfDimensions => {
    const dimensions = {
      status: 0,
      certainty: 0,
      autonomy: 0,
      relatedness: 0,
      fairness: 0
    };
    
    // Status: perguntas 0-4
    for (let i = 0; i < 5; i++) {
      const response = responses[startIndex + i];
      if (response) {
        dimensions.status += (parseInt(response.answer as string) || 3) * weight;
      }
    }
    
    // Certainty: perguntas 5-9
    for (let i = 5; i < 10; i++) {
      const response = responses[startIndex + i];
      if (response) {
        dimensions.certainty += (parseInt(response.answer as string) || 3) * weight;
      }
    }
    
    // Autonomy: perguntas 10-14
    for (let i = 10; i < 15; i++) {
      const response = responses[startIndex + i];
      if (response) {
        dimensions.autonomy += (parseInt(response.answer as string) || 3) * weight;
      }
    }
    
    // Relatedness: perguntas 15-19
    for (let i = 15; i < 20; i++) {
      const response = responses[startIndex + i];
      if (response) {
        dimensions.relatedness += (parseInt(response.answer as string) || 3) * weight;
      }
    }
    
    // Fairness: perguntas 20-24
    for (let i = 20; i < 25; i++) {
      const response = responses[startIndex + i];
      if (response) {
        dimensions.fairness += (parseInt(response.answer as string) || 3) * weight;
      }
    }
    
    return dimensions;
  };
  
  const calculateOrganizationDimensions = (responses: QuizResponse[]): ScarfDimensions => {
    // Calcular C-Level (peso 2) - perguntas 10-34
    const clevelDimensions = calculateDimensionScore(responses, 10, 2);
    
    // Calcular Gestores (peso 1) - perguntas 35-59
    const managersDimensions = calculateDimensionScore(responses, 35, 1);
    
    // Somar as dimensões
    return {
      status: clevelDimensions.status + managersDimensions.status,
      certainty: clevelDimensions.certainty + managersDimensions.certainty,
      autonomy: clevelDimensions.autonomy + managersDimensions.autonomy,
      relatedness: clevelDimensions.relatedness + managersDimensions.relatedness,
      fairness: clevelDimensions.fairness + managersDimensions.fairness
    };
  };
  
  const calculateUserDimensions = (responses: QuizResponse[]): ScarfDimensions => {
    // Calcular perfil do usuário - perguntas 60-84
    return calculateDimensionScore(responses, 60, 1);
  };
  
  const calculateFitScore = (orgDimensions: ScarfDimensions, userDimensions: ScarfDimensions): number => {
    const totalDifference = 
      Math.abs(orgDimensions.status - userDimensions.status) +
      Math.abs(orgDimensions.certainty - userDimensions.certainty) +
      Math.abs(orgDimensions.autonomy - userDimensions.autonomy) +
      Math.abs(orgDimensions.relatedness - userDimensions.relatedness) +
      Math.abs(orgDimensions.fairness - userDimensions.fairness);
    
    // Score FIT = 100 - ((diferença total / 125) * 100)
    const fitScore = 100 - ((totalDifference / 125) * 100);
    return Math.max(0, Math.min(100, fitScore)); // Garantir que fique entre 0-100
  };
  
  const determineFitRange = (fitScore: number): string => {
    if (fitScore >= 80) return "Fit Elevado";
    if (fitScore >= 60) return "Fit Moderado";
    if (fitScore >= 40) return "Fit em Desenvolvimento";
    return "Fit Desafiador";
  };
  
  const determineLeadershipProfile = (userDimensions: ScarfDimensions, responses: QuizResponse[]): string => {
    // Ordenar dimensões por pontuação
    const dimensionScores = [
      { name: 'Status', score: userDimensions.status, priority: 1 },
      { name: 'Certainty', score: userDimensions.certainty, priority: 2 },
      { name: 'Autonomy', score: userDimensions.autonomy, priority: 3 },
      { name: 'Relatedness', score: userDimensions.relatedness, priority: 4 },
      { name: 'Fairness', score: userDimensions.fairness, priority: 5 }
    ];
    
    // Ordenar por pontuação (decrescente) e depois por prioridade (crescente)
    dimensionScores.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Maior pontuação primeiro
      }
      return a.priority - b.priority; // Menor prioridade primeiro (desempate)
    });
    
    const top1 = dimensionScores[0].name;
    const top2 = dimensionScores[1].name;
    
    // Determinar perfil baseado nas duas dimensões principais
    const combination = [top1, top2].sort().join(' + ');
    
    switch (combination) {
      case 'Certainty + Status':
        return 'Executivo/Tradicional';
      case 'Autonomy + Certainty':
        return 'Visionário/Estratégico';
      case 'Autonomy + Status':
        return 'Transformacional/Disruptivo';
      case 'Autonomy + Relatedness':
        return 'Coach Colaborativo';
      case 'Fairness + Relatedness':
        return 'Servidor/Ético';
      case 'Certainty + Relatedness':
        return 'Facilitador/Estável';
      case 'Fairness + Status':
        return 'Líder Justo/Respeitado';
      case 'Autonomy + Fairness':
        return 'Inovador/Íntegro';
      case 'Certainty + Fairness':
        return 'Confiável/Sistemático';
      case 'Relatedness + Status':
        return 'Influenciador/Carismático';
      default:
        return `${top1}/${top2} Dominante`;
    }
  };
  
  const calculateScarfResult = (quiz: Quiz, responses: QuizResponse[]): ScarfResult => {
    console.log("Calculating SCARF result with", responses.length, "responses");
    
    // Calcular dimensões organizacionais (C-Level + Gestores)
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
    const leadershipProfile = determineLeadershipProfile(userDimensions, responses);
    
    // Criar group scores para visualização
    const groupScores: GroupScore[] = [
      {
        groupId: 'status',
        groupTitle: 'Status',
        score: userDimensions.status,
        maxScore: 25, // 5 perguntas * 5 pontos máximos
        percentage: (userDimensions.status / 25) * 100
      },
      {
        groupId: 'certainty',
        groupTitle: 'Certainty',
        score: userDimensions.certainty,
        maxScore: 25,
        percentage: (userDimensions.certainty / 25) * 100
      },
      {
        groupId: 'autonomy',
        groupTitle: 'Autonomy',
        score: userDimensions.autonomy,
        maxScore: 25,
        percentage: (userDimensions.autonomy / 25) * 100
      },
      {
        groupId: 'relatedness',
        groupTitle: 'Relatedness',
        score: userDimensions.relatedness,
        maxScore: 25,
        percentage: (userDimensions.relatedness / 25) * 100
      },
      {
        groupId: 'fairness',
        groupTitle: 'Fairness',
        score: userDimensions.fairness,
        maxScore: 25,
        percentage: (userDimensions.fairness / 25) * 100
      }
    ];
    
    return {
      fitScore,
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
