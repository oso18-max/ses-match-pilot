@echo off
cd /d "%~dp0"
echo SES Auto Send company test server
echo.
echo Open this URL after the server starts:
echo http://127.0.0.1:4173/prototype/company-test.html
echo.
echo Keep this window open while testing.
echo Press Ctrl+C to stop.
echo.
node prototype\local-static-server.cjs
pause
