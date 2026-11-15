import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Clock,
  Award,
  TrendingUp,
  FileText,
  Share2,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Building2,
  User,
  Calendar,
  Mail,
  Landmark,
  ShieldCheck,
  Briefcase,
  Plus,
  Minus,
  Copy,
  Check,
  Info,
  ChevronRight,
  HelpCircle,
  SlidersHorizontal
} from 'lucide-react';

// ============================================================================
// CORE OPERATIONAL PARAMETERS (Revised BPM Workload Assessment Methodology)
// ============================================================================
const MINUTES_PER_POINT = 2.4; // 1 Point = 2.4 minutes (144 seconds)
const SECONDS_PER_POINT = 144;
const FIXED_MISC_POINTS_PER_DAY = 18.75; // 45 minutes (2,700 seconds) per working day
const SLAB_4HR_POINTS = 100.0; // 240 mins / 2.4 = 100.00 points/day
const SLAB_5HR_POINTS = 125.0; // 300 mins / 2.4 = 125.00 points/day

const ACTIVITIES = [
  {
    id: 'speed_post',
    slNo: 1,
    name: 'Booking of Inland Speed Post',
    shortName: 'Speed Post Booking',
    unit: 'per article',
    points: 1.71,
    category: 'mail',
    categoryLabel: 'Mail & Money Remittance',
    hint: 'Counter/DARPAN booking of Inland Speed Post articles'
  },
  {
    id: 'parcel',
    slNo: 2,
    name: 'Booking of Parcel',
    shortName: 'Parcel Booking',
    unit: 'per article',
    points: 1.71,
    category: 'mail',
    categoryLabel: 'Mail & Money Remittance',
    hint: 'Registered / India Post Parcel booking'
  },
  {
    id: 'emo',
    slNo: 3,
    name: 'Booking of eMO',
    shortName: 'eMO Booking',
    unit: 'per eMO',
    points: 2.21,
    category: 'mail',
    categoryLabel: 'Mail & Money Remittance',
    hint: 'Electronic Money Order booking on RICT/DARPAN'
  },
  {
    id: 'cod_mo',
    slNo: 4,
    name: 'Booking of COD Retail MO',
    shortName: 'COD Retail MO',
    unit: 'per article',
    points: 0.50,
    category: 'mail',
    categoryLabel: 'Mail & Money Remittance',
    hint: 'Cash on Delivery / e-Payment retail collection'
  },
  {
    id: 'stamps',
    slNo: 5,
    name: 'Sale of Stamps',
    shortName: 'Sale of Stamps',
    unit: 'per stamp',
    points: 0.45,
    category: 'mail',
    categoryLabel: 'Mail & Money Remittance',
    hint: 'Postage stamps & stationery sold across counter'
  },
  {
    id: 'new_account',
    slNo: 6,
    name: 'Opening of New Account',
    shortName: 'New POSB Account',
    unit: 'per account',
    points: 3.10,
    category: 'posb',
    categoryLabel: 'POSB Banking Operations',
    hint: 'SB, RD, TD, SSA, PPF, MIS, KVP, NSC new accounts opened'
  },
  {
    id: 'posb_deposit',
    slNo: 7,
    name: 'POSB Cash Deposit',
    shortName: 'POSB Cash Deposit',
    unit: 'per transaction',
    points: 1.00,
    category: 'posb',
    categoryLabel: 'POSB Banking Operations',
    hint: 'SB/RD/SSA subsequent cash deposits in DARPAN'
  },
  {
    id: 'posb_withdrawal',
    slNo: 8,
    name: 'POSB Cash Withdrawal',
    shortName: 'POSB Normal Withdrawal',
    unit: 'per transaction',
    points: 1.60,
    category: 'posb',
    categoryLabel: 'POSB Banking Operations',
    hint: 'Standard POSB cash withdrawal up to normal limit'
  },
  {
    id: 'high_value_withdrawal',
    slNo: 9,
    name: 'High Value Request Generation & Withdrawal',
    shortName: 'High-Value Withdrawal',
    unit: 'per transaction',
    points: 2.10,
    category: 'posb',
    categoryLabel: 'POSB Banking Operations',
    hint: 'High-value withdrawal request generation + payment execution'
  },
  {
    id: 'pli_collection',
    slNo: 10,
    name: 'PLI / RPLI Collection',
    shortName: 'PLI/RPLI Premium Collection',
    unit: 'per transaction',
    points: 1.30,
    category: 'pli',
    categoryLabel: 'PLI / RPLI Insurance',
    hint: 'Renewal premium or first premium collection in McCamish/DARPAN'
  },
  {
    id: 'pli_indexing',
    slNo: 11,
    name: 'Indexing of PLI / RPLI',
    shortName: 'PLI/RPLI New Proposal Indexing',
    unit: 'per transaction',
    points: 2.80,
    category: 'pli',
    categoryLabel: 'PLI / RPLI Insurance',
    hint: 'New PLI or RPLI proposal indexing at BO level'
  }
];

