$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
$env:OLLAMA_HOST='127.0.0.1:11479'
$env:OLLAMA_MODELS=Join-Path $PSScriptRoot 'models'
$env:OLLAMA_NO_CLOUD='1'
$env:OLLAMA_CONTEXT_LENGTH='4096'
$env:OLLAMA_NUM_PARALLEL='1'
$env:OLLAMA_MAX_LOADED_MODELS='1'
$env:CUDA_VISIBLE_DEVICES='-1'
$env:OLLAMA_VULKAN='0'
$env:REFUGE_AI_BASE_URL='http://127.0.0.1:11479/v1'
$env:REFUGE_AI_PROVIDER='ollama'
$env:REFUGE_AI_MODEL='qwen3:4b-instruct-2507-q4_K_M'
try { $null=Invoke-RestMethod http://127.0.0.1:11479/api/version -TimeoutSec 2 } catch {
  $proc=Start-Process -FilePath (Join-Path $PSScriptRoot 'runtime/ollama/ollama.exe') -ArgumentList 'serve' -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $PSScriptRoot 'runtime/own-ollama.log') -RedirectStandardError (Join-Path $PSScriptRoot 'runtime/own-ollama.err.log')
  $proc.Id | Set-Content runtime/ollama.pid
}
Write-Output 'REFUGE : http://127.0.0.1:8099'
node --env-file-if-exists=.env server/index.js
