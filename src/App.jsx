import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Clock,
  Award,
  TrendingUp,
  RotateCcw,
  Share2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Building2,
  User,
  FileText,
  ArrowUpRight,
  Sparkles,
  Check
} from 'lucide-react';

const ACTIVITIES = [
  {
    id: 'speed_post',
    sl: 1,
    name: 'Booking of Inland Speed Post',
    points: 1.71,
    unit: 'per article',
    category: 'Mail & Parcel',
    highlight: true
  },
  {
    id: 'parcel',
    sl: 2,
    name: 'Booking of Parcel',
    points: 1.71,
    unit: 'per article',
    category: 'Mail & Parcel',
    highlight: false
  },
  {
    id: 'emo',
    sl: 3,
    name: 'Booking of eMO',
    points: 2.21,
    unit: 'per eMO',
    category: 'Money Remittance',
    highlight: false
  },
  {
    id: 'cod_mo',
    sl: 4,
    name: 'Booking of COD Retail MO',
    points: 0.50,
    unit: 'per article',
    category: 'Money Remittance',
    highlight: false
  },
  {
    id: 'stamps',
    sl: 5,
    name: 'Sale of Stamps',
    points: 0.45,
    unit: 'per stamp',
    category: 'Counter Sales',
    highlight: false
  },
  {
    id: 'new_account',
    sl: 6,
    name: 'Opening of New Account (POSB)',
    points: 3.10,
    unit: 'per account',
    category: 'POSB Core Banking',
    highlight: true
  },
  {
    id: 'posb_deposit',
    sl: 7,
    name: 'POSB Cash Deposit',
    points: 1.00,
    unit: 'per transaction',
    category: 'POSB Core Banking',
    highlight: false
  },
  {
    id: 'posb_withdrawal',
    sl: 8,
    name: 'POSB Cash Withdrawal (Normal)',
    points: 1.60,
    unit: 'per transaction',
    category: 'POSB Core Banking',
    highlight: false
  },
  {
    id: 'high_value_withdrawal',
    sl: 9,
    name: 'High Value Request Generation & Withdrawal',
    points: 2.10,
    unit: 'per transaction',
    category: 'POSB Core Banking',
    highlight: true
  },
  {
    id: 'pli_collection',
    sl: 10,
    name: 'PLI / RPLI Renewal Collection',
    points: 1.30,
    unit: 'per transaction',
    category: 'Insurance (PLI/RPLI)',
    highlight: false
  },
  {
    id: 'pli_indexing',
    sl: 11,
    name: 'Indexing of PLI / RPLI Proposal',
    points: 2.80,
    unit: 'per transaction',
    category: 'Insurance (PLI/RPLI)',
    highlight: true
  }
];

const MISC_POINTS_PER_DAY = 18.75; // 45 minutes / 2,700 seconds
const MINUTES_PER_POINT = 2.4; // 144 seconds

