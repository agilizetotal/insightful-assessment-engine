
import { Home, Plus, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./button";
import { translations } from "@/locales/pt-BR";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const location = useLocation();
  const { user, signOut, userRole } = useAuth();
  
  // Check if we're in embed mode
  const searchParams = new URLSearchParams(location.search);
  const isEmbedded = searchParams.get('embed') === 'true';
  
  // Don't show navigation on homepage or when embedded
  if (location.pathname === "/" || isEmbedded) {
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
        {/* Show admin links only for admin users */}
        {userRole === 'admin' && location.pathname !== "/admin" && (
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              {translations.common.dashboard}
            </Link>
          </Button>
        )}
        
        {/* Show create quiz button only for admin users */}
        {userRole === 'admin' && location.pathname !== "/admin/create-new" && (
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/create-new">
              <Plus className="h-4 w-4 mr-2" />
              {translations.common.createNew}
            </Link>
          </Button>
        )}
        
        {/* User menu shown for logged-in users */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <User className="h-4 w-4 mr-2" />
                {user.email}
                {userRole === 'admin' && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Admin</span>}
                {userRole === 'viewer' && <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Viewer</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-500 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                {translations.auth.signOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
