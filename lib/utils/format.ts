import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Formate une date selon le format français
 */
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: fr })
}

/**
 * Formate un nombre en devise (EUR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Formate un nombre avec des séparateurs
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formate un pourcentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Tronque un texte avec ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Capitalise la première lettre
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Génère un SKU aléatoire
 */
export function generateSKU(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SKU-${timestamp}-${random}`
}

/**
 * Génère un code unique pour warehouse ou supplier
 */
export function generateCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  return `${prefix}-${timestamp}`
}
