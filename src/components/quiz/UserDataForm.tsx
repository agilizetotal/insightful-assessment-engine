
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserData } from '@/types/quiz';

interface UserDataFormProps {
  userData: UserData;
  onUserDataChange: (userData: UserData) => void;
  onStartQuiz: () => void;
}

const UserDataForm: React.FC<UserDataFormProps> = ({ 
  userData, 
  onUserDataChange, 
  onStartQuiz 
}) => {
  const isStartDisabled = !userData.name || !userData.email;
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Seus dados</CardTitle>
          <CardDescription>Preencha seus dados para iniciar o questionário</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
              value={userData.name}
              onChange={(e) => onUserDataChange({ ...userData, name: e.target.value })}
              placeholder="Digite seu nome completo"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => onUserDataChange({ ...userData, email: e.target.value })}
              placeholder="Digite seu e-mail"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={userData.phone || ''}
              onChange={(e) => onUserDataChange({ ...userData, phone: e.target.value })}
              placeholder="Digite seu telefone"
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={onStartQuiz}
            disabled={isStartDisabled}
            className="w-full"
          >
            Iniciar questionário
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserDataForm;
