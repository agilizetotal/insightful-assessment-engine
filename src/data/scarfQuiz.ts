
import { Quiz, Question, QuestionGroup, ProfileRange } from '@/types/quiz';

// Perguntas do Bloco 1: Momento Estratégico da Organização
const strategicMomentQuestions = [
  "A empresa busca crescimento orgânico e ganhos de longo prazo",
  "Há foco em fidelização de clientes e experiência do usuário",
  "A liderança promove uma cultura voltada para escala sustentável",
  "A empresa enfrenta estagnação e pressão de acionistas",
  "Há priorização de eficiência e corte de custos",
  "A cultura atual favorece a digitalização e reestruturação",
  "A empresa está passando por fusão, aquisição ou reestruturação",
  "Lideranças disruptivas estão sendo promovidas recentemente",
  "O estilo de liderança do comprador tem predominância na cultura atual",
  "A cultura da empresa é instável e muda conforme a diretoria"
];

// Perguntas SCARF organizadas por dimensão (mesmas para blocos 2, 3 e 4)
const scarfQuestionsByDimension = {
  status: [
    "Me sinto estimulado em ambientes com autoridade clara",
    "Gosto de líderes reconhecidos formalmente",
    "Acredito que reconhecimento deve vir do impacto",
    "Prefiro lideranças que dividem protagonismo",
    "Cresço melhor onde status vem do exemplo"
  ],
  certainty: [
    "Me sinto confiante com metas claras",
    "Mudanças frequentes me desmotivam",
    "Valorizo líderes que comunicam expectativas",
    "Gosto de ter visibilidade do futuro da empresa",
    "Prefiro estabilidade e direção clara"
  ],
  autonomy: [
    "Sou mais produtivo com liberdade de execução",
    "Valorizo líderes que delegam com confiança",
    "Cresço mais com autonomia decisória",
    "Me frustro em ambientes controladores",
    "Prefiro acordos à supervisão constante"
  ],
  relatedness: [
    "Conexão humana é essencial para liderar",
    "Me motivo com times colaborativos",
    "Preciso de líderes acessíveis",
    "Tenho mais segurança com confiança no ambiente",
    "Valorizo performance com cuidado humano"
  ],
  fairness: [
    "Cresço melhor com critérios claros de promoção",
    "Prefiro liderança justa e imparcial",
    "Falta de coerência me desengaja",
    "Preciso de igualdade de oportunidades",
    "Justiça é mais importante que carisma"
  ]
};

const createScarfOptions = () => [
  { id: crypto.randomUUID(), text: "Nada compatível", weight: 1 },
  { id: crypto.randomUUID(), text: "Pouco compatível", weight: 2 },
  { id: crypto.randomUUID(), text: "Levemente compatível", weight: 3 },
  { id: crypto.randomUUID(), text: "Moderadamente compatível", weight: 4 },
  { id: crypto.randomUUID(), text: "Muito compatível", weight: 5 },
  { id: crypto.randomUUID(), text: "Totalmente compatível", weight: 6 }
];

const createQuestions = (groupIds: string[]): Question[] => {
  const questions: Question[] = [];
  
  console.log("=== CREATING SCARF QUESTIONS ===");
  console.log("Group IDs received:", groupIds);
  
  // Bloco 1: Momento Estratégico (10 perguntas)
  console.log("Creating Strategic Moment questions...");
  strategicMomentQuestions.forEach((text, index) => {
    const question: Question = {
      id: crypto.randomUUID(),
      text,
      type: 'multiple-choice',
      options: createScarfOptions(),
      required: true,
      groupId: groupIds[0] // strategic-group
    };
    questions.push(question);
    console.log(`Strategic question ${index + 1}:`, text.substring(0, 30));
  });
  
  // Bloco 2: SCARF C-Level (25 perguntas)
  console.log("Creating C-Level SCARF questions...");
  Object.entries(scarfQuestionsByDimension).forEach(([dimension, dimensionQuestions]) => {
    dimensionQuestions.forEach((text, index) => {
      const question: Question = {
        id: crypto.randomUUID(),
        text: `[C-Level] ${text}`,
        type: 'multiple-choice',
        options: createScarfOptions(),
        required: true,
        groupId: groupIds[1] // clevel-group
      };
      questions.push(question);
      console.log(`C-Level ${dimension} question ${index + 1}:`, text.substring(0, 30));
    });
  });
  
  // Bloco 3: SCARF Líderes e Gestores (25 perguntas)
  console.log("Creating Managers SCARF questions...");
  Object.entries(scarfQuestionsByDimension).forEach(([dimension, dimensionQuestions]) => {
    dimensionQuestions.forEach((text, index) => {
      const question: Question = {
        id: crypto.randomUUID(),
        text: `[Líderes/Gestores] ${text}`,
        type: 'multiple-choice',
        options: createScarfOptions(),
        required: true,
        groupId: groupIds[2] // managers-group
      };
      questions.push(question);
      console.log(`Managers ${dimension} question ${index + 1}:`, text.substring(0, 30));
    });
  });
  
  // Bloco 4: SCARF Perfil Preferido (25 perguntas)
  console.log("Creating User Profile SCARF questions...");
  Object.entries(scarfQuestionsByDimension).forEach(([dimension, dimensionQuestions]) => {
    dimensionQuestions.forEach((text, index) => {
      const question: Question = {
        id: crypto.randomUUID(),
        text: `[Seu Perfil] ${text}`,
        type: 'multiple-choice',
        options: createScarfOptions(),
        required: true,
        groupId: groupIds[3] // user-profile-group
      };
      questions.push(question);
      console.log(`User Profile ${dimension} question ${index + 1}:`, text.substring(0, 30));
    });
  });
  
  console.log(`=== TOTAL QUESTIONS CREATED: ${questions.length} ===`);
  console.log("Question distribution:", {
    strategic: questions.filter(q => q.groupId === groupIds[0]).length,
    clevel: questions.filter(q => q.groupId === groupIds[1]).length,
    managers: questions.filter(q => q.groupId === groupIds[2]).length,
    userProfile: questions.filter(q => q.groupId === groupIds[3]).length
  });
  
  return questions;
};