const INITIAL_COUNTS = ACTIVITIES.reduce((acc, item) => {
  acc[item.id] = 0;
  return acc;
}, {});

// Sample presets for instant demonstration during Sub-Divisional / Inspector reviews
const PRESET_SCENARIOS = {
  low_rural: {
    label: 'Low-Volume BO (~3.1 Hrs)',
    mode: 'monthly',
    workingDays: 25,
    boName: 'Borpathar BO',
    soName: 'Moranhat SO',
    bpmName: 'Sample Review - Deficit BO',
    counts: {
      speed_post: 45,
      parcel: 8,
      emo: 5,
      cod_mo: 15,
      stamps: 120,
      new_account: 28,
      posb_deposit: 620,
      posb_withdrawal: 240,
      high_value_withdrawal: 18,
      pli_collection: 75,
      pli_indexing: 4
    }
  },
  standard_4hr: {
    label: '4-Hour Qualified BO (~4.2 Hrs)',
    mode: 'monthly',
    workingDays: 25,
    boName: 'Khowang Ghat BO',
    soName: 'Khowang SO',
    bpmName: 'Sample Review - 4-Hr Slab',
    counts: {
      speed_post: 85,
      parcel: 15,
      emo: 12,
      cod_mo: 30,
      stamps: 200,
      new_account: 55,
      posb_deposit: 950,
      posb_withdrawal: 390,
      high_value_withdrawal: 45,
      pli_collection: 140,
      pli_indexing: 10
    }
  },
  high_5hr: {
    label: '5-Hour Level-2 BO (~5.3 Hrs)',
    mode: 'monthly',
    workingDays: 25,
    boName: 'Tingkhong Bazar BO',
    soName: 'Tingkhong SO',
    bpmName: 'Sample Review - 5-Hr TRCA',
    counts: {
      speed_post: 140,
      parcel: 28,
      emo: 20,
      cod_mo: 50,
      stamps: 310,
      new_account: 85,
      posb_deposit: 1320,
      posb_withdrawal: 540,
      high_value_withdrawal: 75,
      pli_collection: 210,
      pli_indexing: 18
    }
  }
};

