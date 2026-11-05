import type { Equipment } from './types';

export const MAX_THRESHOLD = 150;

// Regla única de alarma: el equipo está en alarma solo si está activado
// y su temperatura alcanza o supera el límite.
export function isInAlarm(item: Pick<Equipment, 'enabled' | 'temperature' | 'maxTemp'>): boolean {
  return item.enabled === 1 && item.temperature >= item.maxTemp;
}

// Convierte el texto ingresado en un límite válido (> 0 y <= 150).
// Devuelve null si el dato no es válido.
export function parseThreshold(text: string): number | null {
  const clean = text.trim().replace(',', '.');
  if (clean === '') return null;
  const value = Number(clean);
  if (!Number.isFinite(value)) return null;
  if (value <= 0 || value > MAX_THRESHOLD) return null;
  return value;
}
