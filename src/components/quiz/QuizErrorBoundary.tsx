
import React, { Component, ErrorInfo } from 'react';
import { Button } from "@/components/ui/button";
import { translations } from "@/locales/pt-BR";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class QuizErrorBoundaryInner extends Component<Props & { navigate: (path: string) => void }, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Quiz error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-4 text-center">
          <div className="bg-red-50 p-6 rounded-lg max-w-md mx-auto">
            <h2 className="text-red-800 text-lg font-medium mb-2">
              {translations.quiz.errorOccurred}
            </h2>
            <p className="text-red-700 mb-4">
              {this.state.error?.message || translations.quiz.generalError}
            </p>
            <div className="space-x-4">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {translations.common.tryAgain}
              </Button>
              <Button 
                onClick={() => this.props.navigate('/')}
              >
                {translations.common.backToHome}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const QuizErrorBoundary: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  return <QuizErrorBoundaryInner navigate={navigate}>{children}</QuizErrorBoundaryInner>;
};
