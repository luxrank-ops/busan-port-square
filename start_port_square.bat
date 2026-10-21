@echo off
set PATH=C:\Users\%USERNAME%\.aside\runtime\bin;%PATH%
cd /d "%~dp0"
start http://localhost:3010
node .\node_modules\vite\bin\vite.js preview --port=3010 --host=0.0.0.0
