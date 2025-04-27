
import { Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./button";
import { translations } from "@/locales/pt-BR";

export function Navigation() {
  const location = useLocation();
  
  // Não mostrar a navegação na página inicial
  if (location.pathname === "/") {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-2 flex justify-between items-center">
      <Button asChild variant="ghost" size="sm">
        <Link to="/">
          <Home className="h-4 w-4 mr-2" />
          {translations.common.backToHome}
        </Link>
      </Button>
      
      <div className="flex items-center space-x-2">
        {location.pathname !== "/admin" && (
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              {translations.dashboard.title}
            </Link>
          </Button>
        )}
        {location.pathname !== "/admin/create" && (
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/create">
              {translations.quiz.createNew}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
