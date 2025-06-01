
import { Quiz, Question, QuestionGroup, ProfileRange } from '@/types/quiz';

// Perguntas SCARF para os blocos 2, 3 e 4 (mesmas 25 perguntas repetidas)
const scarfQuestions = [
  // STATUS (5 perguntas)
  "Sinto que minha posição na organização é respeitada pelos outros",
  "Tenho orgulho do status que ocupo na empresa",
  "Outros reconhecem minha expertise e conhecimento",
  "Sinto que tenho influência nas decisões importantes",
  "Minha opinião é valorizada nas reuniões e discussões",
  
  // CERTAINTY (5 perguntas)
  "Tenho clareza sobre o que é esperado de mim no trabalho",
  "As mudanças na organização são comunicadas de forma clara",
  "Sinto segurança sobre o futuro da minha carreira na empresa",
  "Os processos e procedimentos são bem definidos",
  "Tenho previsibilidade sobre meus resultados e metas",
  
  // AUTONOMY (5 perguntas)
  "Tenho liberdade para decidir como executar meu trabalho",
  "Posso influenciar decisões que afetam minha área de atuação",
  "Tenho controle sobre meu horário e forma de trabalhar",
  "Sinto que posso expressar minhas ideias livremente",
  "Tenho autonomia para resolver problemas do dia a dia",
  
  // RELATEDNESS (5 perguntas)
  "Sinto que pertenço ao grupo e à cultura da organização",
  "Tenho relacionamentos positivos com meus colegas",
  "Existe colaboração e apoio mútuo entre as equipes",
  "Sinto que posso contar com meus colegas quando preciso",
  "Há um senso de comunidade e união na organização",
  
  // FAIRNESS (5 perguntas)
  "As decisões na organização são tomadas de forma justa",
  "Os recursos e oportunidades são distribuídos equitativamente",
  "Existe transparência nos processos de avaliação e promoção",
  "Sinto que sou tratado com respeito e dignidade",
  "As regras são aplicadas de forma consistente para todos"
];

// Perguntas diagnósticas do Bloco 1
const diagnosticQuestions = [
  "A organização possui uma visão estratégica clara e bem comunicada",
  "Os objetivos organizacionais são amplamente conhecidos pelos colaboradores",
  "Existe alinhamento entre as diferentes áreas da organização",
  "A cultura organizacional é forte e bem definida",
  "A organização investe adequadamente no desenvolvimento de lideranças",
  "Existe um processo estruturado de sucessão de líderes",
  "A comunicação entre líderes e equipes é efetiva",
  "Os líderes atuais demonstram competências necessárias para o futuro",
  "A organização se adapta rapidamente às mudanças do mercado",
  "Existe um ambiente de confiança e transparência na liderança"
];

const createScarfOptions = () => [
  { id: crypto.randomUUID(), text: "Discordo totalmente", weight: 1 },
  { id: crypto.randomUUID(), text: "Discordo parcialmente", weight: 2 },
  { id: crypto.randomUUID(), text: "Neutro / Nem concordo, nem discordo", weight: 3 },
  { id: crypto.randomUUID(), text: "Concordo parcialmente", weight: 4 },
  { id: crypto.randomUUID(), text: "Concordo totalmente", weight: 5 }
];

const createQuestions = (): Question[] => {
  const questions: Question[] = [];
  
  // Bloco 1: Diagnóstico (10 perguntas) - groupId será definido após criar os grupos
  diagnosticQuestions.forEach((text, index) => {
    questions.push({
      id: crypto.randomUUID(),
      text,
      type: 'multiple-choice',
      options: createScarfOptions(),
      required: true,
      groupId: 'diagnostic-group' // será substituído pelo ID real
    });
  });
  
  // Bloco 2: SCARF C-Level (25 perguntas)
  scarfQuestions.forEach((text, index) => {
    questions.push({
      id: crypto.randomUUID(),
      text: `[C-Level] ${text}`,
      type: 'multiple-choice',
      options: createScarfOptions(),
      required: true,
      groupId: 'clevel-group' // será substituído pelo ID real
    });
  });
  
  // Bloco 3: SCARF Gestores (25 perguntas)
  scarfQuestions.forEach((text, index) => {
    questions.push({
      id: crypto.randomUUID(),
      text: `[Gestores] ${text}`,
      type: 'multiple-choice',
      options: createScarfOptions(),
      required: true,
      groupId: 'managers-group' // será substituído pelo ID real
    });
  });
  
  // Bloco 4: Perfil do Usuário (25 perguntas)
  scarfQuestions.forEach((text, index) => {
    questions.push({
      id: crypto.randomUUID(),
      text: `[Seu Perfil] ${text}`,
      type: 'multiple-choice',
      options: createScarfOptions(),
      required: true,
      groupId: 'user-profile-group' // será substituído pelo ID real
    });
  });
  
  return questions;
};

