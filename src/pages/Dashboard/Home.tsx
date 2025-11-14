import PageMeta from "../../components/common/PageMeta";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePaymentSummary, useTripSummary, useTripStats, usePaymentStats, usePaymentTimeseries, useTripTimeseries } from "../../hooks/useStats";
import TimeseriesChart from "../../components/charts/TimeseriesChart";
import { useMemo, useState } from "react";
import { useCompanies } from "../../hooks/useCompanies";

type DateRangeKey = "all" | "30d" | "90d" | "year";

export default function Home() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const navigate = useNavigate();

  const [selectedCompany, setSelectedCompany] = useState<string | "all">("all");
  const [dateRange, setDateRange] = useState<DateRangeKey>("all");

  const paymentFilters = useMemo(() => {
    const filters: Record<string, any> = {};

    if (selectedCompany !== "all") {
      filters.company_code = selectedCompany;
    }

    if (dateRange !== "all") {
      const now = new Date();
      let from: Date;

      if (dateRange === "30d") {
        from = new Date(now);
        from.setDate(now.getDate() - 30);
      } else if (dateRange === "90d") {
        from = new Date(now);
        from.setDate(now.getDate() - 90);
      } else {
        // "year" – from start of current year
        from = new Date(now.getFullYear(), 0, 1);
      }

      const to = now;
      filters.from_date = from.toISOString().slice(0, 10);
      filters.to_date = to.toISOString().slice(0, 10);
    }

    return filters;
  }, [selectedCompany, dateRange]);

  const { data: paySummary } = usePaymentSummary(paymentFilters);
  const { data: tripSummary } = useTripSummary(paymentFilters);
  const { data: tripStats } = useTripStats(paymentFilters);
  const { data: payStats } = usePaymentStats(paymentFilters);
  const { data: payTs } = usePaymentTimeseries({ ...paymentFilters, period: "upload" });
  const { data: tripTs } = useTripTimeseries({ ...paymentFilters, period: "upload" });

  // Prepare pie chart data for trips by status
  const tripsStatusPieData = useMemo(() => {
    return (tripStats?.by_status || []).map((item: any) => ({
      label: item.trip_status || "unknown",
      value: item.count || 0,
    }));
  }, [tripStats]);

  const handleOpenPaymentRecords = () => {
    const params = new URLSearchParams();
    if (selectedCompany !== "all") {
      params.set("company_code", selectedCompany);
    }
    if (paymentFilters.from_date) {
      params.set("from_date", paymentFilters.from_date);
    }
    if (paymentFilters.to_date) {
      params.set("to_date", paymentFilters.to_date);
    }
    navigate(`/payroll/records?${params.toString()}`);
  };

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">

          {/* Dashboard filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard Overview</h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Company</span>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value as string | "all")}
                  className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All companies</option>
                  {companies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Period</span>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
                  className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All time</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="year">This year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trip status distribution and Payment summary - Side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Trip status distribution - Details table (narrower) */}
            {tripsStatusPieData.length > 0 && (() => {
              const total = tripsStatusPieData.reduce((sum: number, item: { value: number }) => sum + item.value, 0);
              return (
                <div className="lg:col-span-1 rounded-xl border p-4 bg-white shadow-sm">
                  <div className="text-sm font-medium mb-4">{t('dashboard.tripsByStatus')} - Details</div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {tripsStatusPieData
                      .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
                      .map((item: { label: string; value: number }, index: number) => {
                        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00';
                        // Convert label to trip_status format (e.g., "rider cancelled" -> "rider_cancelled")
                        const tripStatus = item.label.toLowerCase().replace(/\s+/g, '_');
                        const handleClick = () => {
                          // Build URL with current filters and trip status
                          const params = new URLSearchParams();
                          if (selectedCompany !== 'all') {
                            params.set('company_code', selectedCompany);
                          }
                          if (dateRange !== 'all') {
                            // Add date range filters if needed
                            const now = new Date();
                            let fromDate = '';
                            let toDate = now.toISOString().split('T')[0];
                            if (dateRange === '30d') {
                              const date = new Date(now);
                              date.setDate(date.getDate() - 30);
                              fromDate = date.toISOString().split('T')[0];
                            } else if (dateRange === '90d') {
                              const date = new Date(now);
                              date.setDate(date.getDate() - 90);
                              fromDate = date.toISOString().split('T')[0];
                            } else if (dateRange === 'year') {
                              fromDate = `${now.getFullYear()}-01-01`;
                            }
                            if (fromDate) {
                              params.set('from_date', fromDate);
                              params.set('to_date', toDate);
                            }
                          }
                          params.set('trip_status', tripStatus);
                          navigate(`/trips/records?${params.toString()}`);
                        };
                        return (
                          <div
                            key={item.label}
                            onClick={handleClick}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: [
                                    "#465FFF",
                                    "#10B981",
                                    "#F59E0B",
                                    "#EF4444",
                                    "#8B5CF6",
                                    "#06B6D4",
                                    "#F97316",
                                    "#EC4899",
                                  ][index % 8],
                                }}
                              />
                              <span className="text-xs font-medium text-gray-900 truncate capitalize">
                                {item.label}
                              </span>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-sm font-bold text-gray-900 tabular-nums">
                                {item.value.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 tabular-nums">
                                {percentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Total</span>
                      <span className="text-base font-bold text-gray-900 tabular-nums">
                        {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Payment Summary (wider) */}
            <div className="lg:col-span-2 rounded-xl border p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium">Payment Summary</div>
                <button
                  type="button"
                  onClick={handleOpenPaymentRecords}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View payment records
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gross revenue */}
                <div className="p-5 bg-gray-50 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-2">Gross Revenue</div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {paySummary?.total_revenue != null
                      ? `€${Number(paySummary.total_revenue).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '-'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Total revenue in selected period</div>
                </div>

                {/* Agency profit: agency share deducted from drivers */}
                <div className="p-5 bg-gray-50 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-2">Agency Profit</div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {paySummary?.agency_profit != null
                      ? `€${Number(paySummary.agency_profit).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '-'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Total agency share deducted from drivers</div>
                </div>

                {/* Tax + insurance deductions */}
                <div className="p-5 bg-gray-50 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-2">Tax + Insurance Deductions</div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {paySummary?.total_tax_and_insurance != null
                      ? `€${Number(paySummary.total_tax_and_insurance).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '-'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Total tax and insurance withheld</div>
                </div>

                {/* Driver net earnings */}
                <div className="p-5 bg-gray-50 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-2">Driver Net Earnings</div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {paySummary?.total_net_earnings != null
                      ? `€${Number(paySummary.total_net_earnings).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '-'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Paid to drivers (after all deductions)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top drivers (trips) */}
          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <div className="text-sm mb-3 font-medium">{t('dashboard.topDriversTrips')}</div>
            {(() => {
              const list = (tripStats?.top_drivers || []) as any[];
              const maxFare = Math.max(1, ...list.map(d => Number(d?.fare || 0)));
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {list.map((d: any, idx: number) => {
                    const fareNum = Number(d.fare || 0);
                    const initials = `${(d.driver_first_name || '?')[0] || ''}${(d.driver_last_name || '?')[0] || ''}`.toUpperCase();
                    const rankColors = [
                      'from-amber-400 to-yellow-500',
                      'from-slate-300 to-slate-400',
                      'from-orange-300 to-orange-400',
                    ];
                    const badgeClass = idx < 3 ? rankColors[idx] : 'from-gray-200 to-gray-300';
                    const goToDriver = () => {
                      if (d.driver_id) {
                        navigate(`/drivers/${d.driver_id}`);
                      }
                    };
                    return (
                      <button
                        key={d.driver_uuid}
                        type="button"
                        onClick={goToDriver}
                        className="rounded-lg border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-transform bg-white text-left"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 text-sm font-semibold">
                                {initials}
                              </div>
                              <span className={`absolute -bottom-1 -right-1 text-[10px] text-white px-1.5 py-0.5 rounded-full bg-gradient-to-r ${badgeClass}`}>#{idx + 1}</span>
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium truncate text-blue-700 hover:underline">
                                {d.driver_first_name} {d.driver_last_name}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Total Fare</div>
                            <div className="text-lg font-bold tabular-nums text-gray-900">€{fareNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Total Trips</div>
                            <div className="text-lg font-bold tabular-nums text-gray-900">{Number(d.trips || 0).toLocaleString()} {t('dashboard.trips')}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Trends by upload period - Now using charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payTs && payTs.length > 0 && (
              <TimeseriesChart
                title={t('dashboard.paymentsByUploadPeriod')}
                data={payTs}
                valueField="total_net"
                color="#465FFF"
                type="area"
                height={300}
              />
            )}
            {tripTs && tripTs.length > 0 && (
              <TimeseriesChart
                title={t('dashboard.tripsByUploadPeriod')}
                data={tripTs}
                valueField="trips"
                color="#10B981"
                type="area"
                height={300}
              />
            )}
          </div>

          {/* Removed default RecentOrders widget */}
        </div>
      </div>
    </>
  );
}
