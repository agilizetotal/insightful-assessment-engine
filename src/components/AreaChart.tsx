
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AreaChartProps {
  data: { date: string; responses: number }[];
}

export function AreaChart({ data }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="responses" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

export default AreaChart;
