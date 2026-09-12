import { useState } from 'react';
import { useConnectionStore } from '../../stores/connectionStore';
import { useAlertStore } from '../../stores/alertStore';
import { LiveClock } from '../common/LiveClock';

const CONNECTION_COLORS: Record<string, string> = {
  CONNECTED:       'bg-emerald-500',
  CONNECTING:      'bg-amber-400 animate-pulse',
  DELAYED:         'bg-amber-400',
  DATA_STALE:      'bg-orange-500',
  DISCONNECTED:    'bg-red-500',
  INVALID_DATA:    'bg-red-600',
  TWIN_UNAVAILABLE:'bg-orange-500',
  AI_UNAVAILABLE:  'bg-orange-400',
};

export function Header() {
  const [showAlerts, setShowAlerts] = useState(false);
  const { state, dataSource } = useConnectionStore();
  const alerts = useAlertStore((s) => s.alerts);
  const activeCount = useAlertStore((s) => s.activeCount());
  const isLive = state === 'CONNECTED';

  return (
    <header className="w-full sticky top-0 z-50 bg-[#ebeeed]/90 backdrop-blur-md border-b border-[#d8e0da]">
      <div className="max-w-[1560px] mx-auto px-6 lg:px-10 py-3.5 flex items-center justify-between relative">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-[#d3ded6] text-sage-700">
            <span className="material-symbols-outlined text-[20px]">flight</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-charcoal">MALE UAV</h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-sage-200/70 text-sage-800 font-semibold tracking-wider">
                Digital Twin
              </span>
            </div>
            <p className="text-[11px] text-sage-600 font-medium">
              Aero-Piston Engine Dashboard • SIH 2026
            </p>
          </div>
        </div>

        {/* System Status Pills */}
        <div className="hidden md:flex items-center gap-2 p-1.5 rounded-full bg-white/70 border border-[#d6e0d8] shadow-sm text-xs font-mono">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#e1e9e3]">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-orange-400'}`} />
            <span className="text-sage-600 font-medium">ECU / FADEC:</span>
            <span className="text-charcoal font-semibold">{isLive ? 'Online' : 'Connecting'}</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#e1e9e3]">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-sage-600 font-medium">CAN Bus:</span>
            <span className="text-charcoal font-semibold">{isLive ? 'Connected' : '--'}</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#e1e9e3]">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-sage-600 font-medium">Sensors:</span>
            <span className="text-charcoal font-semibold">{isLive ? 'Normal' : '--'}</span>
          </div>
          <div className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-white shadow-sm ${isLive ? 'bg-sage-500' : 'bg-gray-400'}`}>
            <span className={`w-2 h-2 rounded-full bg-white ${isLive ? 'animate-ping' : ''}`} />
            <span className="font-medium">Source:</span>
            <span className="font-bold">{dataSource}</span>
          </div>
        </div>

        {/* Right: Generator Link + alerts + clock + actions */}
        <div className="flex items-center gap-4">
          <a
            href={`${import.meta.env.VITE_BACKEND_API_URL || 'https://maleuav.onrender.com'}/control`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-medium shadow-sm transition"
            title="Open Data Generator UI to adjust telemetry sliders and inject scenarios"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Data Generator UI</span>
          </a>

          <LiveClock />
          <div className="flex items-center gap-1.5 relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className={`relative w-9 h-9 rounded-full border border-[#d3ded6] flex items-center justify-center transition-colors shadow-sm ${
                activeCount > 0 ? 'bg-red-50 text-red-600 border-red-300 animate-bounce' : 'bg-white text-charcoal hover:bg-sage-50'
              }`}
              title="View Active Alerts"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              {activeCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-9 h-9 rounded-full border border-[#d3ded6] bg-white flex items-center justify-center text-charcoal hover:bg-sage-50 transition-colors shadow-sm"
              title="Refresh Dashboard"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          </div>
        </div>

        {/* Alert Popover Dropdown */}
        {showAlerts && (
          <div className="absolute right-6 top-16 w-96 max-w-[90vw] p-4 rounded-3xl bg-white border border-[#d8e0da] shadow-2xl z-50 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-lg">warning</span>
                <span className="text-xs font-bold font-mono uppercase text-charcoal">TAPAS DRDO Alerts ({activeCount})</span>
              </div>
              <button
                onClick={() => setShowAlerts(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-gray-500">
                No active safety or envelope alerts.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-2xl border text-xs ${
                      a.severity === 'CRITICAL'
                        ? 'bg-red-50/80 border-red-200 text-red-950'
                        : a.severity === 'HIGH'
                        ? 'bg-orange-50/80 border-orange-200 text-orange-950'
                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold font-mono uppercase text-[10px] px-2 py-0.5 rounded-full bg-white/80 border">
                        {a.severity}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {a.timestamp ? a.timestamp.split('T')[1]?.split('.')[0] : ''} UTC
                      </span>
                    </div>
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-[11px] text-gray-700 mt-0.5">{a.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
