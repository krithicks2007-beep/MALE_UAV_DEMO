import { useTelemetryStore } from '../../stores/telemetryStore';
import { SectionCard, CardHeader } from '../common/SectionCard';
import { TelemetryMiniCell } from './TelemetryMiniCell';

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
        <div className="grid grid-cols-2 gap-2.5">
          <TelemetryMiniCell label="Engine RPM" value={telemetry.rpm} unit="RPM" decimals={0} warn={telemetry.rpm > 5500} crit={telemetry.rpm > 5800} />
          <TelemetryMiniCell label="MAP Pressure" value={telemetry.map * 100} unit="kPa" decimals={1} warn={telemetry.map > 1.35} crit={telemetry.map > 1.45} />
          <TelemetryMiniCell label="CHT (avg)"  value={chtAvg} unit="°C" decimals={1} warn={chtAvg > 200} crit={chtAvg > 215} />
          <TelemetryMiniCell label="EGT (avg)"  value={egtAvg} unit="°C" decimals={1} warn={egtAvg > 750} crit={egtAvg > 780} />
          <TelemetryMiniCell label="Oil Pressure" value={telemetry.oil_pressure} unit="bar" decimals={2} warn={telemetry.oil_pressure < 3.2} crit={telemetry.oil_pressure < 2.5 || telemetry.oil_pressure > 6.0} />
          <TelemetryMiniCell label="Oil Temp"   value={telemetry.oil_temperature} unit="°C" decimals={1} warn={telemetry.oil_temperature > 115} crit={telemetry.oil_temperature > 125} />
          <TelemetryMiniCell label="Fuel Flow"  value={telemetry.fuel_flow} unit="L/h" decimals={1} warn={telemetry.fuel_flow > 28.0} crit={telemetry.fuel_flow > 32.0} />
          <TelemetryMiniCell label="Vibration"  value={telemetry.vibration} unit="mm/s" decimals={2} warn={telemetry.vibration > 5.0} crit={telemetry.vibration > 7.5} />
        </div>
      </div>
    </SectionCard>
  );
}
