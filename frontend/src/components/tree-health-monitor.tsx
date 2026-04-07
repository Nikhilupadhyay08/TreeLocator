import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Droplet, Thermometer, Wind } from 'lucide-react';
import {
  isCriticalHealth,
  formatAlertMessage,
  getHealthSeverityClass,
  getHealthBadgeClass,
  type TreeHealthData,
} from '@/lib/tree-health';

interface TreeHealth {
  treeCode: string;
  healthData: TreeHealthData;
  treeName?: string;
}

interface TreeHealthMonitorProps {
  trees?: TreeHealth[];
  onCriticalAlert?: (treeCode: string, alerts: string[]) => void;
  pollInterval?: number; // ms, default 10000
}

/**
 * Real-time Tree Health Monitoring Component
 * Displays tree health status and shows toast alerts for critical conditions
 */
export function TreeHealthMonitor({
  trees = [],
  onCriticalAlert,
  pollInterval = 10000,
}: TreeHealthMonitorProps) {
  const { toast } = useToast();
  const [monitoredTrees, setMonitoredTrees] = useState<TreeHealth[]>(trees);
  const previousCriticalStates = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkHealth = async () => {
      const newCriticalTrees = new Set<string>();

      for (const tree of monitoredTrees) {
        const health = isCriticalHealth(tree.healthData);

        if (health.isCritical) {
          newCriticalTrees.add(tree.treeCode);

          // Show toast only if this tree just became critical
          if (!previousCriticalStates.current.has(tree.treeCode)) {
            const alertMessage = formatAlertMessage(tree.treeCode, health.alerts);
            toast({
              title: '🚨 Critical Tree Health Alert',
              description: alertMessage,
              variant: 'destructive',
            });

            onCriticalAlert?.(tree.treeCode, health.alerts);
          }
        }
      }

      previousCriticalStates.current = newCriticalTrees;
    };

    const interval = setInterval(checkHealth, pollInterval);
    checkHealth(); // Initial check

    return () => clearInterval(interval);
  }, [monitoredTrees, toast, pollInterval, onCriticalAlert]);

  useEffect(() => {
    setMonitoredTrees(trees);
  }, [trees]);

  if (monitoredTrees.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {monitoredTrees.map((tree) => {
        const health = isCriticalHealth(tree.healthData);
        const borderClass = getHealthSeverityClass(health.severity);
        const badgeClass = getHealthBadgeClass(health.severity);

        return (
          <div
            key={tree.treeCode}
            className={`border-2 rounded-lg p-4 transition-all shadow-sm ${borderClass}`}
          >
            <div className="flex gap-3 items-start">
              {health.isCritical && (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <div className="flex gap-2 items-center mb-2">
                  <span className="font-semibold text-sm text-foreground">
                    {tree.treeName || tree.treeCode}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${badgeClass}`}
                  >
                    {health.severity.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Temperature</div>
                      <div className="font-semibold">
                        {tree.healthData.temperature.toFixed(1)}°C
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Moisture</div>
                      <div className="font-semibold">
                        {tree.healthData.soilMoisture.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-cyan-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Humidity</div>
                      <div className="font-semibold">
                        {tree.healthData.humidity.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {health.alerts.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <strong>⚠️ Alerts:</strong>
                    <ul className="mt-1 space-y-0.5">
                      {health.alerts.map((alert, i) => (
                        <li key={i}>• {alert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-2 text-xs text-muted-foreground">
                  Last update: {new Date(tree.healthData.recordedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
