import { useState } from "react";
import { getFullReadiness } from "../../api/camspherApi";
// then use:  const data = await getFullReadiness({ resume_text, cgpa, branch })
// data.resume_analysis.overall_score   ← Model 1
// data.job_recommendations.top_jobs    ← Model 2
// data.selection_prediction.probability ← Model 3
// data.placement_readiness.readiness_score ← Model 4
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-black dark:text-white ${className}`}
    >
      {children}
    </div>
  );
};

const kpis = [
  {
    label: "Total Students",
    value: "1,240",
    change: "+5.2%",
    up: true,
    icon: Users,
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Students Placed",
    value: "1,045",
    change: "+12.0%",
    up: true,
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Avg. Package",
    value: "14.8 LPA",
    change: "+8.3%",
    up: true,
    icon: TrendingUp,
    color: "bg-amber-100 text-amber-600",
  },
  {
    label: "Companies Visited",
    value: "187",
    change: "-3.1%",
    up: false,
    icon: Building2,
    color: "bg-violet-100 text-violet-600",
  },
];

const monthly = [
  { month: "Jul", placed: 42, offers: 58 },
  { month: "Aug", placed: 78, offers: 95 },
  { month: "Sep", placed: 125, offers: 148 },
  { month: "Oct", placed: 210, offers: 240 },
  { month: "Nov", placed: 180, offers: 205 },
  { month: "Dec", placed: 95, offers: 112 },
  { month: "Jan", placed: 130, offers: 155 },
  { month: "Feb", placed: 185, offers: 210 },
];

const radarData = [
  { branch: "CS", score: 94 },
  { branch: "IT", score: 88 },
  { branch: "EC", score: 76 },
  { branch: "ME", score: 61 },
  { branch: "Civil", score: 48 },
  { branch: "Chem", score: 55 },
];

const pieData = [
  { name: "3-6 LPA", value: 185, color: "#dbeafe" },
  { name: "6-10 LPA", value: 320, color: "#93c5fd" },
  { name: "10-15 LPA", value: 290, color: "#60a5fa" },
  { name: "15-20 LPA", value: 175, color: "#2563eb" },
  { name: "20+ LPA", value: 75, color: "#1d4ed8" },
];

const yoyData = [
  { branch: "CS", y22: 82, y23: 94 },
  { branch: "IT", y22: 79, y23: 88 },
  { branch: "EC", y22: 68, y23: 76 },
  { branch: "ME", y22: 55, y23: 61 },
  { branch: "Civil", y22: 40, y23: 48 },
  { branch: "Chem", y22: 44, y23: 55 },
];

const funnelData = [
  { label: "Applied", value: 1240, pct: 100 },
  { label: "Appeared", value: 1120, pct: 90 },
  { label: "Shortlisted", value: 780, pct: 63 },
  { label: "Offer Received", value: 560, pct: 45 },
  { label: "Accepted", value: 487, pct: 39 },
];

const offerStats = [
  { label: "Offer Acceptance Rate", value: 87, color: "#2563eb" },
  { label: "Dream Offer Rate", value: 34, color: "#60a5fa" },
  { label: "Multiple Offers", value: 22, color: "#bfdbfe" },
];

const tableRows = [
  {
    dept: "Computer Science",
    total: 280,
    eligible: 265,
    placed: 249,
    avgPkg: 18.4,
    highPkg: 45.0,
    pct: 94,
  },
  {
    dept: "Information Technology",
    total: 240,
    eligible: 228,
    placed: 200,
    avgPkg: 15.2,
    highPkg: 32.0,
    pct: 88,
  },
  {
    dept: "Electronics & Comm.",
    total: 210,
    eligible: 195,
    placed: 148,
    avgPkg: 12.6,
    highPkg: 28.0,
    pct: 76,
  },
  {
    dept: "Mechanical Engg.",
    total: 200,
    eligible: 182,
    placed: 111,
    avgPkg: 9.8,
    highPkg: 18.5,
    pct: 61,
  },
  {
    dept: "Civil Engg.",
    total: 160,
    eligible: 140,
    placed: 67,
    avgPkg: 7.2,
    highPkg: 14.0,
    pct: 48,
  },
  {
    dept: "Chemical Engg.",
    total: 150,
    eligible: 128,
    placed: 71,
    avgPkg: 8.5,
    highPkg: 16.0,
    pct: 55,
  },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-xs text-black dark:text-white">
      {label && <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? p.fill ?? "#2563eb" }}>
          {p.name}:{" "}
          <span className="font-bold">
            {p.value}
            {typeof p.value === "number" && p.name?.includes("%") ? "%" : ""}
          </span>
        </p>
      ))}
    </div>
  );
};

function KPICards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <Card key={k.label} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}
            >
              <k.icon className="w-[18px] h-[18px]" />
            </div>
            <span
              className={`flex items-center gap-0.5 text-xs font-semibold ${k.up ? "text-emerald-600" : "text-red-500"
                }`}
            >
              {k.up ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {k.change}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{k.value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">{k.label}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">vs last year</p>
        </Card>
      ))}
    </div>
  );
}

function PlacementTrend() {
  return (
    <Card className="p-5 h-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Placement Trend</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Offers vs placed over time</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Monthly
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains("dark") ? "#374151" : "#e5e7eb"} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="offers"
            name="Offers Made"
            stroke="#93c5fd"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="placed"
            name="Placed"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#2563eb" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

function BranchPerformance() {
  return (
    <Card className="p-5 h-full">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Branch Performance</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Placement % by department</p>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <RadarChart data={radarData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <PolarGrid stroke={document.documentElement.classList.contains("dark") ? "#374151" : "#e5e7eb"} />
          <PolarAngleAxis
            dataKey="branch"
            tick={{ fontSize: 11, fill: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280" }}
          />
          <Radar
            name="Placement %"
            dataKey="score"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip content={<ChartTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {radarData.map((d) => (
          <div key={d.branch} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-500">{d.branch}</span>
            <span className="text-[11px] font-semibold text-gray-900 dark:text-white ml-auto">
              {d.score}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (percent < 0.07) return null;

  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * R);
  const y = cy + r * Math.sin(-midAngle * R);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function PackageDistribution() {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Package Distribution</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Students by salary bracket (LPA)</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                labelLine={false}
                label={renderPieLabel}
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ background: d.color }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 flex-1 truncate">
                {d.name}
              </span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                {d.value}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 w-10 text-right">
                {((d.value / pieTotal) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between">
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              Total Placed
            </span>
            <span className="text-xs font-bold text-blue-600">
              {pieTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function YearComparison() {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
          Year-over-Year Comparison
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Branch placement % across years</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={yoyData} barGap={4} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains("dark") ? "#374151" : "#e5e7eb"} vertical={false} />
          <XAxis
            dataKey="branch"
            tick={{ fontSize: 11, fill: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="y22" name="2022-23" fill="#bfdbfe" radius={[3, 3, 0, 0]} />
          <Bar dataKey="y23" name="2023-24" fill="#2563eb" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function OfferFunnel() {
  return (
    <Card className="p-5 h-full">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Offer Funnel</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Student journey through hiring stages</p>
      </div>

      <div className="space-y-2 mb-5">
        {funnelData.map((f, i) => (
          <div key={f.label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{f.label}</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                {f.value.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${f.pct}%`, opacity: 1 - i * 0.15 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        {offerStats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shrink-0">
              <div
                className="h-full rounded-full"
                style={{ width: `${s.value}%`, background: s.color }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 flex-1">{s.label}</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">{s.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const cols = [
  { key: "dept", label: "Department" },
  { key: "total", label: "Total" },
  { key: "eligible", label: "Eligible" },
  { key: "placed", label: "Placed" },
  { key: "avgPkg", label: "Avg Pkg" },
  { key: "highPkg", label: "High Pkg" },
  { key: "pct", label: "Rate" },
];

function DeptTable() {
  const [sortKey, setSortKey] = useState("pct");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...tableRows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];

    if (typeof av === "number" && typeof bv === "number") {
      return sortAsc ? av - bv : bv - av;
    }

    return sortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const toggle = (key) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortIcon = ({ k }) =>
    sortKey === k ? (
      sortAsc ? (
        <ArrowUp className="w-3 h-3" />
      ) : (
        <ArrowDown className="w-3 h-3" />
      )
    ) : (
      <ArrowUpDown className="w-3 h-3 opacity-40" />
    );

  return (
    <Card className="p-5 h-full">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
          Department-wise Statistics
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Click column headers to sort</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {cols.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggle(key)}
                  className="text-left pb-2 pr-3 text-gray-500 dark:text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                >
                  <span className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white dark:text-white transition-colors">
                    {label} <SortIcon k={key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.dept}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="py-2.5 pr-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {r.dept}
                </td>
                <td className="py-2.5 pr-3 text-gray-500 dark:text-gray-400 dark:text-gray-500">{r.total}</td>
                <td className="py-2.5 pr-3 text-gray-500 dark:text-gray-400 dark:text-gray-500">{r.eligible}</td>
                <td className="py-2.5 pr-3 font-semibold text-gray-900 dark:text-white">
                  {r.placed}
                </td>
                <td className="py-2.5 pr-3 text-gray-900 dark:text-white">{r.avgPkg} L</td>
                <td className="py-2.5 pr-3 text-gray-900 dark:text-white">{r.highPkg} L</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "font-bold",
                        r.pct >= 85
                          ? "text-emerald-600"
                          : r.pct >= 65
                            ? "text-amber-600"
                            : "text-red-500"
                      )}
                    >
                      {r.pct}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Analytics() {
  const [year, setYear] = useState("2023-2024");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">
            Deep-dive into placement performance metrics and trends
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Academic Year
            </span>
          </div>
        </div>
      </div>

      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <PlacementTrend />
        </div>
        <div className="lg:col-span-2">
          <BranchPerformance />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PackageDistribution />
        <YearComparison />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <OfferFunnel />
        </div>
        <div className="lg:col-span-3">
          <DeptTable />
        </div>
      </div>
    </div>
  );
}
export default Analytics;

