import { useTelemetryStore } from '../../stores/telemetryStore';
import { SectionCard, CardHeader } from '../common/SectionCard';
import { TelemetryMiniCell } from './TelemetryMiniCell';
import { PillButton } from '../common/PillButton';

export function OperationalTelemetryCard() {
  const telemetry = useTelemetryStore((s) => s.telemetry);

  if (!telemetry) {
    return <SectionCard className="animate-pulse flex-1 min-h-[200px]" />;
  }

  const chtAvg = telemetry.cht.reduce((a, b) => a + b, 0) / telemetry.cht.length;
  const egtAvg = telemetry.egt.reduce((a, b) => a + b, 0) / telemetry.egt.length;

  return (
    <SectionCard className="flex-1 flex flex-col justify-between">
      <div>
        <CardHeader
          title="Operational Telemetry"
          right={<span className="w-2 h-2 rounded-full bg-sage-600 animate-pulse" />}
        />
        <div className="grid grid-cols-2 gap-3">
          <TelemetryMiniCell label="Engine RPM" value={telemetry.rpm} unit="RPM" decimals={0} warn={telemetry.rpm > 5500} crit={telemetry.rpm > 5800} />
          <TelemetryMiniCell label="CHT (avg)"  value={chtAvg} unit="°C" decimals={1} warn={chtAvg > 200} crit={chtAvg > 215} />
          <TelemetryMiniCell label="EGT (avg)"  value={egtAvg} unit="°C" decimals={1} warn={egtAvg > 750} crit={egtAvg > 780} />
          <TelemetryMiniCell label="Oil Pressure" value={telemetry.oil_pressure} unit="bar" decimals={2} warn={telemetry.oil_pressure < 3.2} crit={telemetry.oil_pressure < 2.5 || telemetry.oil_pressure > 6.0} />
          <TelemetryMiniCell label="Oil Temp"   value={telemetry.oil_temperature} unit="°C" decimals={1} warn={telemetry.oil_temperature > 115} crit={telemetry.oil_temperature > 125} />
          <TelemetryMiniCell label="Vibration"  value={telemetry.vibration} unit="mm/s" decimals={2} warn={telemetry.vibration > 5.0} crit={telemetry.vibration > 7.5} />
        </div>
      </div>
      <PillButton
        variant="dark"
        className="mt-5"
        right={<span className="w-3 h-3 rounded-sm bg-white inline-block" />}
      >
        Emergency Engine Stop
      </PillButton>
    </SectionCard>
  );
}
