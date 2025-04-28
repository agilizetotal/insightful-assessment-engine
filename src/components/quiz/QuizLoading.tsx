
import { translations } from "@/locales/pt-BR";

export const QuizLoading = () => {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-pulse text-lg">{translations.common.loading}</div>
    </div>
  );
};