const createQuestionGroups = (): QuestionGroup[] => {
  const groups = [
    {
      id: crypto.randomUUID(),
      title: "Momento Estratégico da Organização",
      description: "Avaliação do contexto estratégico atual da organização",
      weight: 0, // Peso 0 pois é diagnóstico
      order: 0
    },
    {
      id: crypto.randomUUID(),
      title: "SCARF - C-Level",
      description: "Avaliação das dimensões SCARF para o nível executivo (peso 65%)",
      weight: 65, // Peso 65% conforme especificação
      order: 1
    },
    {
      id: crypto.randomUUID(),
      title: "SCARF - Líderes e Gestores",
      description: "Avaliação das dimensões SCARF para líderes e gestores (peso 35%)",
      weight: 35, // Peso 35% conforme especificação
      order: 2
    },
    {
      id: crypto.randomUUID(),
      title: "SCARF - Perfil de Liderança Preferido",
      description: "Suas preferências pessoais nas dimensões SCARF",
      weight: 100, // Peso 100% para o perfil do usuário
      order: 3
    }
  ];
  
  console.log("=== QUESTION GROUPS CREATED ===");
  groups.forEach((group, index) => {
    console.log(`Group ${index + 1}:`, {
      id: group.id,
      title: group.title,
      weight: group.weight,
      order: group.order
    });
  });
  
  return groups;
};

export const createScarfQuiz = (): Quiz => {
  console.log("=== STARTING SCARF QUIZ CREATION ===");
  
  const quizId = crypto.randomUUID();
  console.log("Quiz ID:", quizId);
  
  const groups = createQuestionGroups();
  const groupIds = groups.map(g => g.id);
  
  const questions = createQuestions(groupIds);
  
  const profileRanges: ProfileRange[] = [
    {
      min: 85,
      max: 100,
      profile: "Fit Excelente",
      description: "Alinhamento excepcional entre seu perfil e o estilo de liderança organizacional. Há convergência quase total entre suas preferências e a cultura de liderança."
    },
    {
      min: 70,
      max: 84,
      profile: "Fit Elevado",
      description: "Forte compatibilidade com algumas nuances específicas. O alinhamento é consistente na maioria das dimensões SCARF."
    },
    {
      min: 55,
      max: 69,
      profile: "Fit Moderado",
      description: "Compatibilidade adequada com oportunidades de desenvolvimento. Há alinhamento parcial que pode ser otimizado."
    },
    {
      min: 40,
      max: 54,
      profile: "Fit em Desenvolvimento",
      description: "Compatibilidade que requer atenção e ajustes específicos. Diferenças significativas que demandam trabalho focado."
    },
    {
      min: 0,
      max: 39,
      profile: "Fit Desafiador",
      description: "Baixa compatibilidade que requer estratégia de desenvolvimento abrangente. Diferenças substanciais que impactam a efetividade."
    }
  ];
  
  const quiz: Quiz = {
    id: quizId,
    title: "Formulário Completo de Fit de Liderança - Modelo SCARF",
    description: "Avaliação do alinhamento entre o seu perfil de liderança preferido e o estilo de liderança praticado na organização, usando escala de 6 pontos de compatibilidade.",
    questions,
    questionGroups: groups,
    profileRanges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log("=== SCARF QUIZ CREATION COMPLETED ===");
  console.log("Final quiz structure:", {
    id: quiz.id,
    title: quiz.title,
    questionsCount: quiz.questions.length,
    groupsCount: quiz.questionGroups.length,
    profileRangesCount: quiz.profileRanges.length
  });
  
  return quiz;
};
