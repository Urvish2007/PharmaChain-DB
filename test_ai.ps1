$ErrorActionPreference = "Stop"

$questions = @(
    "Generate a revenue table for batch 5001 assuming a unit price of `$20."
)

try {
    Write-Host "Logging in..."
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method Post -ContentType "application/json" -Body '{"username": "admin", "password": "Admin@123"}'
    $token = $response.token
    Write-Host "Got token.`n"
    
    foreach ($q in $questions) {
        Write-Host "QUESTION: $q"
        $body = @{ question = $q } | ConvertTo-Json
        $aiResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/ai/ask" -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body $body -TimeoutSec 60
        Write-Host "AI RESPONSE:`n$($aiResponse.answer)`n"
        Write-Host "--------------------------------------------------`n"
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Host "Error occurred: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd();
        Write-Host "Response body: $responseBody"
    }
}
