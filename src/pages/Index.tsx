
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, BookOpen, User, Settings, BarChart4 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-quiz-primary to-quiz-secondary">
            Insightful Assessment Engine
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create intelligent quizzes with customized scoring, conditional logic, and comprehensive analysis
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard 
            title="Create Smart Quizzes"
            description="Design assessments with multiple question types, custom scoring, and branching logic"
            icon={<BookOpen className="h-10 w-10 text-quiz-accent" />}
            link="/admin/create"
          />
          
          <FeatureCard 
            title="Take an Assessment"
            description="Experience our assessment engine from the user perspective"
            icon={<User className="h-10 w-10 text-quiz-accent" />}
            link="/quiz/demo"
          />
          
          <FeatureCard 
            title="View Analytics"
            description="Explore powerful visualization tools and result exports"
            icon={<BarChart4 className="h-10 w-10 text-quiz-accent" />}
            link="/admin/analytics"
          />
          
          <FeatureCard 
            title="Admin Dashboard"
            description="Manage your quizzes, results, and user data in one place"
            icon={<Home className="h-10 w-10 text-quiz-accent" />}
            link="/admin"
            className="md:col-span-2 lg:col-span-1"
          />
          
          <FeatureCard 
            title="Configure Settings"
            description="Customize the appearance, integrations, and behavior of your assessment engine"
            icon={<Settings className="h-10 w-10 text-quiz-accent" />}
            link="/admin/settings"
            className="md:col-span-2 lg:col-span-2"
          />
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-quiz-primary hover:bg-quiz-secondary">
              <Link to="/quiz/demo">Try a Demo Quiz</Link>
            </Button>
            <Button asChild variant="outline" className="border-quiz-primary text-quiz-primary hover:bg-quiz-light">
              <Link to="/admin/create">Create Quiz</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description, icon, link, className = "" }) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          {icon}
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full text-quiz-primary hover:text-quiz-secondary hover:bg-quiz-light">
          <Link to={link}>Explore</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Index;
