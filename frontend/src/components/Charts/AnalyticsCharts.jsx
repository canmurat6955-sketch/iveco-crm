import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, AreaChart, Area, CartesianGrid } from 'recharts';

const CHART_COLORS = ['#2b7de9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1'];
const SEGMENT_COLORS = { A: '#10b981', B: '#2b7de9', C: '#f59e0b', D: '#ef4444' };
const POTENTIAL_COLORS = { very_high: '#10b981', high: '#2b7de9', medium: '#f59e0b', low: '#ef4444' };
const POTENTIAL_LABELS = { very_high: 'Çok Yüksek', high: 'Yüksek', medium: 'Orta', low: 'Düşük' };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(12px)' }}>
      <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>{payload[0].name || payload[0].payload?.name}</p>
      <p style={{ color: '#8a9bc0', fontSize: 12 }}>{payload[0].value}</p>
    </div>
  );
};

export function CityDonutChart({ data }) {
  if (!data?.length) return <div className="chart-empty">Veri yok</div>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={800}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SectorBarChart({ data }) {
  if (!data?.length) return <div className="chart-empty">Veri yok</div>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <XAxis type="number" tick={{ fill: '#5a6b8a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#8a9bc0', fontSize: 11 }} width={120} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={800}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendAreaChart({ data }) {
  if (!data?.length) return <div className="chart-empty">Veri yok</div>;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2b7de9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2b7de9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" />
        <XAxis dataKey="label" tick={{ fill: '#5a6b8a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#5a6b8a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="count" stroke="#2b7de9" strokeWidth={2} fill="url(#trendGrad)" animationDuration={800} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PipelineFunnel({ data }) {
  if (!data) return null;
  const steps = [
    { key: 'sent', label: 'Gönderildi', color: '#3b82f6' },
    { key: 'replied', label: 'Cevap', color: '#8b5cf6' },
    { key: 'offer_given', label: 'Teklif', color: '#f59e0b' },
    { key: 'follow_up', label: 'Takip', color: '#06b6d4' },
    { key: 'hot_lead', label: 'Sıcak', color: '#ef4444' },
    { key: 'converted', label: 'Kazanıldı', color: '#10b981' },
    { key: 'lost', label: 'Kayıp', color: '#64748b' },
  ];
  const maxVal = Math.max(...steps.map(s => data[s.key] || 0), 1);
  return (
    <div className="pipeline-funnel">
      {steps.map(s => (
        <div key={s.key} className="funnel-step">
          <div className="funnel-label">
            <span className="funnel-dot" style={{ background: s.color }} />
            <span>{s.label}</span>
          </div>
          <div className="funnel-bar-bg">
            <div className="funnel-bar-fill" style={{ width: `${Math.max(((data[s.key] || 0) / maxVal) * 100, 4)}%`, background: s.color }} />
          </div>
          <span className="funnel-count">{data[s.key] || 0}</span>
        </div>
      ))}
    </div>
  );
}

export function SegmentChart({ data }) {
  if (!data?.length) return null;
  const mapped = data.map(d => ({ ...d, fill: SEGMENT_COLORS[d.name] || '#64748b' }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={mapped} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value" animationDuration={800}>
          {mapped.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ChartLegend({ data, colors }) {
  return (
    <div className="chart-legend">
      {data.map((d, i) => (
        <div key={i} className="legend-item">
          <span className="legend-dot" style={{ background: colors ? colors[d.name] || CHART_COLORS[i] : CHART_COLORS[i] }} />
          <span className="legend-label">{POTENTIAL_LABELS[d.name] || d.name}</span>
          <span className="legend-value">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export function RegionMap({ data }) {
  if (!data?.length) return null;
  const maxCust = Math.max(...data.map(d => d.customers), 1);
  return (
    <div className="region-map">
      {data.map(d => (
        <div key={d.city} className="region-map-city" style={{ '--intensity': Math.max(d.customers / maxCust, 0.15) }}>
          <div className="region-city-bubble">
            <span className="region-city-count">{d.customers}</span>
          </div>
          <div className="region-city-name">{d.city}</div>
          <div className="region-city-discoveries">{d.discoveries} keşif</div>
        </div>
      ))}
    </div>
  );
}
