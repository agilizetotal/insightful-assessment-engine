
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Calendar, 
  FilePlus, 
  Search, 
  MoreHorizontal, 
  Trash, 
  Edit, 
  Eye, 
  Users, 
  FileText 
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for quizzes
  const quizzes = [
    { 
      id: "1", 
      title: "Leadership Assessment", 
      createdAt: "2023-04-15", 
      responses: 124,
      status: "active" 
    },
    { 
      id: "2", 
      title: "Team Dynamics Survey", 
      createdAt: "2023-03-22", 
      responses: 87,
      status: "active" 
    },
    { 
      id: "3", 
      title: "Communication Skills Quiz", 
      createdAt: "2023-02-10", 
      responses: 56,
      status: "inactive" 
    },
    { 
      id: "4", 
      title: "Strategic Thinking Assessment", 
      createdAt: "2023-01-05", 
      responses: 32,
      status: "draft" 
    }
  ];
  
  // Filter quizzes based on search query
  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your quizzes and view analytics</p>
        </div>
        <Button asChild className="mt-4 md:mt-0 bg-quiz-primary hover:bg-quiz-secondary">
          <Link to="/admin/create">
            <FilePlus className="h-4 w-4 mr-2" />
            Create New Quiz
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{quizzes.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {quizzes.filter(q => q.status === "active").length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {quizzes.reduce((sum, quiz) => sum + quiz.responses, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +42 in the last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24%</div>
            <p className="text-xs text-gray-500 mt-1">
              Free to premium upgrades
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <CardTitle>Your Quizzes</CardTitle>
              <CardDescription>Manage and monitor your assessment tools</CardDescription>
            </div>
            <div className="relative mt-4 md:mt-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search quizzes..."
                className="pl-8 w-full md:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>List of your quizzes and their statistics</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Responses</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>
                    <Badge className={
                      quiz.status === "active" ? "bg-green-500" : 
                      quiz.status === "draft" ? "bg-amber-500" : 
                      "bg-gray-500"
                    }>
                      {quiz.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{quiz.createdAt}</TableCell>
                  <TableCell className="text-right">{quiz.responses}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart className="h-4 w-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest responses and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-quiz-light p-2 rounded-full mr-3">
                  <Users className="h-4 w-4 text-quiz-primary" />
                </div>
                <div>
                  <p className="font-medium">New response to "Leadership Assessment"</p>
                  <p className="text-sm text-gray-500">User completed with score 78</p>
                  <p className="text-xs text-gray-400">10 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-quiz-light p-2 rounded-full mr-3">
                  <FileText className="h-4 w-4 text-quiz-primary" />
                </div>
                <div>
                  <p className="font-medium">Quiz edited: "Communication Skills Quiz"</p>
                  <p className="text-sm text-gray-500">Added 3 new questions</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-quiz-light p-2 rounded-full mr-3">
                  <Users className="h-4 w-4 text-quiz-primary" />
                </div>
                <div>
                  <p className="font-medium">New premium upgrade</p>
                  <p className="text-sm text-gray-500">User purchased full report access</p>
                  <p className="text-xs text-gray-400">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/create">
                  <FilePlus className="h-4 w-4 mr-2" />
                  New Quiz
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/analytics">
                  <BarChart className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/responses">
                  <FileText className="h-4 w-4 mr-2" />
                  Review Responses
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/settings">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
