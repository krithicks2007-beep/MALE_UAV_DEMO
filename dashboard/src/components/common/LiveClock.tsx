import { useEffect, useState } from 'react';

export function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toUTCString().split(' ')[4] + ' UTC');
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-right hidden sm:block">
      <div className="font-mono text-xs font-semibold text-charcoal">{time}</div>
      <div className="font-mono text-[10px] text-sage-600">SYNC: 2 Hz</div>
    </div>
  );
}
