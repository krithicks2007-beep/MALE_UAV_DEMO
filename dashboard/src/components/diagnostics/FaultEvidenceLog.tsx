import React from 'react';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { Terminal, ShieldAlert, Copy, Check } from 'lucide-react';

export function FaultEvidenceLog() {
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);
  const [copied, setCopied] = React.useState(false);

  const evidenceList = diagnostics?.evidence || [];
  const timestamp = diagnostics?.last_updated
    ? new Date(diagnostics.last_updated).toISOString().replace('T', ' ').substring(0, 19)
    : new Date().toISOString().replace('T', ' ').substring(0, 19);

  const handleCopy = () => {
    if (evidenceList.length > 0) {
      navigator.clipboard.writeText(evidenceList.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#1f2421] text-sage-100 p-5 rounded-3xl border border-charcoal-light shadow-md flex flex-col justify-between space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-sage-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Diagnostic Evidence &amp; Anomaly Telemetry Proof
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-sage-400">LAST SYNC: {timestamp} UTC</span>
          <button
            onClick={handleCopy}
            disabled={evidenceList.length === 0}
            className="p-1.5 rounded-lg bg-sage-800/80 hover:bg-sage-700 text-sage-300 transition-colors disabled:opacity-40"
            title="Copy Evidence Log"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Log Output Window */}
      <div className="bg-black/40 p-4 rounded-2xl border border-sage-900/60 min-h-[140px] max-h-[220px] overflow-y-auto space-y-2 text-xs">
        {evidenceList.length > 0 ? (
          evidenceList.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sage-200 leading-relaxed">
              <span className="text-emerald-400 select-none">&gt;</span>
              <span className="font-mono">{line}</span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-24 text-sage-500 space-y-1">
            <ShieldAlert className="w-5 h-5 text-sage-600" />
            <span className="text-xs">NO FAULT EVIDENCE FILED — SYSTEM OPERATING IN NOMINAL ENVELOPE</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-sage-500 pt-1">
        <span>AI MODEL ENGINE VERIFICATION LOG</span>
        <span>SECURITY LEVEL: CLASSIFIED AEROSPACE HUD</span>
      </div>
    </div>
  );
}
