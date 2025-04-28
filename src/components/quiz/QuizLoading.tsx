
import { translations } from "@/locales/pt-BR";

export const QuizLoading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">{translations.common.loading}</p>
      </div>
    </div>
  );
};
