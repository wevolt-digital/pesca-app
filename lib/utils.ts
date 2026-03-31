import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Encurta nomes de localização do Nominatim para exibição
// Ex: "Parque Imperador, Campinas, Região Imediata de..." → "Parque Imperador, Campinas"
export function shortLocationName(fullName: string): string {
  const parts = fullName.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 2) return fullName;
  return parts.slice(0, 2).join(', ');
}
