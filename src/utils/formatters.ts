export function formatFCFA(amount: number | null | undefined): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? Math.round(amount) : 0;
  return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
}

export function formatDateFr(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return d.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function getTodayAbidjan(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTimeAbidjan(): string {
  return new Date().toLocaleTimeString('fr-FR', {
    timeZone: 'Africa/Abidjan',
    hour: '2-digit',
    minute: '2-digit',
  });
}
