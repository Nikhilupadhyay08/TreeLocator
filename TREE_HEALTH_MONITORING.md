# 🌳 Tree Health Monitoring Feature

A real-time tree health monitoring system that tracks IoT sensor data and alerts when trees reach critical health conditions.

## Overview

The Tree Health Monitoring feature automatically:
- ✅ Monitors tree IoT sensor data (temperature, soil moisture, humidity)
- ✅ Detects critical health conditions in real-time
- ✅ Displays toast notifications when alerts occur
- ✅ Highlights critical trees with red card styling
- ✅ Provides a reusable utility function for health status checks

## Critical Health Thresholds

A tree is considered in **CRITICAL** condition when:

| Condition | Threshold | Alert |
|-----------|-----------|-------|
| **Temperature** | > 40°C | "Temperature too high" |
| **Soil Moisture** | < 20% | "Soil moisture critically low" |

A tree shows **WARNING** state when:
- Temperature: 35-40°C, OR
- Soil Moisture: 20-30%

## Architecture

### Files Added

```
frontend/src/
├── lib/
│   ├── tree-health.ts                 # Core utility functions
│   └── tree-health-examples.ts        # Usage examples & testing guide
├── hooks/
│   └── use-tree-iot.ts                # Custom hooks for IoT data
├── components/
│   └── tree-health-monitor.tsx        # React component for display
└── pages/
    └── dashboard.tsx                  # Updated with health monitoring
```

### Core Functions

#### `isCriticalHealth(healthData: TreeHealthData): HealthStatus`

Determines if tree health is critical.

**Parameters:**
- `healthData.temperature` - Temperature in Celsius
- `healthData.soilMoisture` - Soil moisture percentage (0-100)
- `healthData.humidity` - Humidity percentage (0-100)
- `healthData.recordedAt` - ISO timestamp of reading

**Returns:**
```typescript
{
  isCritical: boolean;
  alerts: string[];           // List of triggered alerts
  severity: 'normal' | 'warning' | 'critical';
}
```

**Example:**
```typescript
import { isCriticalHealth } from '@/lib/tree-health';

const health = isCriticalHealth({
  temperature: 42,
  soilMoisture: 15,
  humidity: 60,
  recordedAt: '2026-04-07T10:30:00Z'
});

if (health.isCritical) {
  console.log('Critical alerts:', health.alerts);
}
```

### Custom Hooks

#### `useTreeIotData(treeCode: string | null, pollInterval?: number)`

Fetch and poll IoT sensor data for a single tree.

```typescript
import { useTreeIotData } from '@/hooks/use-tree-iot';

const { data, loading, error } = useTreeIotData('CG-RPR-2026-000001', 5000);

if (data && data.length > 0) {
  const latestReading = data[0];
  console.log(`Temperature: ${latestReading.temperature}°C`);
}
```

#### `useMultipleTreeIotData(treeCodes: string[], pollInterval?: number)`

Fetch and poll IoT sensor data for multiple trees.

```typescript
import { useMultipleTreeIotData } from '@/hooks/use-tree-iot';

const { data: iotDataMap } = useMultipleTreeIotData(
  ['CG-RPR-2026-000001', 'CG-RPR-2026-000002'],
  5000
);

// Access data: iotDataMap['CG-RPR-2026-000001'] returns IotSensor[]
```

#### `submitIotReading(treeCode: string, data: object): Promise<IotSensor>`

Submit new sensor readings from IoT devices.

```typescript
import { submitIotReading } from '@/hooks/use-tree-iot';

await submitIotReading('CG-RPR-2026-000001', {
  temperature: 42,
  soilMoisture: 15,
  humidity: 60
});
```

### React Components

#### `TreeHealthMonitor`

Displays real-time tree health with toast alerts.

**Props:**
```typescript
interface TreeHealthMonitorProps {
  trees?: TreeHealth[];                    // Trees to monitor
  onCriticalAlert?: (treeCode: string, alerts: string[]) => void;
  pollInterval?: number;                   // Default: 10000ms
}
```

