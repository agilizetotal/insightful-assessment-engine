
import { translations } from '@/locales/pt-BR';

interface EmptyConditionsStateProps {
  isFirstQuestion: boolean;
  hasNoConditions: boolean;
}

export const EmptyConditionsState = ({
  isFirstQuestion,
  hasNoConditions
}: EmptyConditionsStateProps) => {
  if (isFirstQuestion) {
    return (
      <div className="text-center p-6 border rounded-md bg-gray-50">
        <p className="text-gray-500">
          {translations.quiz.firstQuestionNoConditions}
        </p>
      </div>
    );
  }
  
  if (hasNoConditions) {
    return (
      <div className="text-center p-6 border rounded-md bg-gray-50">
        <p className="text-gray-500">
          {translations.quiz.noConditionsYet}
        </p>
      </div>
    );
  }
  
  return null;
};
