@echo off
cd /d "%~dp0"
echo SES Auto Send local server
echo.
echo Main app URL:
echo http://127.0.0.1:4173/prototype/index.html
echo.
echo Company test direct URL:
echo http://127.0.0.1:4173/prototype/company-test.html
echo.
echo Keep this window open while testing.
echo Press Ctrl+C to stop.
echo.
node prototype\local-static-server.cjs
pause
