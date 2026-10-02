import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Layers,
  Calendar,
  Sparkles,
  Info,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { appStorage } from '../../lib/storage';
import { dataService } from '../../lib/dataService';
import { requestDemandForecast } from '../../lib/aiServiceClient';
import { BloodGroup, BloodComponent, DemandForecastResult } from '../../types';

export const ForecastPage: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>('Red Blood Cells');
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [forecastData, setForecastData] = useState<DemandForecastResult | null>(null);

  const stock = dataService.getStock();
  const currentAvailableUnits = stock
    .filter((s) => s.blood_group === selectedGroup && s.status === 'available')
    .reduce((acc, curr) => acc + curr.units_available, 0);

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const components: BloodComponent[] = [
    'Whole Blood',
    'Red Blood Cells',
    'Platelets',
    'Fresh Frozen Plasma',
    'Cryoprecipitate',
  ];

  const fetchForecast = async () => {
    setIsLoading(true);
    try {
      const data = await requestDemandForecast(
        selectedGroup,
        selectedComponent,
        currentAvailableUnits || 6,
        horizonDays
      );
      setForecastData(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [selectedGroup, selectedComponent, horizonDays]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              AI Blood Demand Forecasting
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              Predictive Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ridge-regression time-series engine with rolling-average baseline fallback and stock gap warning indicators.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchForecast}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Re-run Model
        </Button>
      </div>

      {/* Synthetic Demonstration Notice */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800 font-semibold block mb-0.5">
            Synthetic & Baseline Simulation Demonstration
          </strong>
          Projections shown are calculated via Ridge Regression models trained on historical intake seasonality. Shortage warnings represent probabilistic risk indicators to assist hospital triage coordinators.
        </p>
      </div>

      {/* Control Selector Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Blood Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as BloodGroup)}
              className="bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#C62828]"
            >
              {bloodGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Component
            </label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value as BloodComponent)}
              className="bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
            >
              {components.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Forecast Horizon
            </label>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setHorizonDays(7)}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  horizonDays === 7 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setHorizonDays(14)}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  horizonDays === 14 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                14 Days
              </button>
              <button
                onClick={() => setHorizonDays(30)}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  horizonDays === 30 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Usable Stock On Hand</span>
          <strong className="text-lg font-black text-slate-900">
            {currentAvailableUnits} units
          </strong>
        </div>
      </div>

      {/* Shortage Risk Callout Banner */}
      {forecastData && (
        <div
          className={`p-5 rounded-2xl border flex items-start gap-4 ${
            forecastData.shortage_risk === 'high'
              ? 'bg-red-50 border-red-300 text-red-900'
              : forecastData.shortage_risk === 'moderate'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <strong className="text-sm font-bold uppercase tracking-wider">
                Shortage Risk Assessment: {forecastData.shortage_risk}
              </strong>
              <span className="font-mono text-[10px] bg-black/10 px-1.5 py-0.5 rounded">
                Model: {forecastData.model_version}
              </span>
            </div>
            <p className="leading-relaxed">{forecastData.shortage_warning}</p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      {forecastData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Projected {horizonDays}-Day Demand
            </span>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {forecastData.total_projected_demand} units
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Expected draw</span>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Usable Inventory</span>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {forecastData.current_available_stock} units
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Unreserved stock</span>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Projected Net Gap</span>
            <div
              className={`text-2xl font-black mt-2 ${
                forecastData.stock_gap < 0 ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {forecastData.stock_gap > 0 ? `+${forecastData.stock_gap}` : forecastData.stock_gap}{' '}
              units
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {forecastData.stock_gap < 0 ? 'Projected deficit' : 'Surplus margin'}
            </span>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Model Accuracy (MAE)</span>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {forecastData.model_mae} units
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              +{forecastData.performance_improvement_pct}% vs rolling baseline
            </span>
          </Card>
        </div>
      )}

      {/* Main Chart Card */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Projected Daily Demand & Confidence Interval (+/- 1.5 MAE)
            </h3>
            <p className="text-xs text-slate-500">
              Shaded band denotes statistical upper & lower confidence boundaries.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C62828]" /> Predicted Units
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-200" /> Upper/Lower Band
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="h-72 flex items-center justify-center text-xs text-slate-400">
            Evaluating time-series regression models...
          </div>
        ) : (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData?.forecast_points || []}>
                <defs>
                  <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C62828" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C62828" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                          <strong className="block text-slate-200">
                            {data.date} ({data.day})
                          </strong>
                          <p className="text-red-400 font-bold">
                            Predicted: {data.predicted_units} units
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Range: {data.lower_bound} - {data.upper_bound} units
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upper_bound"
                  stroke="#cbd5e1"
                  fill="url(#bandGrad)"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="predicted_units"
                  stroke="#C62828"
                  strokeWidth={2.5}
                  fill="url(#predictedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};
