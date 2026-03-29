import { PingParams } from 'src/dto/ping.dto';
import { PingEntity } from 'src/entities/ping.entity';

export const generateShortCode = (url: string) => {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash * 31 + url.charCodeAt(i)) & 0xffffffff;
  }
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  let n = Math.abs(hash);
  for (let i = 0; i < 5; i++) {
    code += chars[n % 62];
    n = Math.floor(n / 62);
  }
  return code;
};

export const calculateDailyUptime = (
  pings: Pick<PingEntity, 'isUp' | 'createdAt'>[],
) => {
  const days: Record<string, { up: number; total: number }> = {};

  pings.forEach((ping) => {
    const date = new Date(ping.createdAt).toISOString().split('T')[0];
    if (!days[date]) days[date] = { up: 0, total: 0 };
    days[date].total++;
    if (ping.isUp) days[date].up++;
  });

  const result: { date: string; uptime: string | null }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    result.push({
      date,
      uptime: days[date]
        ? `${((days[date].up / days[date].total) * 100).toFixed(3)}%`
        : null,
    });
  }

  return result;
};

export const calculateAverageUptime = (pings: Pick<PingEntity, 'isUp'>[]) => {
  if (!pings || pings.length === 0) return '100.000%';
  const upCount = pings.filter((p) => p.isUp).length;
  return `${((upCount / pings.length) * 100).toFixed(3)}%`;
};

export const getPeriodStartDate = (period: PingParams['period']): Date => {
  let startDate: Date | null;
  switch (period) {
    case '24 hours':
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      break;
    case '7 days':
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '28 days':
      startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      break;
    case '365 days':
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      break;
    case '4 hours':
    default:
      startDate = new Date(Date.now() - 4 * 60 * 60 * 1000);
      break;
  }
  return startDate;
};

export const filterByHours = (
  items: PingEntity[],
  hours: number,
  endDate: Date,
) => {
  const cutoff = endDate.getTime() - hours * 60 * 60 * 1000;
  return items.filter((item) => new Date(item.createdAt).getTime() >= cutoff);
};

export const filterByDays = (
  items: PingEntity[],
  days: number,
  endDate: Date,
) => {
  const cutoff = endDate.getTime() - days * 24 * 60 * 60 * 1000;
  return items.filter((item) => new Date(item.createdAt).getTime() >= cutoff);
};