export default function App() {
  // Mode: 'daily' (1 day) or 'monthly' (N working days)
  const [mode, setMode] = useState('monthly');
  const [workingDays, setWorkingDays] = useState(25);
  const [counts, setCounts] = useState(PRESET_SCENARIOS.standard_4hr.counts);

  // Administrative Metadata for Inspection / Review Sheets
  const [boMeta, setBoMeta] = useState({
    boName: 'Sample Branch Office BO',
    soName: 'Account Office SO',
    bpmName: '',
    reviewPeriod: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);

  // Effective working days based on mode
  const effectiveDays = mode === 'daily' ? 1 : Math.max(1, Number(workingDays) || 1);

  // ============================================================================
  // MATHEMATICAL ENGINE
  // ============================================================================
  const assessment = useMemo(() => {
    let totalVariablePoints = 0;
    let totalTransactions = 0;

    const categoryTotals = {
      mail: { points: 0, count: 0, label: 'Mail & Remittance' },
      posb: { points: 0, count: 0, label: 'POSB Banking' },
      pli: { points: 0, count: 0, label: 'PLI / RPLI Insurance' }
    };

    const activityBreakdown = ACTIVITIES.map((act) => {
      const rawCount = Number(counts[act.id]) || 0;
      const periodPoints = rawCount * act.points;
      const dailyAvgCount = rawCount / effectiveDays;
      const dailyAvgPoints = periodPoints / effectiveDays;
      const dailyAvgMinutes = dailyAvgPoints * MINUTES_PER_POINT;

      totalVariablePoints += periodPoints;
      totalTransactions += rawCount;

      if (categoryTotals[act.category]) {
        categoryTotals[act.category].points += dailyAvgPoints;
        categoryTotals[act.category].count += rawCount;
      }

      return {
        ...act,
        count: rawCount,
        periodPoints,
        dailyAvgCount,
        dailyAvgPoints,
        dailyAvgMinutes
      };
    });

    const dailyVariablePoints = totalVariablePoints / effectiveDays;
    const dailyMiscPoints = FIXED_MISC_POINTS_PER_DAY;
    const totalPeriodMiscPoints = FIXED_MISC_POINTS_PER_DAY * effectiveDays;

    const dailyTotalPoints = dailyVariablePoints + dailyMiscPoints;
    const totalPeriodPoints = totalVariablePoints + totalPeriodMiscPoints;

    // Time conversions
    const dailyTotalMinutes = dailyTotalPoints * MINUTES_PER_POINT;
    const dailyVariableMinutes = dailyVariablePoints * MINUTES_PER_POINT;
    const dailyMiscMinutes = dailyMiscPoints * MINUTES_PER_POINT; // 45.00 mins

    const hoursWhole = Math.floor(dailyTotalMinutes / 60);
    const minutesRemainder = Math.round(dailyTotalMinutes % 60);
    const decimalHours = dailyTotalMinutes / 60;

    // TRCA Slab Status Determination
    let slabStatus = 'UNDER_4HR';
    let slabBadge = 'Below 4-Hour Benchmark';
    let slabColor = 'amber';
    let nextTargetPoints = SLAB_4HR_POINTS;
    let nextTargetLabel = '4-Hour TRCA Benchmark (100 Pts/Day)';

    if (dailyTotalPoints >= SLAB_5HR_POINTS) {
      slabStatus = 'QUALIFIED_5HR';
      slabBadge = '5-Hour Slab (Level-2 TRCA Qualified)';
      slabColor = 'emerald';
      nextTargetPoints = SLAB_5HR_POINTS;
      nextTargetLabel = '5-Hour TRCA Benchmark Achieved';
    } else if (dailyTotalPoints >= SLAB_4HR_POINTS) {
      slabStatus = 'QUALIFIED_4HR';
      slabBadge = '4-Hour Slab Qualified (Level-1 Safe)';
      slabColor = 'blue';
      nextTargetPoints = SLAB_5HR_POINTS;
      nextTargetLabel = '5-Hour Level-2 Upgrade (125 Pts/Day)';
    }

    // Gap / Deficit Analysis
    const dailyDeficitTo4Hr = Math.max(0, SLAB_4HR_POINTS - dailyTotalPoints);
    const dailyDeficitTo5Hr = Math.max(0, SLAB_5HR_POINTS - dailyTotalPoints);
    const activeDailyGap =
      dailyTotalPoints < SLAB_4HR_POINTS ? dailyDeficitTo4Hr : dailyDeficitTo5Hr;
    const activePeriodGap = activeDailyGap * effectiveDays;

    return {
      activityBreakdown,
      categoryTotals,
      totalTransactions,
      totalVariablePoints,
      totalPeriodMiscPoints,
      totalPeriodPoints,
      dailyVariablePoints,
      dailyMiscPoints,
      dailyTotalPoints,
      dailyTotalMinutes,
      dailyVariableMinutes,
      dailyMiscMinutes,
      hoursWhole,
      minutesRemainder,
      decimalHours,
      slabStatus,
      slabBadge,
      slabColor,
      nextTargetPoints,
      nextTargetLabel,
      dailyDeficitTo4Hr,
      dailyDeficitTo5Hr,
      activeDailyGap,
      activePeriodGap
    };
  }, [counts, effectiveDays]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleCountChange = (id, value) => {
    const cleanVal = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0);
    setCounts((prev) => ({
      ...prev,
      [id]: cleanVal
    }));
  };

  const adjustCount = (id, delta) => {
    setCounts((prev) => {
      const current = Number(prev[id]) || 0;
      return {
        ...prev,
        [id]: Math.max(0, current + delta)
      };
    });
  };

  const applyPreset = (presetKey) => {
    const p = PRESET_SCENARIOS[presetKey];
    if (!p) return;
    setMode(p.mode);
    setWorkingDays(p.workingDays);
    setCounts({ ...p.counts });
    setBoMeta((prev) => ({
      ...prev,
      boName: p.boName,
      soName: p.soName,
      bpmName: p.bpmName
    }));
  };

  const clearAll = () => {
    setCounts({ ...INITIAL_COUNTS });
  };

  // Format WhatsApp Executive Report for Sub-Divisional / Overseer / BPM Groups
  const generateWhatsAppReport = () => {
    const topActivities = [...assessment.activityBreakdown]
      .filter((a) => a.count > 0)
      .sort((a, b) => b.dailyAvgPoints - a.dailyAvgPoints)
      .slice(0, 5);

    const lines = [
      `📮 *INDIA POST - BPM WORKLOAD & TRCA ASSESSMENT*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🏢 *BO Name:* ${boMeta.boName || 'N/A'}`,
      `🏛️ *Account Office:* ${boMeta.soName || 'N/A'}`,
      `📅 *Assessment Mode:* ${
        mode === 'daily' ? 'Single Day (1 Working Day)' : `${effectiveDays} Working Days (${boMeta.reviewPeriod})`
      }`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📊 *DAILY WORKLOAD SUMMARY*`,
      `• Counter/DARPAN Points: *${assessment.dailyVariablePoints.toFixed(2)} pts/day* (${assessment.dailyVariableMinutes.toFixed(1)} mins)`,
      `• Fixed Misc. Allowance: *${assessment.dailyMiscPoints.toFixed(2)} pts/day* (45.0 mins)`,
      `• *TOTAL DAILY SCORE:* *${assessment.dailyTotalPoints.toFixed(2)} Points/Day*`,
      `• *ASSESSED WORKING TIME:* *${assessment.hoursWhole} Hrs ${assessment.minutesRemainder} Mins / Day* (${assessment.dailyTotalMinutes.toFixed(1)} mins)`,
      `• *TRCA SLAB STATUS:* *${assessment.slabBadge}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`
    ];

    if (topActivities.length > 0) {
      lines.push(`📌 *TOP WORKLOAD CONTRIBUTORS (Daily Avg):*`);
      topActivities.forEach((act) => {
        lines.push(
          `• ${act.shortName}: ${act.count} total (${act.dailyAvgPoints.toFixed(2)} pts/day)`
        );
      });
      lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
    }

    if (assessment.activeDailyGap > 0) {
      const targetName =
        assessment.dailyTotalPoints < SLAB_4HR_POINTS
          ? '4-Hour Slab (100 Pts/Day)'
          : '5-Hour Level-2 Slab (125 Pts/Day)';
      const neededAccounts = Math.ceil(assessment.activePeriodGap / 3.1);
      const neededPLI = Math.ceil(assessment.activePeriodGap / 2.8);
      const neededDeposits = Math.ceil(assessment.activePeriodGap / 1.0);

      lines.push(`🎯 *ACTION PLAN TO REACH ${targetName.toUpperCase()}:*`);
      lines.push(
        `• Point Deficit: *${assessment.activeDailyGap.toFixed(2)} pts/day* (${assessment.activePeriodGap.toFixed(1)} pts over ${effectiveDays} days)`
      );
      lines.push(`• Equivalent to ANY ONE of the following in ${effectiveDays} days:`);
      lines.push(`  👉 *${neededAccounts}* New POSB Accounts (@ 3.10 pts)`);
      lines.push(`  👉 *${neededPLI}* New PLI/RPLI Proposals Indexed (@ 2.80 pts)`);
      lines.push(`  👉 *${neededDeposits}* Additional POSB Deposits (@ 1.00 pt)`);
    } else {
      lines.push(`✅ *Benchmark Exceeded!* BO qualifies for maximum 5-Hour TRCA Slab (125+ pts/day).`);
    }

    return lines.join('\n');
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppReport();
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const filteredActivities = useMemo(() => {
    if (activeCategory === 'all') return assessment.activityBreakdown;
    return assessment.activityBreakdown.filter((a) => a.category === activeCategory);
  }, [assessment.activityBreakdown, activeCategory]);

  // Progress bar percentage (scaled up to 140 points max for visual breathing room)
  const gaugePercent = Math.min(100, (assessment.dailyTotalPoints / 140) * 100);
  const marker4HrPercent = (100 / 140) * 100; // ~71.4%
  const marker5HrPercent = (125 / 140) * 100; // ~89.3%

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 print:bg-white print:pb-0">
      {/* ====================================================================
          TOP INDIA POST EXECUTIVE HEADER
      ==================================================================== */}
      <header className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white shadow-lg border-b-4 border-amber-400 print:bg-white print:text-slate-900 print:border-b-2 print:border-slate-800 print:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="bg-amber-400 text-red-950 p-2.5 rounded-xl shadow-md shrink-0 print:border print:border-slate-400">
                <Calculator className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-red-950/60 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30 print:bg-slate-100 print:text-slate-800">
                    Department of Posts • BO Establishment Tool
                  </span>
                  <span className="text-xs text-red-100 font-medium">
                    1 Pt = 2.4 Mins (144 Secs)
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
                  BPM Revised Workload & TRCA Point Calculator
                </h1>
                <p className="text-xs sm:text-sm text-red-100/90 print:text-slate-600">
                  Assess daily working hours, 100/125 point TRCA slabs, and target action plans under the revised 12-parameter work study
                </p>
              </div>
            </div>

            {/* Action Toolbar (Hidden in Print) */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <button
                onClick={() => setShowReferenceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-950/50 hover:bg-red-950/80 text-amber-200 border border-red-700 transition cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                Norms & Formula
              </button>
              <button
                onClick={handleCopyWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-red-950 shadow-sm transition cursor-pointer"
              >
                {copiedWhatsApp ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-800" />
                    Copied for WhatsApp!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Copy WhatsApp Summary
                  </>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Sheet
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ====================================================================
            CONTROL BAR: BO DETAILS, INPUT MODE (DAILY vs MONTHLY), PRESETS
        ==================================================================== */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 print:shadow-none print:border-slate-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* BO Metadata Inputs */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Branch Office (BO) Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={boMeta.boName}
                    onChange={(e) => setBoMeta({ ...boMeta, boName: e.target.value })}
                    placeholder="e.g. Rajgarh BO"
                    className="w-full pl-9 pr-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Account Office (SO)
                </label>
                <div className="relative">
                  <Landmark className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={boMeta.soName}
                    onChange={(e) => setBoMeta({ ...boMeta, soName: e.target.value })}
                    placeholder="e.g. Naharkatia SO"
                    className="w-full pl-9 pr-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Review Month / Period
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={boMeta.reviewPeriod}
                    onChange={(e) => setBoMeta({ ...boMeta, reviewPeriod: e.target.value })}
                    placeholder="e.g. Nov 2026"
                    className="w-full pl-9 pr-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Assessment Mode & Working Days Selector */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-5">
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Transaction Input Mode
                </label>
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMode('daily')}
                    className={`py-1.5 px-2.5 text-xs font-bold rounded-md transition cursor-pointer ${
                      mode === 'daily'
                        ? 'bg-red-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Single Day (1 Day)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('monthly')}
                    className={`py-1.5 px-2.5 text-xs font-bold rounded-md transition cursor-pointer ${
                      mode === 'monthly'
                        ? 'bg-red-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly / Period
                  </button>
                </div>
              </div>

              {mode === 'monthly' && (
                <div className="sm:w-44">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Working Days in Period
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="366"
                      value={workingDays}
                      onChange={(e) => setWorkingDays(e.target.value)}
                      className="w-16 px-2.5 py-1.5 text-sm font-bold text-center bg-amber-50 border border-amber-300 text-red-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <div className="flex gap-1">
                      {[24, 25, 26].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setWorkingDays(d)}
                          className={`px-2 py-1.5 text-xs font-bold rounded border transition cursor-pointer ${
                            Number(workingDays) === d
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={`Set ${d} working days`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Sample Presets Bar (Hidden in Print) */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 print:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-700" />
                Load Sample BO Scenario:
              </span>
              {Object.entries(PRESET_SCENARIOS).map(([key, scenario]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-800 border border-slate-200 hover:border-red-200 transition cursor-pointer"
                >
                  {scenario.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 px-2.5 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Counts to Zero
            </button>
          </div>
        </section>

        {/* ====================================================================
            EXECUTIVE KPI SCORECARDS & VISUAL TRCA SLAB GAUGE
        ==================================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Daily Points */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assessed Daily Points
              </span>
              <span className="p-2 rounded-lg bg-red-50 text-red-700">
                <Award className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-900">
                {assessment.dailyTotalPoints.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500">pts / day</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Counter: {assessment.dailyVariablePoints.toFixed(2)}</span>
              <span className="font-semibold text-amber-700">+ Misc: 18.75</span>
            </div>
          </div>

          {/* Card 2: Assessed Working Hours */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Daily Working Time
              </span>
              <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <Clock className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-900">
                {assessment.hoursWhole}h {assessment.minutesRemainder}m
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({assessment.dailyTotalMinutes.toFixed(1)} mins)
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Work: {assessment.dailyVariableMinutes.toFixed(1)}m</span>
              <span className="font-semibold text-amber-700">+ Misc: 45.0m</span>
            </div>
          </div>

          {/* Card 3: TRCA Slab Qualification Status */}
          <div
            className={`rounded-2xl p-5 border shadow-sm ${
              assessment.slabStatus === 'QUALIFIED_5HR'
                ? 'bg-emerald-50/70 border-emerald-300'
                : assessment.slabStatus === 'QUALIFIED_4HR'
                ? 'bg-blue-50/70 border-blue-300'
                : 'bg-amber-50/70 border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                TRCA Workload Slab
              </span>
              {assessment.slabStatus === 'UNDER_4HR' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              ) : (
                <CheckCircle2
                  className={`w-5 h-5 ${
                    assessment.slabStatus === 'QUALIFIED_5HR'
                      ? 'text-emerald-600'
                      : 'text-blue-600'
                  }`}
                />
              )}
            </div>
            <div className="mt-2">
              <span
                className={`text-lg font-black leading-snug block ${
                  assessment.slabStatus === 'QUALIFIED_5HR'
                    ? 'text-emerald-900'
                    : assessment.slabStatus === 'QUALIFIED_4HR'
                    ? 'text-blue-900'
                    : 'text-amber-900'
                }`}
              >
                {assessment.slabBadge}
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-black/10 text-xs font-semibold text-slate-700">
              {assessment.slabStatus === 'UNDER_4HR' && (
                <span>
                  Short by{' '}
                  <strong className="text-red-700">
                    {assessment.dailyDeficitTo4Hr.toFixed(2)} pts/day
                  </strong>{' '}
                  for 4-Hr Slab
                </span>
              )}
              {assessment.slabStatus === 'QUALIFIED_4HR' && (
                <span>
                  Need{' '}
                  <strong className="text-blue-800">
                    +{assessment.dailyDeficitTo5Hr.toFixed(2)} pts/day
                  </strong>{' '}
                  for 5-Hr TRCA
                </span>
              )}
              {assessment.slabStatus === 'QUALIFIED_5HR' && (
                <span className="text-emerald-800">
                  Surplus of +{(assessment.dailyTotalPoints - 125).toFixed(2)} pts/day above 5-Hr norm
                </span>
              )}
            </div>
          </div>

          {/* Card 4: Period Cumulative Totals */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {mode === 'daily' ? 'Single Day Volume' : `${effectiveDays}-Day Period Total`}
              </span>
              <span className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-900">
                {assessment.totalPeriodPoints.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-500">total pts</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Total Txns: {assessment.totalTransactions.toLocaleString('en-IN')}</span>
              <span>Avg: {(assessment.totalTransactions / effectiveDays).toFixed(1)}/day</span>
            </div>
          </div>
        </section>

        {/* ====================================================================
            VISUAL WORKLOAD PROGRESS GAUGE (4-HR vs 5-HR BENCHMARKS)
        ==================================================================== */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>BPM Daily Workload Benchmark Meter</span>
                <span className="text-xs font-normal text-slate-500">
                  (Includes 18.75 Fixed Misc. Points = 45 Mins/Day)
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                &lt; 100 Pts (&lt;4 Hrs)
              </span>
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                100 Pts (4-Hr Slab)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                125 Pts (5-Hr Level-2)
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="relative pt-6 pb-2">
            {/* Milestone Flags */}
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${(18.75 / 140) * 100}%` }}
            >
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                18.75 (Misc)
              </span>
              <div className="w-0.5 h-2 bg-slate-400"></div>
            </div>

            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${marker4HrPercent}%` }}
            >
              <span className="text-[10px] font-extrabold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-300">
                100 Pts (4 Hrs)
              </span>
              <div className="w-0.5 h-2 bg-blue-600"></div>
            </div>

            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${marker5HrPercent}%` }}
            >
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                125 Pts (5 Hrs)
              </span>
              <div className="w-0.5 h-2 bg-emerald-600"></div>
            </div>

            {/* Bar */}
            <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  assessment.slabStatus === 'QUALIFIED_5HR'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    : assessment.slabStatus === 'QUALIFIED_4HR'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gradient-to-r from-amber-400 to-red-600'
                }`}
                style={{ width: `${gaugePercent}%` }}
              />
              {/* Vertical Marker Lines inside bar */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-900/50"
                style={{ left: `${marker4HrPercent}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-emerald-900/50"
                style={{ left: `${marker5HrPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* ====================================================================
            MAIN WORKSPACE: LEFT (11+1 ACTIVITY INPUTS) | RIGHT (ANALYSIS & TARGETS)
        ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 8 COLUMNS: INTERACTIVE ACTIVITY TABLE */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Category Filter Tabs */}
            <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  BO Operational Parameters (Sl. No. 1 to 12)
                </h2>
                <p className="text-xs text-slate-500">
                  Enter{' '}
                  <strong className="text-slate-800">
                    {mode === 'daily'
                      ? 'Single Day Transactions'
                      : `Total Transactions across ${effectiveDays} Working Days`}
                  </strong>
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 print:hidden">
                {[
                  { id: 'all', label: 'All (12)' },
                  { id: 'mail', label: 'Mail & MO (5)' },
                  { id: 'posb', label: 'POSB (4)' },
                  { id: 'pli', label: 'PLI/RPLI (2)' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeCategory === tab.id
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Rows */}
            <div className="divide-y divide-slate-200">
              {filteredActivities.map((act) => {
                const isHighWeight = act.points >= 2.0;
                return (
                  <div
                    key={act.id}
                    className={`p-4 sm:px-6 transition hover:bg-slate-50/80 ${
                      act.count > 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      {/* Activity Title & Point Norm */}
                      <div className="sm:col-span-6">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {act.slNo}
                          </span>
                          <span className="font-bold text-sm text-slate-900">
                            {act.name}
                          </span>
                          {isHighWeight && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              High Weight
                            </span>
                          )}
                        </div>
                        <div className="mt-1 pl-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="font-semibold text-red-800">
                            {act.points.toFixed(2)} pts {act.unit}
                          </span>
                          <span>•</span>
                          <span>
                            {(act.points * MINUTES_PER_POINT).toFixed(2)} mins (
                            {(act.points * SECONDS_PER_POINT).toFixed(1)}s)
                          </span>
                        </div>
                      </div>

                      {/* Transaction Counter Input with Steppers */}
                      <div className="sm:col-span-3 flex items-center justify-start sm:justify-center">
                        <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white shadow-2xs overflow-hidden">
                          <button
                            type="button"
                            onClick={() => adjustCount(act.id, -1)}
                            className="p-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition print:hidden cursor-pointer"
                            title="Decrease by 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={counts[act.id]}
                            onChange={(e) => handleCountChange(act.id, e.target.value)}
                            className="w-20 text-center font-bold text-sm text-slate-900 py-1.5 focus:outline-none focus:bg-amber-50"
                          />
                          <button
                            type="button"
                            onClick={() => adjustCount(act.id, 1)}
                            className="p-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition print:hidden cursor-pointer"
                            title="Increase by 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Calculated Daily Points & Time */}
                      <div className="sm:col-span-3 text-left sm:text-right pl-8 sm:pl-0">
                        <div className="text-sm font-extrabold text-slate-900">
                          {act.dailyAvgPoints.toFixed(2)}{' '}
                          <span className="text-xs font-semibold text-slate-500">pts/day</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {act.dailyAvgMinutes.toFixed(1)} mins/day
                          {mode === 'monthly' && act.count > 0 && (
                            <span className="block text-[11px] text-slate-400">
                              ({act.periodPoints.toFixed(1)} pts total)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* SL NO 12: FIXED MISCELLANEOUS ACTIVITIES ALLOWANCE */}
              <div className="p-4 sm:px-6 bg-amber-50/70 border-t-2 border-amber-200">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-6">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-red-950 text-xs font-black flex items-center justify-center shrink-0">
                        12
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        Miscellaneous Activities (Fixed Allowance)
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-800 text-white">
                        Auto-Credited
                      </span>
                    </div>
                    <p className="mt-1 pl-8 text-xs text-slate-600">
                      Bag opening/closing, daily account generation, cash remittance & BO upkeep
                      (45 mins = 2,700 secs/day)
                    </p>
                  </div>

                  <div className="sm:col-span-3 text-left sm:text-center pl-8 sm:pl-0">
                    <span className="inline-block px-3 py-1 rounded-lg bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950">
                      {effectiveDays} {effectiveDays === 1 ? ' Working Day' : ' Working Days'}
                    </span>
                  </div>

                  <div className="sm:col-span-3 text-left sm:text-right pl-8 sm:pl-0">
                    <div className="text-sm font-extrabold text-red-900">
                      18.75 <span className="text-xs font-semibold text-slate-600">pts/day</span>
                    </div>
                    <div className="text-xs font-semibold text-amber-800">
                      45.0 mins/day
                      {mode === 'monthly' && (
                        <span className="block text-[11px] text-slate-500">
                          ({assessment.totalPeriodMiscPoints.toFixed(2)} pts total)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Summary Footer */}
            <div className="p-4 sm:px-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                  Net Assessed Daily Workload (Variable + 18.75 Misc)
                </span>
                <span className="text-sm text-slate-300">
                  1 Point = 2.4 Minutes • Total Counter Txns:{' '}
                  <strong className="text-white">{assessment.totalTransactions}</strong>
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-2xl font-black text-amber-400">
                  {assessment.dailyTotalPoints.toFixed(2)} Points / Day
                </span>
                <span className="block text-xs font-bold text-slate-300">
                  Equivalent to {assessment.hoursWhole} Hours {assessment.minutesRemainder} Minutes (
                  {assessment.decimalHours.toFixed(2)} Hrs/Day)
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: DEFICIT OPTIMIZER & CATEGORY SHARE */}
          <div className="lg:col-span-4 space-y-6">
            {/* TARGET & DEFICIT OPTIMIZER CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  TRCA Target Optimizer
                </div>
                <h3 className="text-base font-bold mt-1">
                  {assessment.activeDailyGap > 0
                    ? `How to Reach ${assessment.nextTargetLabel}`
                    : '5-Hour Level-2 TRCA Benchmark Achieved!'}
                </h3>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {assessment.activeDailyGap > 0 ? (
                  <>
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase text-red-800 block">
                          Net Point Deficit
                        </span>
                        <span className="text-xs text-red-700">
                          Across {effectiveDays} {effectiveDays === 1 ? 'day' : 'working days'}:{' '}
                          <strong>{assessment.activePeriodGap.toFixed(1)} pts</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-red-800">
                          +{assessment.activeDailyGap.toFixed(2)}
                        </span>
                        <span className="block text-[11px] font-bold text-red-700">pts / day</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      To bridge this gap of{' '}
                      <strong className="text-slate-900">
                        {assessment.activePeriodGap.toFixed(1)} total points
                      </strong>{' '}
                      in{' '}
                      {mode === 'daily'
                        ? 'a single day'
                        : `a ${effectiveDays}-day review period`}
                      , the BPM can achieve <strong>ANY ONE</strong> (or a combination) of the
                      following additional transactions:
                    </p>

                    <div className="space-y-2.5">
                      {[
                        {
                          title: 'New POSB Accounts Opened',
                          pts: 3.1,
                          unit: 'accounts',
                          badge: 'Fastest Booster'
                        },
                        {
                          title: 'New PLI / RPLI Proposals Indexed',
                          pts: 2.8,
                          unit: 'proposals',
                          badge: 'High Weight'
                        },
                        {
                          title: 'High-Value POSB Withdrawals',
                          pts: 2.1,
                          unit: 'txns',
                          badge: 'DARPAN'
                        },
                        {
                          title: 'Inland Speed Post / Parcels Booked',
                          pts: 1.71,
                          unit: 'articles',
                          badge: 'Mail'
                        },
                        {
                          title: 'PLI / RPLI Renewal Collections',
                          pts: 1.3,
                          unit: 'collections',
                          badge: 'Insurance'
                        },
                        {
                          title: 'POSB Cash Deposits',
                          pts: 1.0,
                          unit: 'deposits',
                          badge: 'Routine'
                        }
                      ].map((item) => {
                        const periodNeeded = Math.ceil(assessment.activePeriodGap / item.pts);
                        const dailyNeeded = (assessment.activeDailyGap / item.pts).toFixed(1);
                        return (
                          <div
                            key={item.title}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-800">{item.title}</div>
                              <div className="text-[11px] text-slate-500">
                                @ {item.pts.toFixed(2)} pts • ~{dailyNeeded}/day
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-extrabold text-red-800 shadow-2xs">
                                +{periodNeeded} {item.unit}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Full 5-Hour Workload Justified!
                    </h4>
                    <p className="text-xs text-slate-600">
                      This Branch Office generates{' '}
                      <strong>{assessment.dailyTotalPoints.toFixed(2)} points/day</strong> (
                      {assessment.hoursWhole} hrs {assessment.minutesRemainder} mins), exceeding the
                      125.00 points/day requirement for Level-2 (5-Hour) TRCA.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CATEGORY CONTRIBUTION BREAKDOWN */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Daily Point Composition</span>
                <span className="text-xs font-normal text-slate-500">
                  Out of {assessment.dailyTotalPoints.toFixed(2)} pts/day
                </span>
              </h3>

              <div className="space-y-3">
                {[
                  {
                    key: 'posb',
                    label: 'POSB Banking (Sl. 6–9)',
                    points: assessment.categoryTotals.posb.points,
                    color: 'bg-blue-600'
                  },
                  {
                    key: 'mail',
                    label: 'Mail & Money Order (Sl. 1–5)',
                    points: assessment.categoryTotals.mail.points,
                    color: 'bg-red-700'
                  },
                  {
                    key: 'pli',
                    label: 'PLI / RPLI Insurance (Sl. 10–11)',
                    points: assessment.categoryTotals.pli.points,
                    color: 'bg-emerald-600'
                  },
                  {
                    key: 'misc',
                    label: 'Fixed Miscellaneous (Sl. 12)',
                    points: assessment.dailyMiscPoints,
                    color: 'bg-amber-500'
                  }
                ].map((cat) => {
                  const pct =
                    assessment.dailyTotalPoints > 0
                      ? (cat.points / assessment.dailyTotalPoints) * 100
                      : 0;
                  return (
                    <div key={cat.key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{cat.label}</span>
                        <span className="font-bold text-slate-900">
                          {cat.points.toFixed(2)} pts ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${cat.color} rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reference Box */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-700">Official Conversion Norms:</div>
                <div>• 4-Hour Workload = 100.00 Pts/Day (81.25 Counter + 18.75 Misc)</div>
                <div>• 5-Hour Workload = 125.00 Pts/Day (106.25 Counter + 18.75 Misc)</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ====================================================================
          MODAL: OFFICIAL WORK STUDY REFERENCE & FORMULA MATRIX
      ==================================================================== */}
      {showReferenceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-4 sm:p-5 bg-red-900 text-white flex items-center justify-between sticky top-0">
              <div>
                <h3 className="text-base font-bold">
                  Revised BPM Workload Assessment Methodology
                </h3>
                <p className="text-xs text-red-100">
                  1 Point = 2.4 Minutes (144 Seconds) • Fixed Misc. Allowance = 18.75 Points/Day
                </p>
              </div>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">Sl.</th>
                      <th className="py-2.5 px-3 font-bold">Activity</th>
                      <th className="py-2.5 px-3 font-bold text-right">Points</th>
                      <th className="py-2.5 px-3 font-bold text-right">Minutes</th>
                      <th className="py-2.5 px-3 font-bold text-right">Seconds</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ACTIVITIES.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-600">{a.slNo}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {a.name}{' '}
                          <span className="text-slate-400 font-normal">({a.unit})</span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-red-800">
                          {a.points.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700">
                          {(a.points * 2.4).toFixed(2)}m
                        </td>
                        <td className="py-2 px-3 text-right text-slate-500">
                          {(a.points * 144).toFixed(1)}s
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-amber-50 font-bold text-slate-900">
                      <td className="py-2.5 px-3">12</td>
                      <td className="py-2.5 px-3">Miscellaneous Activities (per day)</td>
                      <td className="py-2.5 px-3 text-right text-red-800">18.75</td>
                      <td className="py-2.5 px-3 text-right">45.00m</td>
                      <td className="py-2.5 px-3 text-right">2,700.0s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}