import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function TrendChart({ data, skillName }) {
  if (!data || data.length === 0) return null;

  // Format data for Recharts
  const chartData = data.map(d => ({
    year: d.year,
    postings: d.job_postings,
    salary: d.avg_salary_usd / 1000, // Show in $k
  }));

  return (
    <div style={{ width: '100%', height: 300, background: 'rgba(15, 23, 42, 0.3)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
        Historical Demand Trend: <span style={{ color: '#38bdf8' }}>{skillName}</span>
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPostings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="year" 
            stroke="#475569" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#475569" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(v) => `${v >= 1000 ? (v/1000).toFixed(1) + 'k' : v}`}
          />
          <Tooltip 
            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#38bdf8' }}
          />
          <Area 
            type="monotone" 
            dataKey="postings" 
            stroke="#38bdf8" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPostings)" 
            name="Job Postings"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#475569', marginTop: '10px' }}>
        Source: BLS OES / SkillWatch Aggregated Data
      </div>
    </div>
  );
}
