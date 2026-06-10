param(
  [string]$Period = "Hoje"
)

$ErrorActionPreference = "Stop"

function Load-DotEnv {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    throw "Arquivo .env nao encontrado em $Path"
  }

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()

    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
      return
    }

    $name, $value = $line.Split("=", 2)
    [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
  }
}

function Test-TcpPort {
  param(
    [string]$HostName,
    [int]$Port,
    [int]$TimeoutMs = 15000
  )

  $client = [System.Net.Sockets.TcpClient]::new()
  $async = $client.BeginConnect($HostName, $Port, $null, $null)
  $connected = $async.AsyncWaitHandle.WaitOne($TimeoutMs, $false)

  if ($connected -and $client.Connected) {
    $client.EndConnect($async)
    $client.Close()
    return $true
  }

  $client.Close()
  return $false
}

Load-DotEnv -Path ".env"

if (-not $env:SPLUNK_BASE_URL -or -not $env:SPLUNK_AUTH_TOKEN) {
  throw "Configure SPLUNK_BASE_URL e SPLUNK_AUTH_TOKEN no .env"
}

$baseUrl = $env:SPLUNK_BASE_URL.TrimEnd("/")
$uri = [Uri]$baseUrl
$hostName = $uri.Host
$port = if ($uri.Port -gt 0) { $uri.Port } else { 443 }

Write-Host "Splunk base URL: $baseUrl"
Write-Host "Host: $hostName"
Write-Host "Porta: $port"
Write-Host ""

Write-Host "1) DNS"
Resolve-DnsName $hostName | Select-Object -First 3 Name, Type, IPAddress | Format-Table

Write-Host "2) TCP"
$tcpOk = Test-TcpPort -HostName $hostName -Port $port
if ($tcpOk) {
  Write-Host "TCP_OK"
} else {
  Write-Host "TCP_FAILED"
  Write-Host "A porta nao esta acessivel desta rede. Conecte a VPN e rode o teste novamente."
  exit 1
}

Write-Host ""
Write-Host "3) HTTP Splunk info"
curl.exe -k -sS --connect-timeout 20 --max-time 40 -o NUL `
  -w "http_code=%{http_code} connect=%{time_connect} total=%{time_total} remote_ip=%{remote_ip}`n" `
  -H "Authorization: Bearer $env:SPLUNK_AUTH_TOKEN" `
  "$baseUrl/services/server/info?output_mode=json"

Write-Host ""
Write-Host "4) Export search minimo"
$query = "search | makeresults count=1 | eval teste=""ok"" | table teste"
$body = "search=$([Uri]::EscapeDataString($query))&output_mode=json"

curl.exe -k -sS --connect-timeout 20 --max-time 60 -o NUL `
  -w "http_code=%{http_code} connect=%{time_connect} starttransfer=%{time_starttransfer} total=%{time_total}`n" `
  -H "Authorization: Bearer $env:SPLUNK_AUTH_TOKEN" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  --data $body `
  "$baseUrl/services/search/jobs/export"