const createQuestionGroups = (): QuestionGroup[] => {
  const diagnosticGroupId = crypto.randomUUID();
  const clevelGroupId = crypto.randomUUID();
  const managersGroupId = crypto.randomUUID();
  const userProfileGroupId = crypto.randomUUID();
  
  return [
    {
      id: diagnosticGroupId,
      title: "Momento Estratégico da Organização",
      description: "Avaliação diagnóstica da situação atual da liderança organizacional",
      weight: 0, // Peso 0 pois é diagnóstico
      order: 0
    },
    {
      id: clevelGroupId,
      title: "SCARF - C-Level",
      description: "Avaliação das dimensões SCARF para o nível executivo (C-Level)",
      weight: 2, // Peso 2 conforme especificação
      order: 1
    },
    {
      id: managersGroupId,
      title: "SCARF - Gestores",
      description: "Avaliação das dimensões SCARF para gestores",
      weight: 1, // Peso 1 conforme especificação
      order: 2
    },
    {
      id: userProfileGroupId,
      title: "Perfil de Liderança Preferido",
      description: "Suas preferências pessoais nas dimensões SCARF",
      weight: 1, // Peso 1 para cálculo do perfil do usuário
      order: 3
    }
  ];
};

export const createScarfQuiz = (): Quiz => {
  const quizId = crypto.randomUUID();
  const groups = createQuestionGroups();
  let questions = createQuestions();
  
  // Atualizar groupIds nas perguntas com os IDs reais
  questions = questions.map((question, index) => {
    if (index < 10) {
      return { ...question, groupId: groups[0].id }; // Diagnóstico
    } else if (index < 35) {
      return { ...question, groupId: groups[1].id }; // C-Level
    } else if (index < 60) {
      return { ...question, groupId: groups[2].id }; // Gestores
    } else {
      return { ...question, groupId: groups[3].id }; // Usuário
    }
  });
  
  const profileRanges: ProfileRange[] = [
    {
      min: 80,
      max: 100,
      profile: "Fit Elevado",
      description: "Excelente compatibilidade entre seu perfil e o perfil de liderança da organização. Há forte alinhamento entre suas preferências e o estilo de liderança predominante."
    },
    {
      min: 60,
      max: 79,
      profile: "Fit Moderado",
      description: "Boa compatibilidade com algumas áreas de desenvolvimento. Existe alinhamento na maioria das dimensões, com oportunidades específicas de ajuste."
    },
    {
      min: 40,
      max: 59,
      profile: "Fit em Desenvolvimento",
      description: "Compatibilidade moderada que requer atenção e desenvolvimento. Há diferenças significativas que podem ser trabalhadas com foco e dedicação."
    },
    {
      min: 0,
      max: 39,
      profile: "Fit Desafiador",
      description: "Baixa compatibilidade que requer revisão estratégica. Há diferenças substanciais que podem impactar a efetividade da liderança e requerem intervenções específicas."
    }
  ];
  
  return {
    id: quizId,
    title: "Avaliação SCARF de Liderança",
    description: "Questionário para avaliar compatibilidade entre perfil de liderança organizacional e preferências individuais usando o modelo SCARF (Status, Certainty, Autonomy, Relatedness, Fairness)",
    questions,
    questionGroups: groups,
    profileRanges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
