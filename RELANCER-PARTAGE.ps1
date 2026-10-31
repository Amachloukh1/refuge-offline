$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$configPath = Join-Path $PSScriptRoot 'private\share-access.json'
$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
if ([datetimeoffset]::Parse($config.expiresAt) -le [datetimeoffset]::UtcNow) {
    throw 'Ce partage a expire. Ce lanceur ne renouvelle pas sa duree.'
}
if (-not (Test-Path -LiteralPath $config.file -PathType Leaf)) { throw 'Archive inaccessible.' }
$pidPath = Join-Path $PSScriptRoot 'runtime\share-download.pid'
if (Test-Path -LiteralPath $pidPath) {
    $relayId = [int](Get-Content -LiteralPath $pidPath -Raw)
    $existing = Get-CimInstance Win32_Process -Filter "ProcessId=$relayId"
    if ($existing -and $existing.Name -eq 'node.exe' -and $existing.CommandLine -like '*scripts/serve-share.mjs*private/share-access.json*') {
        Write-Output 'Le relais REFUGE fonctionne deja.'
        exit 0
    }
}
$listener = Get-NetTCPConnection -LocalPort $config.port -State Listen -ErrorAction SilentlyContinue
if ($listener) { throw 'Le port est deja occupe. Aucun processus ne sera arrete.' }
$nodePath = (Get-Command node -ErrorAction Stop).Source
$relay = Start-Process -FilePath $nodePath -ArgumentList 'scripts/serve-share.mjs','private/share-access.json' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput 'runtime/share-download.log' -RedirectStandardError 'runtime/share-download-error.log' -PassThru
$relay.Id | Set-Content -LiteralPath $pidPath
Start-Sleep -Seconds 2
if ($relay.HasExited) { throw 'Le relais a echoue. Lire runtime/share-download-error.log.' }
Write-Output ('Relais REFUGE demarre. Expiration : ' + $config.expiresAt)
Write-Output 'Tailscale doit rester connecte. Ce lanceur ne modifie aucun acces public.'
