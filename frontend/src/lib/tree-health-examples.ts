/**
 * Tree Health Monitoring Feature - Usage Examples
 * 
 * This file demonstrates how to use the tree health monitoring feature
 * in the Dot-Explorer application.
 */

import { isCriticalHealth, formatAlertMessage, getHealthSeverityClass } from '@/lib/tree-health';
import type { TreeHealthData } from '@/lib/tree-health';

// ============================================================================
// Example 1: Basic Health Check
// ============================================================================

export function example1_BasicHealthCheck() {
  const healthData: TreeHealthData = {
    temperature: 42,
    soilMoisture: 15,
    humidity: 60,
    recordedAt: new Date().toISOString(),
  };

  const healthStatus = isCriticalHealth(healthData);

  console.log('Health Check Result:', healthStatus);
  // Output:
  // {
  //   isCritical: true,
  //   alerts: ['Temperature too high', 'Soil moisture critically low'],
  //   severity: 'critical'
  // }

  if (healthStatus.isCritical) {
    console.log('⚠️ CRITICAL CONDITION DETECTED!');
  }
}

// ============================================================================
// Example 2: Using in React Component
// ============================================================================

export function example2_ReactComponent() {
  const code = `
    import { useToast } from '@/hooks/use-toast';
    import { TreeHealthMonitor } from '@/components/tree-health-monitor';
    
    export function MyComponent() {
      const { toast } = useToast();
      
      const trees = [
        {
          treeCode: 'CG-RPR-2026-000123',
          healthData: {
            temperature: 42,
            soilMoisture: 15,
            humidity: 60,
            recordedAt: new Date().toISOString(),
          },
          treeName: 'Sal Tree',
        }
      ];
      
      const handleCriticalAlert = (treeCode: string, alerts: string[]) => {
        // Custom handling for critical alerts
        console.log(\`Tree \${treeCode} is critical:\`, alerts);
      };
      
      return (
        <TreeHealthMonitor 
          trees={trees}
          onCriticalAlert={handleCriticalAlert}
          pollInterval={5000}
        />
      );
    }
  `;

  console.log('React Component Example:', code);
}

// ============================================================================
// Example 3: Fetching IoT Data for a Tree
// ============================================================================

export function example3_FetchingIotData() {
  const code = `
    import { useTreeIotData } from '@/hooks/use-tree-iot';
    import { isCriticalHealth } from '@/lib/tree-health';
    
    export function TreeDetailsPage() {
      const { data: iotReadings, loading, error } = useTreeIotData('CG-RPR-2026-000123');
      
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error: {error.message}</div>;
      
      const latestReading = iotReadings?.[0];
      if (latestReading) {
        const health = isCriticalHealth({
          temperature: latestReading.temperature,
          soilMoisture: latestReading.soilMoisture,
          humidity: latestReading.humidity,
          recordedAt: latestReading.recordedAt,
        });
        
        if (health.isCritical) {
          // Show alert or highlight the tree
        }
      }
      
      return <div>{/* Render tree details */}</div>;
    }
  `;

  console.log('IoT Data Fetching Example:', code);
}

// ============================================================================
// Example 4: Submitting IoT Readings from Hardware
// ============================================================================

export function example4_SubmitIotReading() {
  const code = `
    import { submitIotReading } from '@/hooks/use-tree-iot';
    
    async function handleSensorData(treeCode: string) {
      try {
        const result = await submitIotReading(treeCode, {
          temperature: 42,
          soilMoisture: 15,
          humidity: 60,
        });
        
        console.log('Reading saved:', result);
        // The backend will automatically detect critical conditions
        // and set alertGenerated if needed
      } catch (error) {
        console.error('Failed to submit reading:', error);
      }
    }
  `;

  console.log('Submit IoT Reading Example:', code);
}

// ============================================================================
// Example 5: Working with Toast Notifications
// ============================================================================

export function example5_ToastNotifications() {
  const code = `
    import { useToast } from '@/hooks/use-toast';
    import { TreeHealthMonitor } from '@/components/tree-health-monitor';
    
    export function Dashboard() {
      const { toast } = useToast();
      
      const handleCriticalAlert = (treeCode: string, alerts: string[]) => {
        // Toast is automatically shown by TreeHealthMonitor
        // But you can add custom handling here
        
        // Send to backend for logging
        fetch('/api/alerts', {
          method: 'POST',
          body: JSON.stringify({
            treeCode,
            alerts,
            timestamp: new Date().toISOString(),
          }),
        });
      };
      
      return (
        <TreeHealthMonitor 
          trees={monitored}
          onCriticalAlert={handleCriticalAlert}
        />
      );
    }
  `;

  console.log('Toast Notifications Example:', code);
}

// ============================================================================
// Example 6: Health Thresholds and Severity Levels
// ============================================================================

