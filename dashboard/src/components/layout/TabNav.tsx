const TABS = [
  { id: 'dashboard',    label: 'Main Dashboard',       icon: 'dashboard' },
  { id: 'telemetry',   label: 'Live Telemetry',        icon: 'sensors' },
  { id: 'trends',      label: 'Telemetry Trends',      icon: 'show_chart' },
  { id: 'scenario',    label: 'Scenario Control',      icon: 'science' },
  { id: 'twin-analysis', label: 'Twin Analysis',       icon: 'account_tree' },
  { id: 'diagnostics', label: 'AI / Diagnostics',      icon: 'psychology' },
  { id: 'maintenance', label: 'Maintenance Advisory',  icon: 'build' },
  { id: 'replay',      label: 'Mission Replay',        icon: 'replay' },
  { id: 'twin-view',   label: 'Twin View',             icon: 'view_in_ar' },
] as const;

export type TabId = (typeof TABS)[number]['id'];

interface TabNavProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="max-w-[1560px] mx-auto px-6 lg:px-10 py-2 flex items-center gap-1 overflow-x-auto border-b border-[#dbe3dc] bg-[#ebeeed]/60 backdrop-blur-sm">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-charcoal text-white shadow-sm'
                : 'text-sage-700 hover:bg-white/70 hover:text-charcoal'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
