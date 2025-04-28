
import { Button } from "@/components/ui/button";
import { translations } from "@/locales/pt-BR";
import { useNavigate } from "react-router-dom";

interface QuizErrorProps {
  error: string;
}

export const QuizError = ({ error }: QuizErrorProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-4 text-center">
      <div className="bg-red-50 p-6 rounded-lg max-w-md mx-auto">
        <h2 className="text-red-800 text-lg font-medium mb-2">{translations.common.error}</h2>
        <p className="text-red-700 mb-4">{error}</p>
        <Button onClick={() => navigate('/')}>
          {translations.common.backToHome}
        </Button>
      </div>
    </div>
  );
};