export function example6_ThresholdsAndSeverity() {
  const examples = [
    {
      name: 'Normal Condition',
      data: { temperature: 30, soilMoisture: 45, humidity: 70, recordedAt: '' },
      expected: { severity: 'normal', isCritical: false },
    },
    {
      name: 'Warning Level',
      data: { temperature: 37, soilMoisture: 25, humidity: 55, recordedAt: '' },
      expected: { severity: 'warning', isCritical: false },
    },
    {
      name: 'Critical - High Temperature',
      data: { temperature: 41, soilMoisture: 35, humidity: 50, recordedAt: '' },
      expected: { severity: 'critical', isCritical: true, alerts: ['Temperature too high'] },
    },
    {
      name: 'Critical - Low Moisture',
      data: { temperature: 35, soilMoisture: 18, humidity: 45, recordedAt: '' },
      expected: { severity: 'critical', isCritical: true, alerts: ['Soil moisture critically low'] },
    },
    {
      name: 'Critical - Both Conditions',
      data: { temperature: 42, soilMoisture: 15, humidity: 40, recordedAt: '' },
      expected: {
        severity: 'critical',
        isCritical: true,
        alerts: ['Temperature too high', 'Soil moisture critically low'],
      },
    },
  ];

  examples.forEach(example => {
    const result = isCriticalHealth(example.data as unknown as TreeHealthData);
    console.log(`\n${example.name}:`);
    console.log('Input:', example.data);
    console.log('Result:', result);
    console.log('Expected:', example.expected);
    console.log('Match:', JSON.stringify(result) === JSON.stringify(example.expected));
  });
}

// ============================================================================
// Health Thresholds Reference
// ============================================================================

export const HEALTH_THRESHOLDS = {
  // CRITICAL CONDITIONS (must trigger alert)
  TEMPERATURE_CRITICAL: {
    threshold: 40,
    unit: '°C',
    description: 'If temperature exceeds 40°C, tree is in critical condition',
  },
  SOIL_MOISTURE_CRITICAL: {
    threshold: 20,
    unit: '%',
    description: 'If soil moisture drops below 20%, tree needs immediate watering',
  },

  // WARNING CONDITIONS (displayed as warning but not critical)
  TEMPERATURE_WARNING: {
    threshold: 35,
    unit: '°C',
    description: 'Temperature between 35-40°C shows warning state',
  },
  SOIL_MOISTURE_WARNING: {
    threshold: 30,
    unit: '%',
    description: 'Soil moisture between 20-30% shows warning state',
  },

  // OPTIMAL RANGES
  TEMPERATURE_OPTIMAL: {
    min: 20,
    max: 30,
    unit: '°C',
    description: 'Optimal temperature range for most tree species',
  },
  SOIL_MOISTURE_OPTIMAL: {
    min: 40,
    max: 60,
    unit: '%',
    description: 'Optimal soil moisture range for tree growth',
  },
};

// ============================================================================
// Testing Guide
// ============================================================================

export const TESTING_GUIDE = `
TREE HEALTH MONITORING - TESTING GUIDE

1. SETUP
   - The dashboard automatically monitors the first 5 recently added trees
   - IoT data is fetched every 5 seconds

2. TESTING CRITICAL ALERTS
   - Submit IoT data with temperature > 40 or moisture < 20
   - Use the IoT endpoint: POST /api/iot/:treeCode
   - Example payload:
     {
       "temperature": 42,
       "soilMoisture": 15,
       "humidity": 60
     }
   - A toast notification should appear automatically

3. MONITORING COMPONENTS
   - The TreeHealthMonitor component shows real-time health status
   - Cards are highlighted in red when critical
   - Tree code, temperature, moisture, and humidity are displayed
   - Alert messages are shown in red boxes

4. VERIFYING FUNCTIONALITY
   - Check toast notifications appear for critical conditions
   - Verify tree cards turn red when critical
   - Confirm severity badge updates correctly
   - Test with both critical conditions (temp > 40 AND moisture < 20)

5. DEBUGGING
   - Check browser console for errors
   - Verify backend is running on http://localhost:5000
   - Test IoT endpoint directly: GET http://localhost:5000/api/iot/TREE_CODE
   - Check network tab in DevTools for API calls

6. SAMPLE TEST DATA
   Submit multiple readings to test different scenarios:
   
   Critical (HIGH_HEAT):
   POST /api/iot/CG-RPR-2026-000001
   { "temperature": 42, "soilMoisture": 45, "humidity": 60 }
   
   Critical (NEEDS_WATER):
   POST /api/iot/CG-RPR-2026-000002
   { "temperature": 30, "soilMoisture": 15, "humidity": 70 }
   
   Critical (BOTH):
   POST /api/iot/CG-RPR-2026-000003
   { "temperature": 42, "soilMoisture": 15, "humidity": 50 }
   
   Warning:
   POST /api/iot/CG-RPR-2026-000004
   { "temperature": 37, "soilMoisture": 25, "humidity": 55 }
   
   Normal:
   POST /api/iot/CG-RPR-2026-000005
   { "temperature": 28, "soilMoisture": 50, "humidity": 65 }
`;

export default {
  example1_BasicHealthCheck,
  example2_ReactComponent,
  example3_FetchingIotData,
  example4_SubmitIotReading,
  example5_ToastNotifications,
  example6_ThresholdsAndSeverity,
  HEALTH_THRESHOLDS,
  TESTING_GUIDE,
};