**Example:**
```typescript
import { TreeHealthMonitor } from '@/components/tree-health-monitor';

function MyDashboard() {
  const trees = [
    {
      treeCode: 'CG-RPR-2026-000001',
      healthData: {
        temperature: 42,
        soilMoisture: 15,
        humidity: 60,
        recordedAt: new Date().toISOString(),
      },
      treeName: 'Sal Tree'
    }
  ];

  return (
    <TreeHealthMonitor 
      trees={trees}
      onCriticalAlert={(code, alerts) => {
        console.log(`${code}: ${alerts.join(', ')}`);
      }}
      pollInterval={5000}
    />
  );
}
```

## Integration Examples

### 1. In Dashboard

The dashboard automatically monitors the first 5 recent trees:

```tsx
// Already integrated in frontend/src/pages/dashboard.tsx
export default function Dashboard() {
  const { data: treesData } = useListTrees({});
  const recentTreeCodes = (treesData?.trees ?? []).slice(0, 5).map(t => t.treeCode);
  const { data: iotDataMap } = useMultipleTreeIotData(recentTreeCodes, 5000);
  
  // ... process data and display TreeHealthMonitor
}
```

### 2. In Tree Detail Page

```typescript
import { useTreeIotData } from '@/hooks/use-tree-iot';
import { isCriticalHealth } from '@/lib/tree-health';
import { TreeHealthMonitor } from '@/components/tree-health-monitor';

export function TreeDetailPage({ treeCode }: { treeCode: string }) {
  const { data: readings } = useTreeIotData(treeCode);
  
  const tree = readings?.[0] ? {
    treeCode,
    healthData: {
      temperature: readings[0].temperature,
      soilMoisture: readings[0].soilMoisture,
      humidity: readings[0].humidity,
      recordedAt: readings[0].recordedAt,
    },
  } : null;

  return tree ? <TreeHealthMonitor trees={[tree]} /> : null;
}
```

### 3. With Custom Toast Handling

```typescript
import { useToast } from '@/hooks/use-toast';
import { TreeHealthMonitor } from '@/components/tree-health-monitor';

function MonitoringPage() {
  const { toast } = useToast();

  const handleCritical = (treeCode: string, alerts: string[]) => {
    // Custom logic - send to backend, log to analytics, etc.
    fetch('/api/critical-alerts', {
      method: 'POST',
      body: JSON.stringify({ treeCode, alerts, timestamp: new Date() }),
    });
  };

  return (
    <TreeHealthMonitor 
      trees={monitoredTrees}
      onCriticalAlert={handleCritical}
      pollInterval={5000}
    />
  );
}
```

## API Endpoints

### Get IoT Sensor Data

```bash
GET /api/iot/:treeCode
```

Returns array of IoT readings (most recent first, limit 50).

**Response:**
```json
[
  {
    "id": 1,
    "treeCode": "CG-RPR-2026-000001",
    "temperature": 42,
    "soilMoisture": 15,
    "humidity": 60,
    "alertGenerated": "HIGH_HEAT",
    "recordedAt": "2026-04-07T10:30:00Z"
  }
]
```

### Submit IoT Reading

```bash
POST /api/iot/:treeCode
Content-Type: application/json

{
  "temperature": 42,
  "soilMoisture": 15,
  "humidity": 60
}
```

**Response:**
```json
{
  "id": 2,
  "treeCode": "CG-RPR-2026-000001",
  "temperature": 42,
  "soilMoisture": 15,
  "humidity": 60,
  "alertGenerated": "HIGH_HEAT",
  "recordedAt": "2026-04-07T10:30:01Z"
}
```

## Testing

### Manual Testing Steps

1. **Start the application:**
   ```bash
   pnpm dev
   ```

2. **Open Dashboard:**
   Navigate to http://localhost:5173/dashboard

3. **Submit test IoT data:**
   ```bash
   curl -X POST http://localhost:5000/api/iot/CG-RPR-2026-000001 \
     -H "Content-Type: application/json" \
     -d '{"temperature": 42, "soilMoisture": 15, "humidity": 60}'
   ```

