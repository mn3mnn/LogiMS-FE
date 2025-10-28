import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUploadsStats, usePaymentSummary, useTripSummary, useTripStats, usePaymentStats, usePaymentTimeseries, useTripTimeseries } from "../../hooks/useStats";
import BarList from "../../components/charts/BarList";

export default function Home() {
  const { t } = useTranslation();
  
  // Only completed uploads for by-type widget
  const { data: uploadsStats } = useUploadsStats({ status: 'completed' });
  const { data: paySummary } = usePaymentSummary();
  const { data: tripSummary } = useTripSummary();
  const { data: tripStats } = useTripStats();
  const { data: payStats } = usePaymentStats();
  const { data: payTs } = usePaymentTimeseries({ period: 'upload' });
  const { data: tripTs } = useTripTimeseries({ period: 'upload' });
  const completedPayments = (uploadsStats?.by_type || []).find((t: any) => t.file_type === 'payments')?.count ?? 0;
  const completedTrips = (uploadsStats?.by_type || []).find((t: any) => t.file_type === 'trips')?.count ?? 0;
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">

          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border p-4">
              <div className="text-sm text-gray-500">{t('dashboard.paymentsNet')}</div>
              <div className="text-2xl font-semibold">
                {paySummary?.total_net_earnings != null ? Number(paySummary.total_net_earnings).toFixed(2) : '-'}
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-sm text-gray-500">{t('dashboard.paymentsRevenue')}</div>
              <div className="text-2xl font-semibold">
                {paySummary?.total_revenue != null ? Number(paySummary.total_revenue).toFixed(2) : '-'}
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-sm text-gray-500">{t('dashboard.tripsTotalFare')}</div>
              <div className="text-2xl font-semibold">
                {tripSummary?.total_fare_amount != null ? Number(tripSummary.total_fare_amount).toFixed(2) : '-'}
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-sm text-gray-500">{t('dashboard.tripsTotal')}</div>
              <div className="text-2xl font-semibold">{tripSummary?.total_trips ?? '-'}</div>
            </div>
          </div>

          

          {/* Completed uploads by type and trip status distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BarList
              title={t('dashboard.completedUploadsByType')}
              items={(uploadsStats?.by_type || []).map((t: any) => ({ key: t.file_type ?? 'unknown', labelLeft: t.file_type ?? 'unknown', value: t.count }))}
              colorClass="bg-emerald-500"
            />
            <BarList
              title={t('dashboard.tripsByStatus')}
              items={(tripStats?.by_status || []).map((s: any) => ({ key: s.trip_status ?? 'unknown', labelLeft: s.trip_status ?? 'unknown', value: s.count }))}
              colorClass="bg-purple-500"
            />
          </div>

          {/* Top drivers (trips) */}
          <div className="rounded-xl border p-4">
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
                    return (
                      <div key={d.driver_uuid} className="rounded-lg border p-3 shadow-sm hover:shadow transition bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 text-sm font-semibold">
                                {initials}
                              </div>
                              <span className={`absolute -bottom-1 -right-1 text-[10px] text-white px-1.5 py-0.5 rounded-full bg-gradient-to-r ${badgeClass}`}>#{idx + 1}</span>
                            </div>
                            <div className="min-w-0">
                              {d.driver_id ? (
                                <Link to={`/drivers/${d.driver_id}`} className="font-medium truncate text-blue-600 hover:underline">
                                  {d.driver_first_name} {d.driver_last_name}
                                </Link>
                              ) : (
                                <span className="font-medium truncate">{d.driver_first_name} {d.driver_last_name}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold tabular-nums">€ {fareNum.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{d.trips} {t('dashboard.trips')}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Trends by upload period (reverted to lists) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4">
              <div className="text-sm mb-2 font-medium">{t('dashboard.paymentsByUploadPeriod')}</div>
              <ul className="text-sm max-h-60 overflow-auto space-y-1">
                {(payTs || []).map((u: any) => (
                  <li key={`p-${u.upload_id}`} className="grid grid-cols-5 items-center gap-2">
                    <span className="col-span-2 truncate">{u.company}</span>
                    <span className="text-xs text-gray-500 col-span-2 text-right">{new Date(u.from_date).toLocaleDateString()} → {new Date(u.to_date).toLocaleDateString()}</span>
                    <span className="text-right font-medium tabular-nums">{u.total_net != null ? Number(u.total_net).toFixed(2) : '-'}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-sm mb-2 font-medium">{t('dashboard.tripsByUploadPeriod')}</div>
              <ul className="text-sm max-h-60 overflow-auto space-y-1">
                {(tripTs || []).map((u: any) => (
                  <li key={`t-${u.upload_id}`} className="grid grid-cols-5 items-center gap-2">
                    <span className="col-span-2 truncate">{u.company}</span>
                    <span className="text-xs text-gray-500 col-span-2 text-right">{new Date(u.from_date).toLocaleDateString()} → {new Date(u.to_date).toLocaleDateString()}</span>
                    <span className="text-right font-medium tabular-nums">{u.trips}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Removed default RecentOrders widget */}
        </div>
      </div>
    </>
  );
}
