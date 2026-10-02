param([switch]$SkipInstall)
$ErrorActionPreference="Stop"
Write-Host "=== THAIS AI VIDEO - PREPARACAO WINDOWS ===" -ForegroundColor Magenta
if(-not (Get-Command node -ErrorAction SilentlyContinue)){throw "Node.js nao encontrado. Instale Node.js 20+."}
if(-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)){
 if(Get-Command winget -ErrorAction SilentlyContinue){winget install --id Gyan.FFmpeg -e --accept-package-agreements --accept-source-agreements}
 else{throw "FFmpeg nao encontrado e winget indisponivel."}
}
if(!(Test-Path ".env")){Copy-Item ".env.example" ".env"}
npm install
Write-Host ""
Write-Host "Base pronta. Motores esperados:" -ForegroundColor Green
Write-Host "Kokoro: http://127.0.0.1:8880"
Write-Host "ComfyUI: http://127.0.0.1:8188"
Write-Host "Execute npm start e abra http://localhost:3000"