4. **Verify:**
   - ✅ Toast notification appears showing critical alert
   - ✅ Tree health card appears with red border
   - ✅ "Temperature too high" and "Soil moisture critically low" alerts shown
   - ✅ Severity badge shows "CRITICAL"

### Test Scenarios

```bash
# Critical - High Temperature
curl -X POST http://localhost:5000/api/iot/TREE-001 \
  -H "Content-Type: application/json" \
  -d '{"temperature": 41, "soilMoisture": 35, "humidity": 50}'

# Critical - Low Moisture
curl -X POST http://localhost:5000/api/iot/TREE-002 \
  -H "Content-Type: application/json" \
  -d '{"temperature": 30, "soilMoisture": 18, "humidity": 70}'

# Critical - Both Conditions
curl -X POST http://localhost:5000/api/iot/TREE-003 \
  -H "Content-Type: application/json" \
  -d '{"temperature": 42, "soilMoisture": 15, "humidity": 40}'

# Warning - Temperature
curl -X POST http://localhost:5000/api/iot/TREE-004 \
  -H "Content-Type: application/json" \
  -d '{"temperature": 37, "soilMoisture": 35, "humidity": 55}'

# Normal - All Good
curl -X POST http://localhost:5000/api/iot/TREE-005 \
  -H "Content-Type: application/json" \
  -d '{"temperature": 28, "soilMoisture": 50, "humidity": 65}'
```

## UI Styling

### Health Card States

**Normal State:**
- White background with border
- Green "NORMAL" badge

**Warning State:**
- Yellow background (yellow-50)
- Yellow border
- Yellow "WARNING" badge

**Critical State:**
- Red background (red-50)
- Red border (2px)
- Red "CRITICAL" badge
- Alert icon displays

### Component Features

- **Responsive:** Works on mobile, tablet, and desktop
- **Icons:** Visual indicators for temperature, moisture, humidity
- **Real-time:** Updates automatically based on poll interval
- **Accessible:** Proper ARIA labels and semantic HTML

## Performance Considerations

- **Default poll interval:** 5 seconds
- **Trees monitored:** First 5 recent trees (configurable)
- **Debouncing:** Toast notifications only show on state change
- **Cleanup:** Intervals properly cleared on component unmount

## Extending the Feature

### Add Email Notifications

```typescript
const handleCritical = async (treeCode: string, alerts: string[]) => {
  await fetch('/api/send-alert-email', {
    method: 'POST',
    body: JSON.stringify({ treeCode, alerts })
  });
};
```

### Add SMS Alerts

```typescript
const handleCritical = async (treeCode: string, alerts: string[]) => {
  await fetch('/api/send-sms-alert', {
    method: 'POST',
    body: JSON.stringify({ treeCode, alerts })
  });
};
```

### Add Logging to Backend

```typescript
const handleCritical = async (treeCode: string, alerts: string[]) => {
  await fetch('/api/log-critical-alert', {
    method: 'POST',
    body: JSON.stringify({
      treeCode,
      alerts,
      timestamp: new Date(),
      severity: 'critical'
    })
  });
};
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No notifications appearing | Check if backend is running on :5000 |
| IoT data not loading | Verify tree code exists in database |
| Toast messages not showing | Ensure Toaster component is in App.tsx |
| Cards not highlighting | Clear browser cache and reload |

## Files Reference

| File | Purpose |
|------|---------|
| `lib/tree-health.ts` | Core utility functions for health detection |
| `lib/tree-health-examples.ts` | Examples and testing guide |
| `hooks/use-tree-iot.ts` | React hooks for IoT data fetching |
| `components/tree-health-monitor.tsx` | Display component with alerts |
| `pages/dashboard.tsx` | Integrated into main dashboard |

## Future Enhancements

- [ ] Socket.io integration for real-time updates
- [ ] Database logging of critical events
- [ ] Email/SMS notifications
- [ ] Alert history and analytics
- [ ] Configurable thresholds per tree species
- [ ] Predictive alerts based on trends
- [ ] Integration with external monitoring services
