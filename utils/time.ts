
export const isMarketOpen = (): boolean => {
  const now = new Date();
  const timeZone = 'America/New_York';
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'long',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekday = parts.find(p => p.type === 'weekday')?.value;
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  
  const isWeekend = weekday === 'Saturday' || weekday === 'Sunday';
  if (isWeekend) {
    return false;
  }
  
  const minutesIntoDay = hour * 60 + minute;
  const marketOpenMinutes = 9 * 60 + 30; // 9:30 AM
  const marketCloseMinutes = 16 * 60; // 4:00 PM
  
  return minutesIntoDay >= marketOpenMinutes && minutesIntoDay < marketCloseMinutes;
};

export const isWithinTradingDays = (date: Date, days: number): boolean => {
    const now = new Date();
    const targetDate = new Date(date);
    let tradingDays = 0;
    
    const tempDate = new Date(now);

    while (tempDate <= targetDate && tradingDays <= days) {
        const dayOfWeek = tempDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
            tradingDays++;
        }
        if (tradingDays > days) break;
        tempDate.setDate(tempDate.getDate() + 1);
    }
    
    const diffTime = targetDate.getTime() - now.getTime();
    if(diffTime < 0) return false; // Date is in the past
    
    return tradingDays <= days;
};
