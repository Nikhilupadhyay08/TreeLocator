# 🌳 Tree Health Monitoring - Quick Reference

## What Was Built

A complete real-time tree health monitoring system that:
- Detects critical tree health conditions (high temperature or low soil moisture)
- Shows toast notifications when issues are detected
- Highlights critical trees with red card styling
- Provides reusable functions and components

## Where It Works

### On the Dashboard (`http://localhost:5173/dashboard`)
At the top of the dashboard, you'll see a new **"Real-Time Tree Health Monitoring"** section that:
- Automatically monitors your first 5 recent trees
- Updates every 5 seconds
- Shows critical alerts with red styling
- Displays temperature, moisture, and humidity readings

## Critical Health Thresholds

Trees show **CRITICAL** alert when:
- **Temperature > 40°C** ← "Temperature too high"
- **Soil Moisture < 20%** ← "Soil moisture critically low"

## How to Test It

### 1️⃣ Quick Test (Recommended)

**PowerShell (Windows):**
```powershell
.\test-tree-health.ps1
```

**Bash (Mac/Linux):**
```bash
bash test-tree-health.sh
```

This runs 5 test cases automatically.

### 2️⃣ Manual Test

```bash
# High Temperature Alert
curl -X POST http://localhost:5000/api/iot/CG-RPR-2026-000001 \
  -H "Content-Type: application/json" \
  -d '{"temperature": 42, "soilMoisture": 45, "humidity": 60}'

# Low Moisture Alert
curl -X POST http://localhost:5000/api/iot/CG-RPR-2026-000002 \
  -H "Content-Type: application/json" \
  -d '{"temperature": 30, "soilMoisture": 15, "humidity": 70}'
```

### 3️⃣ Verify Results

After running tests:
1. Go to http://localhost:5173/dashboard
2. Look for **red tree cards** in the "Real-Time Tree Health Monitoring" section
3. Check top-right for **toast notifications**
4. Verify **severity badges** show "CRITICAL"
5. Check **alert messages** appear

## What to Look For on Dashboard

### 🔴 Critical State (Red)
```
⚠️ TREE-CODE-001 │CRITICAL
Temperature: 42.0°C  💧 Moisture: 15.0%  💨 Humidity: 60.0%
⚠️ Alerts:
  • Temperature too high
  • Soil moisture critically low
```

### 🟡 Warning State (Yellow)
```
TREE-CODE-002 │WARNING
Temperature: 37.0°C  💧 Moisture: 35.0%  💨 Humidity: 55.0%
```

### ⚪ Normal State (White)
```
TREE-CODE-003 │NORMAL
Temperature: 28.0°C  💧 Moisture: 50.0%  💨 Humidity: 65.0%
```

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/lib/tree-health.ts` | Core health detection function |
| `frontend/src/components/tree-health-monitor.tsx` | React component for displaying alerts |
| `frontend/src/hooks/use-tree-iot.ts` | Hooks for fetching IoT data |
| `frontend/src/pages/dashboard.tsx` | Dashboard with health monitoring integrated |
| `TREE_HEALTH_MONITORING.md` | Full documentation |
| `IMPLEMENTATION_SUMMARY.md` | Implementation details |

## Using in Code

### In React Components
```typescript
import { TreeHealthMonitor } from '@/components/tree-health-monitor';

<TreeHealthMonitor trees={trees} pollInterval={5000} />
```

### Checking Health Status
```typescript
import { isCriticalHealth } from '@/lib/tree-health';

const status = isCriticalHealth({
  temperature: 42,
  soilMoisture: 15,
  humidity: 60,
  recordedAt: new Date().toISOString()
});

if (status.isCritical) {
  console.log('Critical!', status.alerts);
}
```

### Fetching IoT Data
```typescript
import { useTreeIotData } from '@/hooks/use-tree-iot';

const { data } = useTreeIotData('TREE-CODE');
```

## Toast Notifications

When a critical condition is detected:
- **Title:** "🚨 Critical Tree Health Alert"
- **Description:** Shows tree code and specific alerts
- **Type:** "destructive" (red styling)
- **Auto-dismiss:** False (user must close)

## API Endpoints Used

### Get Sensor Data
```
GET /api/iot/:treeCode
```

### Submit Sensor Data
```
POST /api/iot/:treeCode
Body: { temperature, soilMoisture, humidity }
```

## Performance

- **Polling Interval:** 5 seconds (configurable)
- **Trees Monitored:** First 5 recent trees
- **Memory:** Properly cleaned up on component unmount
- **Toast Debouncing:** Only shows on state change

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No notifications appearing | Ensure backend is running on :5000 |
| Cards not showing on dashboard | Check if any trees have IoT data |
| No red highlighting | Verify critical conditions are met |
| Toast not visible | Check it appears in top-right corner |

## Testing Checklist

- [ ] Toast notifications appear for critical alerts
- [ ] Tree cards turn red when critical
- [ ] Tree cards turn yellow for warnings
- [ ] Tree cards stay white when normal
- [ ] Severity badges display correctly
- [ ] Temperature readings shown with icon
- [ ] Moisture readings shown with icon
- [ ] Humidity readings shown with icon
- [ ] Alert messages are specific and helpful
- [ ] Component cleans up properly on unmount

## Documentation

For more details, see:
- `TREE_HEALTH_MONITORING.md` - Complete feature documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `frontend/src/lib/tree-health-examples.ts` - Code examples

## Quick Links

- **Dashboard:** http://localhost:5173/dashboard
- **Backend Health:** http://localhost:5000/health
- **Test IoT Endpoint:** GET http://localhost:5000/api/iot/TREE-CODE

## Examples

### Testing High Temperature
```bash
curl http://localhost:5000/api/iot/CG-RPR-2026-000001 -X POST \
  -H "Content-Type: application/json" \
  -d '{"temperature": 42, "soilMoisture": 45, "humidity": 60}'
```

Expected: Red card appears, toast shows temperature alert

### Testing Low Moisture
```bash
curl http://localhost:5000/api/iot/CG-RPR-2026-000002 -X POST \
  -H "Content-Type: application/json" \
  -d '{"temperature": 30, "soilMoisture": 15, "humidity": 70}'
```

Expected: Red card appears, toast shows moisture alert

### Testing Both Conditions
```bash
curl http://localhost:5000/api/iot/CG-RPR-2026-000003 -X POST \
  -H "Content-Type: application/json" \
  -d '{"temperature": 42, "soilMoisture": 15, "humidity": 50}'
```

Expected: Red card appears, toast shows both alerts

## What Next?

The feature is production-ready! You can:
- ✅ Use it on the dashboard
- ✅ Add to other pages
- ✅ Customize thresholds
- ✅ Add email/SMS alerts
- ✅ Integrate with other systems
- ✅ Add historical data tracking

## Questions?

Check these files:
1. `TREE_HEALTH_MONITORING.md` - Comprehensive docs
2. `IMPLEMENTATION_SUMMARY.md` - Technical details
3. `frontend/src/lib/tree-health-examples.ts` - Code examples
