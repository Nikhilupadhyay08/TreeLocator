# Tree Health Monitoring - Quick Test Script (PowerShell)
# Usage: Run this after `pnpm dev` is running
# Example: .\test-tree-health.ps1

$API_BASE = "http://localhost:5000"

Write-Host "🌳 Tree Health Monitoring - Test Script" -ForegroundColor Yellow
Write-Host "Testing tree health critical conditions..." -ForegroundColor Yellow
Write-Host ""

function Test-CriticalAlert {
    param(
        [string]$Title,
        [string]$TreeCode,
        [double]$Temperature,
        [double]$Moisture,
        [double]$Humidity
    )
    
    Write-Host $Title -ForegroundColor Yellow
    
    $body = @{
        temperature = $Temperature
        soilMoisture = $Moisture
        humidity = $Humidity
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/api/iot/$TreeCode" `
            -Method Post `
            -Body $body `
            -ContentType "application/json"
        
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Green
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test 1: Critical - High Temperature
Test-CriticalAlert `
    -Title "Test 1: Critical - High Temperature (>40°C)" `
    -TreeCode "CG-RPR-2026-000001" `
    -Temperature 42 `
    -Moisture 45 `
    -Humidity 60

Write-Host "✅ Check dashboard for toast notification and red card!" -ForegroundColor Green
Write-Host ""

# Test 2: Critical - Low Moisture
Test-CriticalAlert `
    -Title "Test 2: Critical - Low Soil Moisture (<20%)" `
    -TreeCode "CG-RPR-2026-000002" `
    -Temperature 30 `
    -Moisture 15 `
    -Humidity 70

Write-Host "✅ Check dashboard for toast notification and red card!" -ForegroundColor Green
Write-Host ""

# Test 3: Critical - Both Conditions
Test-CriticalAlert `
    -Title "Test 3: Critical - Both Conditions (High Temp + Low Moisture)" `
    -TreeCode "CG-RPR-2026-000003" `
    -Temperature 42 `
    -Moisture 15 `
    -Humidity 50

Write-Host "✅ This should trigger both alerts!" -ForegroundColor Green
Write-Host ""

# Test 4: Warning - Temperature
Test-CriticalAlert `
    -Title "Test 4: Warning - Temperature (35-40°C)" `
    -TreeCode "CG-RPR-2026-000004" `
    -Temperature 37 `
    -Moisture 35 `
    -Humidity 55

Write-Host "ℹ️ This should show yellow warning state" -ForegroundColor Yellow
Write-Host ""

# Test 5: Normal - All Good
Test-CriticalAlert `
    -Title "Test 5: Normal - All Optimal" `
    -TreeCode "CG-RPR-2026-000005" `
    -Temperature 28 `
    -Moisture 50 `
    -Humidity 65

Write-Host "✅ This should show green normal state" -ForegroundColor Green
Write-Host ""

Write-Host "Test Complete!" -ForegroundColor Yellow
Write-Host ""
Write-Host "View results:"
Write-Host "  Frontend: http://localhost:5173/dashboard"
Write-Host "  Check browser console for any errors"
Write-Host "  Look for toast notifications in top-right corner"
Write-Host ""
Write-Host "Verify:"
Write-Host "  ✓ Toast notifications appear for critical conditions"
Write-Host "  ✓ Tree cards turn red when critical"
Write-Host "  ✓ Tree cards turn yellow when warning"
Write-Host "  ✓ Tree cards stay white when normal"
Write-Host "  ✓ Severity badges display correctly"
Write-Host "  ✓ Alert messages are clear and specific"
