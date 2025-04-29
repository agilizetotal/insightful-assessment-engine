
import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Chart from 'chart.js/auto';

interface ResultsChartProps {
  data: {
    labels: string[];
    values: number[];
    colors?: string[];
  };
  type: 'bar' | 'pie' | 'radar' | 'line' | 'doughnut';
  title: string;
  downloadFileName?: string;
}

export const ResultsChart: React.FC<ResultsChartProps> = ({
  data,
  type,
  title,
  downloadFileName = 'chart-data',
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const defaultColors = [
    'rgba(79, 70, 229, 0.8)',  // primary
    'rgba(124, 58, 237, 0.8)', // secondary
    'rgba(139, 92, 246, 0.8)', // accent
    'rgba(167, 139, 250, 0.8)', // highlight
    'rgba(196, 181, 253, 0.8)', // muted
  ];
  
  const chartColors = data.colors || defaultColors;
  
  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        let chartConfig;
        
        switch (type) {
          case 'bar':
            chartConfig = {
              type: 'bar',
              data: {
                labels: data.labels,
                datasets: [{
                  label: title,
                  data: data.values,
                  backgroundColor: chartColors,
                  borderColor: chartColors.map(color => color.replace('0.8', '1')),
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }
            };
            break;
            
          case 'pie':
          case 'doughnut':
            chartConfig = {
              type: type, // Use the exact type (pie or doughnut)
              data: {
                labels: data.labels,
                datasets: [{
                  data: data.values,
                  backgroundColor: chartColors,
                  borderColor: '#fff',
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }
            };
            break;
            
          case 'radar':
            chartConfig = {
              type: 'radar',
              data: {
                labels: data.labels,
                datasets: [{
                  label: title,
                  data: data.values,
                  backgroundColor: chartColors[0].replace('0.8', '0.2'),
                  borderColor: chartColors[0].replace('0.8', '1'),
                  borderWidth: 2,
                  pointBackgroundColor: chartColors[0].replace('0.8', '1'),
                }]
              },
              options: {
                responsive: true,
                scales: {
                  r: {
                    beginAtZero: true
                  }
                }
              }
            };
            break;
            
          case 'line':
            chartConfig = {
              type: 'line',
              data: {
                labels: data.labels,
                datasets: [{
                  label: title,
                  data: data.values,
                  backgroundColor: chartColors[0].replace('0.8', '0.2'),
                  borderColor: chartColors[0].replace('0.8', '1'),
                  borderWidth: 2,
                  tension: 0.3,
                  fill: true
                }]
              },
              options: {
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }
            };
            break;
        }
        
        if (chartConfig) {
          chartInstance.current = new Chart(ctx, chartConfig);
        }
      }
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, title, chartColors]);
  
  const handleDownloadCSV = () => {
    const csv = [
      ['Label', 'Value'],
      ...data.labels.map((label, index) => [label, data.values[index]])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${downloadFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
};

// Add a default export that points to the same component
export default ResultsChart;
