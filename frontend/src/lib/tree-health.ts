/**
 * Tree Health Monitoring Utilities
 * Detects and alerts for critical tree health conditions
 */

export interface TreeHealthData {
  temperature: number;
  soilMoisture: number;
  humidity: number;
  recordedAt: string;
}

export interface HealthStatus {
  isCritical: boolean;
  alerts: string[];
  severity: 'normal' | 'warning' | 'critical';
}

/**
 * Determines if tree health is critical
 * Critical conditions:
 * - Temperature > 40°C (HIGH_HEAT)
 * - Soil Moisture < 20% (NEEDS_WATER)
 */
export function isCriticalHealth(healthData: TreeHealthData): HealthStatus {
  const alerts: string[] = [];
  let isCritical = false;

  // Check temperature threshold (> 40°C)
  if (healthData.temperature > 40) {
    alerts.push('Temperature too high');
    isCritical = true;
  }

  // Check soil moisture threshold (< 20%)
  if (healthData.soilMoisture < 20) {
    alerts.push('Soil moisture critically low');
    isCritical = true;
  }

  // Optional: warning level checks
  let severity: 'normal' | 'warning' | 'critical' = 'normal';
  if (isCritical) {
    severity = 'critical';
  } else if (healthData.temperature > 35 || healthData.soilMoisture < 30) {
    severity = 'warning';
  }

  return {
    isCritical,
    alerts,
    severity,
  };
}

/**
 * Formats alerts into a readable message
 */
export function formatAlertMessage(treeCode: string, alerts: string[]): string {
  if (alerts.length === 0) return '';
  return `${treeCode}: ${alerts.join(', ')}`;
}

/**
 * Gets CSS class for health severity
 */
export function getHealthSeverityClass(severity: 'normal' | 'warning' | 'critical'): string {
  switch (severity) {
    case 'critical':
      return 'border-red-500 bg-red-50 shadow-red-200';
    case 'warning':
      return 'border-yellow-400 bg-yellow-50 shadow-yellow-100';
    default:
      return 'border-border bg-white';
  }
}

/**
 * Gets text color for health badge
 */
export function getHealthBadgeClass(severity: 'normal' | 'warning' | 'critical'): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-green-100 text-green-800 border-green-200';
  }
}