export default function App() {
  const [mode, setMode] = useState('monthly'); // 'daily' | 'monthly'
  const [workingDays, setWorkingDays] = useState(25);
  const [boName, setBoName] = useState('');
  const [soName, setSoName] = useState('');
  const [bpmName, setBpmName] = useState('');
  const [reviewMonth] = useState('November 2026');
  const [copied, setCopied] = useState(false);

  const [counts, setCounts] = useState(
    ACTIVITIES.reduce((acc, item) => ({ ...acc, [item.id]: '' }), {})
  );

  const handleCountChange = (id, value) => {
    if (value === '') {
      setCounts((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const num = Math.max(0, parseInt(value, 10));
    setCounts((prev) => ({ ...prev, [id]: isNaN(num) ? '' : num }));
  };

  const handleReset = () => {
    setCounts(ACTIVITIES.reduce((acc, item) => ({ ...acc, [item.id]: '' }), {}));
  };

  const loadSampleBenchmarkMix = () => {
    const multiplier = mode === 'monthly' ? workingDays : 1;
    setCounts({
      speed_post: 4 * multiplier,
      parcel: 1 * multiplier,
      emo: 0,
      cod_mo: 0,
      stamps: 2 * multiplier,
      new_account: 2 * multiplier,
      posb_deposit: 25 * multiplier,
      posb_withdrawal: 18 * multiplier,
      high_value_withdrawal: 3 * multiplier,
      pli_collection: 5 * multiplier,
      pli_indexing: Math.max(1, Math.round(0.6 * multiplier))
    });
  };

  const effectiveDays = mode === 'daily' ? 1 : Math.max(1, Number(workingDays) || 25);

  const stats = useMemo(() => {
    const breakdown = ACTIVITIES.map((act) => {
      const qty = Number(counts[act.id]) || 0;
      const totalPts = qty * act.points;
      const dailyAvgQty = qty / effectiveDays;
      const dailyAvgPts = totalPts / effectiveDays;
      const dailyAvgMins = dailyAvgPts * MINUTES_PER_POINT;
      return {
        ...act,
        qty,
        totalPts,
        dailyAvgQty,
        dailyAvgPts,
        dailyAvgMins
      };
    });

    const totalTransactionPointsPeriod = breakdown.reduce((sum, item) => sum + item.totalPts, 0);
    const dailyTransactionPoints = totalTransactionPointsPeriod / effectiveDays;
    const totalMiscPointsPeriod = MISC_POINTS_PER_DAY * effectiveDays;

    const dailyTotalPoints = dailyTransactionPoints + MISC_POINTS_PER_DAY;
    const periodTotalPoints = totalTransactionPointsPeriod + totalMiscPointsPeriod;

    const dailyTotalMinutes = dailyTotalPoints * MINUTES_PER_POINT;
    const dailyHours = Math.floor(dailyTotalMinutes / 60);
    const dailyRemMinutes = Math.round(dailyTotalMinutes % 60);

    const deficit4HrDaily = Math.max(0, 100 - dailyTotalPoints);
    const deficit5HrDaily = Math.max(0, 125 - dailyTotalPoints);

    const deficit4HrPeriod = deficit4HrDaily * effectiveDays;
    const deficit5HrPeriod = deficit5HrDaily * effectiveDays;

    let slabStatus = 'Below 4-Hour Benchmark';
    let slabColor = 'text-red-700 bg-red-50 border-red-200';
    if (dailyTotalPoints >= 125) {
      slabStatus = '5-Hour Workload Qualified (Level-2 TRCA)';
      slabColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
    } else if (dailyTotalPoints >= 100) {
      slabStatus = '4-Hour Workload Qualified (Level-1 Benchmark)';
      slabColor = 'text-amber-800 bg-amber-50 border-amber-200';
    }

    return {
      breakdown,
      totalTransactionPointsPeriod,
      dailyTransactionPoints,
      totalMiscPointsPeriod,
      dailyTotalPoints,
      periodTotalPoints,
      dailyTotalMinutes,
      dailyHours,
      dailyRemMinutes,
      deficit4HrDaily,
      deficit5HrDaily,
      deficit4HrPeriod,
      deficit5HrPeriod,
      slabStatus,
      slabColor
    };
  }, [counts, effectiveDays]);

  const generateWhatsAppSummary = () => {
    const header = `*INDIA POST - BO WORKLOAD & TRCA ASSESSMENT*\n` +
      `----------------------------------------\n` +
      `*BO Name:* ${boName || 'N/A'}\n` +
      `*Account Office (SO):* ${soName || 'N/A'}\n` +
      `*BPM Name:* ${bpmName || 'N/A'}\n` +
      `*Assessment Mode:* ${mode === 'daily' ? 'Single Day (1 Day)' : `Monthly (${effectiveDays} Working Days - ${reviewMonth})`}\n` +
      `----------------------------------------\n`;

    const activeLines = stats.breakdown
      .filter((b) => b.qty > 0)
      .map(
        (b) =>
          `• ${b.name}: *${b.qty}* (${b.totalPts.toFixed(2)} pts | Avg: ${b.dailyAvgPts.toFixed(2)} pts/day)`
      )
      .join('\n');

    const summary =
      `\n*WORKLOAD POINT SUMMARY*\n` +
      `• Daily Avg Transaction Points: *${stats.dailyTransactionPoints.toFixed(2)} pts/day*\n` +
      `• Fixed Misc. Allowance: *18.75 pts/day* (45 mins)\n` +
      `• *Total Assessed Daily Points:* *${stats.dailyTotalPoints.toFixed(2)} pts/day*\n` +
      `• *Assessed Daily Working Time:* *${stats.dailyTotalMinutes.toFixed(1)} mins/day* (${stats.dailyHours} hr ${stats.dailyRemMinutes} min)\n` +
      `• *Status:* *${stats.slabStatus}*\n`;

    let actionPlan = '';
    if (stats.deficit4HrDaily > 0) {
      const neededAcc = Math.ceil(stats.deficit4HrPeriod / 3.10);
      const neededPli = Math.ceil(stats.deficit4HrPeriod / 2.80);
      const neededSp = Math.ceil(stats.deficit4HrPeriod / 1.71);
      actionPlan =
        `\n*DEFICIT TO 4-HOUR BENCHMARK (100 Pts/Day):*\n` +
        `• Shortfall: *${stats.deficit4HrDaily.toFixed(2)} pts/day* (${stats.deficit4HrPeriod.toFixed(2)} pts in period)\n` +
        `• Bridge via ANY ONE or combination:\n` +
        `  - Open *${neededAcc}* New POSB Accounts (@3.10 pts)\n` +
        `  - Index *${neededPli}* PLI/RPLI Proposals (@2.80 pts)\n` +
        `  - Book *${neededSp}* Speed Post/Parcels (@1.71 pts)`;
    } else if (stats.deficit5HrDaily > 0) {
      const neededAcc5 = Math.ceil(stats.deficit5HrPeriod / 3.10);
      const neededPli5 = Math.ceil(stats.deficit5HrPeriod / 2.80);
      actionPlan =
        `\n*UPGRADE PATH TO 5-HOUR SLAB (125 Pts/Day):*\n` +
        `• Additional Points Needed: *${stats.deficit5HrDaily.toFixed(2)} pts/day* (${stats.deficit5HrPeriod.toFixed(2)} pts in period)\n` +
        `• Equivalent to *${neededAcc5}* New Accounts OR *${neededPli5}* PLI/RPLI Indexing in the period.`;
    }

    const text = `${header}${activeLines || '• No transactions entered yet.'}\n${summary}${actionPlan}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const gaugePercentage = Math.min(100, Math.round((stats.dailyTotalPoints / 125) * 100));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 print:bg-white print:pb-0">
      {/* Top Official Header */}
      <header className="bg-gradient-to-r from-red-800 via-red-700 to-amber-700 text-white shadow-md print:bg-none print:text-slate-900 print:border-b-2 print:border-slate-800 print:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm border border-white/20 print:hidden">
              <Calculator className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 print:border-slate-400 print:text-slate-700">
                  Department of Posts • Revised Norms
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                BPM Workload & TRCA Point Assessment Calculator
              </h1>
              <p className="text-xs sm:text-sm text-red-100 print:text-slate-600 mt-0.5">
                1 Point = 2.4 Minutes (144 Secs) • Fixed Miscellaneous Credit: 18.75 Points/Day (45 Mins)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={loadSampleBenchmarkMix}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition cursor-pointer"
              title="Load a sample 4-hour qualifying BO workload mix"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Sample 4-Hr Mix
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={generateWhatsAppSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied WhatsApp Report!' : 'Copy WhatsApp Summary'}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-red-900 hover:bg-amber-50 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Sheet
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* BO Metadata & Assessment Period Controls */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Mode Switcher */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Assessment Period Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMode('daily')}
                  className={`py-2 px-3 rounded-md text-xs font-bold transition cursor-pointer ${
                    mode === 'daily'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  Single Day (1 Day)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('monthly')}
                  className={`py-2 px-3 rounded-md text-xs font-bold transition cursor-pointer ${
                    mode === 'monthly'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  Monthly Review ({effectiveDays} Days)
                </button>
              </div>
            </div>

            {/* Working Days Selector */}
            {mode === 'monthly' && (
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Working Days in Month
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                  />
                  <div className="flex gap-1 print:hidden">
                    {[24, 25, 26].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setWorkingDays(d)}
                        className={`px-2 py-2 text-xs font-bold rounded border cursor-pointer ${
                          Number(workingDays) === d
                            ? 'bg-amber-100 border-amber-400 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BO Details */}
            <div className={mode === 'monthly' ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Branch Office (BO)
              </label>
              <input
                type="text"
                placeholder="e.g., Machkhowa BO"
                value={boName}
                onChange={(e) => setBoName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Account Office (SO)
              </label>
              <input
                type="text"
                placeholder="e.g., Dhemaji MDG"
                value={soName}
                onChange={(e) => setSoName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
              />
            </div>

            <div className={mode === 'monthly' ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> BPM Name / Month
              </label>
              <input
                type="text"
                placeholder="BPM Name or Month"
                value={bpmName}
                onChange={(e) => setBpmName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Top KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Daily Assessed Points */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assessed Daily Points
              </span>
              <Award className="w-5 h-5 text-red-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {stats.dailyTotalPoints.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-slate-500">pts / day</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              Txn: <strong>{stats.dailyTransactionPoints.toFixed(2)}</strong> + Misc:{' '}
              <strong>18.75</strong> pts/day
            </p>
          </div>

          {/* Card 2: Assessed Working Hours */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Daily Working Time
              </span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {stats.dailyHours}h {stats.dailyRemMinutes}m
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({stats.dailyTotalMinutes.toFixed(1)} mins)
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              4-Hr Slab = 240 mins • 5-Hr Slab = 300 mins
            </p>
          </div>

          {/* Card 3: Cumulative Period Points */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {mode === 'daily' ? 'Single Day Total' : `${effectiveDays}-Day Cumulative`}
              </span>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {stats.periodTotalPoints.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-slate-500">total pts</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              Txn: <strong>{stats.totalTransactionPointsPeriod.toFixed(2)}</strong> + Misc:{' '}
              <strong>{stats.totalMiscPointsPeriod.toFixed(2)}</strong>
            </p>
          </div>

          {/* Card 4: TRCA Benchmark Status */}
          <div className={`rounded-xl p-4 border shadow-xs ${stats.slabColor}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                TRCA Workload Status
              </span>
              {stats.dailyTotalPoints >= 100 ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="mt-2 font-extrabold text-base leading-snug">
              {stats.slabStatus}
            </div>
            <p className="mt-1.5 text-xs opacity-90">
              {stats.deficit4HrDaily > 0
                ? `Need +${stats.deficit4HrDaily.toFixed(2)} pts/day for 4-Hr Slab`
                : stats.deficit5HrDaily > 0
                ? `Need +${stats.deficit5HrDaily.toFixed(2)} pts/day for 5-Hr Slab`
                : 'Exceeds maximum 5-Hour (125 pts/day) norm!'}
            </p>
          </div>
        </section>

        {/* Visual Benchmark Progress Bar */}
        <section className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-700" />
              <h2 className="text-sm font-bold text-slate-800">
                TRCA Point Slab Progression (Daily Average Basis)
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-slate-500">Base Misc: 18.75 pts</span>
              <span className="text-amber-700">4-Hr Slab: 100.00 pts (240m)</span>
              <span className="text-emerald-700">5-Hr Slab: 125.00 pts (300m)</span>
            </div>
          </div>

          <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 ${
                stats.dailyTotalPoints >= 125
                  ? 'bg-emerald-600'
                  : stats.dailyTotalPoints >= 100
                  ? 'bg-amber-500'
                  : 'bg-red-600'
              }`}
              style={{ width: `${gaugePercentage}%` }}
            />
            {/* 4-Hour Marker at 80% (100 / 125) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900"
              style={{ left: '80%' }}
              title="4-Hour Benchmark: 100 Points/Day"
            />
          </div>
          <div className="relative flex justify-between text-[11px] font-semibold text-slate-500 mt-1">
            <span>0 pts</span>
            <span>Misc (18.75 pts)</span>
            <span className="text-slate-900 font-bold" style={{ marginLeft: '45%' }}>
              ▲ 100 pts (4 Hours)
            </span>
            <span className="text-emerald-800 font-bold">125 pts (5 Hours) ▲</span>
          </div>
        </section>

        {/* Main Content Grid: Activity Table + Strategic Target Planner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: 12 Revised Parameters Input Table */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-4 sm:px-5 py-4 bg-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold">
                  Revised Workload Assessment Parameters (12 Activities)
                </h2>
                <p className="text-xs text-slate-300">
                  Enter {mode === 'daily' ? 'single-day' : `${effectiveDays}-day monthly total`} transactions below. Highlighted rows indicate high-point rural boosters.
                </p>
              </div>
              <span className="text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-md self-start sm:self-center">
                {mode === 'daily' ? 'Inputting: 1-Day Volume' : `Inputting: ${effectiveDays}-Day Cumulative Volume`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-3 text-center w-10">Sl.</th>
                    <th className="py-3 px-3">Activity & Category</th>
                    <th className="py-3 px-3 text-right">Revised Points</th>
                    <th className="py-3 px-3 text-right">Time / Unit</th>
                    <th className="py-3 px-3 text-center w-36">
                      {mode === 'daily' ? 'Daily Qty' : `${effectiveDays}-Day Qty`}
                    </th>
                    <th className="py-3 px-3 text-right">Daily Avg Pts</th>
                    <th className="py-3 px-4 text-right">Daily Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {stats.breakdown.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition ${
                        item.highlight
                          ? 'bg-amber-50/40 hover:bg-amber-50/80'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {item.sl}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {item.name}
                          {item.highlight && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 print:hidden">
                              High Weight
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.category} • {item.unit}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">
                        {item.points.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-xs text-slate-500">
                        {(item.points * MINUTES_PER_POINT).toFixed(2)} min
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={counts[item.id]}
                          onChange={(e) => handleCountChange(item.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-center font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                        />
                        {mode === 'monthly' && item.qty > 0 && (
                          <div className="text-[10px] text-center text-slate-500 mt-0.5">
                            ({item.dailyAvgQty.toFixed(1)} / day)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-red-800">
                        {item.dailyAvgPts.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-xs font-semibold text-slate-700">
                        {item.dailyAvgMins.toFixed(1)} min
                      </td>
                    </tr>
                  ))}

                  {/* Row 12: Fixed Miscellaneous Allowance */}
                  <tr className="bg-slate-100/90 font-semibold text-slate-800">
                    <td className="py-3.5 px-3 text-center font-bold text-slate-600">12</td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">
                        Miscellaneous Activities (Fixed Daily Allowance)
                      </div>
                      <div className="text-xs text-slate-600">
                        Bag opening/closing, daily account, cash tallying (2,700 secs/day)
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold">18.75</td>
                    <td className="py-3.5 px-3 text-right text-xs text-slate-600">
                      45.00 min
                    </td>
                    <td className="py-3.5 px-3 text-center text-xs font-bold text-emerald-800">
                      Auto Credited ({effectiveDays}d)
                    </td>
                    <td className="py-3.5 px-3 text-right font-extrabold text-emerald-800">
                      18.75
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-bold text-emerald-800">
                      45.0 min
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold text-sm">
                    <td colSpan={4} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs text-slate-300">
                      Total Daily Average Assessed Workload:
                    </td>
                    <td className="py-3.5 px-3 text-center text-xs text-amber-300">
                      {mode === 'daily' ? '1 Working Day' : `Avg of ${effectiveDays} Days`}
                    </td>
                    <td className="py-3.5 px-3 text-right text-base text-amber-300">
                      {stats.dailyTotalPoints.toFixed(2)} pts
                    </td>
                    <td className="py-3.5 px-4 text-right text-sm text-white">
                      {stats.dailyTotalMinutes.toFixed(1)} mins
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Right 4 Cols: Strategic Target & Deficit Optimizer for BPMs */}
          <div className="lg:col-span-4 space-y-5">
            {/* Deficit Bridge / Action Optimizer */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-red-800 font-bold text-base border-b border-slate-100 pb-3">
                <ArrowUpRight className="w-5 h-5" />
                <h3>BPM Target & Deficit Optimizer</h3>
              </div>

              {stats.deficit4HrDaily > 0 ? (
                <div className="mt-4 space-y-4">
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs space-y-1">
                    <div className="font-bold text-sm">
                      Shortfall to 4-Hour Benchmark (100 Pts/Day):
                    </div>
                    <p>
                      Daily Deficit: <strong>{stats.deficit4HrDaily.toFixed(2)} pts/day</strong> (
                      {(stats.deficit4HrDaily * MINUTES_PER_POINT).toFixed(1)} mins/day)
                    </p>
                    {mode === 'monthly' && (
                      <p>
                        Total {effectiveDays}-Day Monthly Deficit:{' '}
                        <strong>{stats.deficit4HrPeriod.toFixed(2)} points</strong>
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Since routine eMO and Stamp sales are negligible in BOs, bridge this{' '}
                    <strong>
                      {mode === 'monthly'
                        ? `${stats.deficit4HrPeriod.toFixed(1)}-point monthly`
                        : `${stats.deficit4HrDaily.toFixed(1)}-point daily`}
                    </strong>{' '}
                    gap using high-weightage activities:
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">
                          Option A: New POSB Accounts
                        </div>
                        <div className="text-slate-500">3.10 pts (7.44 mins) per account</div>
                      </div>
                      <span className="text-base font-extrabold text-red-800 bg-white px-2.5 py-1 rounded border border-amber-300">
                        +{Math.ceil(stats.deficit4HrPeriod / 3.1)} Acc
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">
                          Option B: PLI / RPLI Indexing
                        </div>
                        <div className="text-slate-500">2.80 pts (6.72 mins) per proposal</div>
                      </div>
                      <span className="text-base font-extrabold text-red-800 bg-white px-2.5 py-1 rounded border border-amber-300">
                        +{Math.ceil(stats.deficit4HrPeriod / 2.8)} Policies
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">
                          Option C: Speed Post / Parcels
                        </div>
                        <div className="text-slate-500">1.71 pts (4.10 mins) per article</div>
                      </div>
                      <span className="text-base font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-300">
                        +{Math.ceil(stats.deficit4HrPeriod / 1.71)} Articles
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">
                          Option D: PLI/RPLI Collections
                        </div>
                        <div className="text-slate-500">1.30 pts (3.12 mins) per renewal</div>
                      </div>
                      <span className="text-base font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-300">
                        +{Math.ceil(stats.deficit4HrPeriod / 1.3)} Txns
                      </span>
                    </div>
                  </div>
                </div>
              ) : stats.deficit5HrDaily > 0 ? (
                <div className="mt-4 space-y-3">
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      4-Hour Workload Secured!
                    </div>
                    <p className="mt-1">
                      To upgrade to the <strong>5-Hour Slab (125 pts/day)</strong>, you need{' '}
                      <strong>+{stats.deficit5HrDaily.toFixed(2)} pts/day</strong> (
                      {stats.deficit5HrPeriod.toFixed(1)} pts across {effectiveDays} days).
                    </p>
                  </div>

                  <div className="text-xs space-y-2 text-slate-700">
                    <div className="font-bold text-slate-900">
                      How to bridge to 5-Hour Slab in {effectiveDays} days:
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        Open <strong>{Math.ceil(stats.deficit5HrPeriod / 3.1)}</strong> additional New Accounts (@3.10 pts), OR
                      </li>
                      <li>
                        Index <strong>{Math.ceil(stats.deficit5HrPeriod / 2.8)}</strong> additional PLI/RPLI Policies (@2.80 pts), OR
                      </li>
                      <li>
                        Book <strong>{Math.ceil(stats.deficit5HrPeriod / 1.71)}</strong> Speed Post articles (@1.71 pts).
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5">
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    5-Hour Maximum Benchmark Achieved!
                  </div>
                  <p>
                    This Branch Office averages{' '}
                    <strong>{stats.dailyTotalPoints.toFixed(2)} points/day</strong> (
                    {stats.dailyTotalMinutes.toFixed(1)} minutes/day), qualifying comfortably for the 5-Hour TRCA workload slab.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Reference Formula Box */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-2.5">
                <Info className="w-4 h-4 text-amber-600" />
                <h3>How Monthly Review Math Works</h3>
              </div>
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  <strong>1. Time Conversion Factor:</strong> Every point earned equals{' '}
                  <strong>2.4 minutes (144 seconds)</strong> of operational time.
                </p>
                <p>
                  <strong>2. Fixed Daily Allowance:</strong> Every working day automatically credits{' '}
                  <strong>18.75 points (45 minutes)</strong> for miscellaneous bag & account duties.
                </p>
                <p>
                  <strong>3. Monthly Averaging Formula:</strong>
                  <span className="block mt-1 p-2 bg-slate-100 rounded font-mono text-[11px] text-slate-800">
                    Daily Pts = (Monthly Txn Pts ÷ Working Days) + 18.75
                  </span>
                </p>
                <p>
                  <strong>4. Net Transaction Points Needed:</strong>
                  <br />• For 4 Hours (100 pts): <strong>81.25 Txn pts/day</strong> (2,031.25 pts in 25 days)
                  <br />• For 5 Hours (125 pts): <strong>106.25 Txn pts/day</strong> (2,656.25 pts in 25 days)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
