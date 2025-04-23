
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar,
  Filter
} from "lucide-react";
import ResultsChart from "@/components/ResultsChart";

const Analytics = () => {
  const [dateRange, setDateRange] = useState("30");
  const [quizFilter, setQuizFilter] = useState("all");
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">Gain insights from your assessment data</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={quizFilter} onValueChange={setQuizFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by quiz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                <SelectItem value="leadership">Leadership Assessment</SelectItem>
                <SelectItem value="team">Team Dynamics Survey</SelectItem>
                <SelectItem value="communication">Communication Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,248</div>
            <div className="flex items-center text-sm mt-1">
              <span className="text-green-500 mr-1">+12.5%</span>
              <span className="text-gray-500">vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg. Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7:24</div>
            <div className="flex items-center text-sm mt-1">
              <span className="text-red-500 mr-1">+0:46</span>
              <span className="text-gray-500">vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Premium Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24%</div>
            <div className="flex items-center text-sm mt-1">
              <span className="text-green-500 mr-1">+3.2%</span>
              <span className="text-gray-500">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profiles">Profile Distribution</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Completions Over Time</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResultsChart
                  type="line"
                  title="Completions"
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    values: [65, 78, 82, 75, 102, 110, 95, 88, 118, 127, 135, 142],
                  }}
                  downloadFileName="completions-trend"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Distribution</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResultsChart
                  type="pie"
                  title="Leadership Profiles"
                  data={{
                    labels: ["Directive", "Procedural", "Collaborative", "Adaptive"],
                    values: [18, 25, 32, 25],
                  }}
                  downloadFileName="profile-distribution"
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Competency Area Analysis</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResultsChart
                  type="bar"
                  title="Average Score by Competency"
                  data={{
                    labels: ["Strategic Thinking", "Communication", "Decision Making", "Team Building", "Innovation", "Execution"],
                    values: [7.2, 8.1, 6.5, 7.8, 6.2, 7.5],
                  }}
                  downloadFileName="competency-scores"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="profiles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Leadership Profile Distribution</CardTitle>
              <CardDescription>
                Breakdown of assessment results by leadership profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResultsChart
                  type="pie"
                  title="Profile Distribution"
                  data={{
                    labels: ["Directive", "Procedural", "Collaborative", "Adaptive"],
                    values: [18, 25, 32, 25],
                  }}
                  downloadFileName="profile-distribution"
                />
                
                <ResultsChart
                  type="bar"
                  title="Profile by Experience Level"
                  data={{
                    labels: ["Entry", "Mid-Level", "Senior", "Executive"],
                    values: [35, 42, 58, 78],
                  }}
                  downloadFileName="profile-by-experience"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of responses for each question
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">
                    Q1: When leading a team project, I prefer to:
                  </h3>
                  <ResultsChart
                    type="bar"
                    title="Response Distribution"
                    data={{
                      labels: [
                        "Provide detailed instructions", 
                        "Set clear goals with autonomy", 
                        "Facilitate group discussions", 
                        "Adapt based on situation"
                      ],
                      values: [22, 35, 28, 15],
                    }}
                    downloadFileName="q1-responses"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">
                    Q2: When facing a challenge, I typically:
                  </h3>
                  <ResultsChart
                    type="bar"
                    title="Response Distribution"
                    data={{
                      labels: [
                        "Analyze available data", 
                        "Trust intuition", 
                        "Consult with team", 
                        "Follow protocols"
                      ],
                      values: [30, 25, 32, 13],
                    }}
                    downloadFileName="q2-responses"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>
                Identify patterns and changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResultsChart
                  type="line"
                  title="Average Scores Over Time"
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    values: [18.2, 19.5, 20.1, 21.3, 22.8, 23.5],
                  }}
                  downloadFileName="score-trends"
                />
                
                <ResultsChart
                  type="line"
                  title="Completion Rate Trends"
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    values: [65, 70, 73, 68, 82, 88],
                  }}
                  downloadFileName="completion-trends"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Quiz Submissions</CardTitle>
          <CardDescription>
            View the latest quiz completions and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  {
                    date: "2023-06-15",
                    quiz: "Leadership Assessment",
                    score: 26,
                    profile: "Adaptive Leader",
                    subscription: "Premium"
                  },
                  {
                    date: "2023-06-14",
                    quiz: "Communication Skills",
                    score: 18,
                    profile: "Collaborative Leader",
                    subscription: "Free"
                  },
                  {
                    date: "2023-06-14",
                    quiz: "Leadership Assessment",
                    score: 22,
                    profile: "Collaborative Leader",
                    subscription: "Premium"
                  },
                  {
                    date: "2023-06-13",
                    quiz: "Team Dynamics Survey",
                    score: 15,
                    profile: "Procedural Leader",
                    subscription: "Free"
                  },
                  {
                    date: "2023-06-12",
                    quiz: "Leadership Assessment",
                    score: 8,
                    profile: "Directive Leader",
                    subscription: "Free"
                  }
                ].map((submission, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {submission.quiz}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.profile}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        submission.subscription === "Premium" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {submission.subscription}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Showing 5 of 1,248 submissions
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
