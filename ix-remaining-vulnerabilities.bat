@echo off
:: filepath: c:\Users\mahni\Desktop\Šola\4. letnik\Matura\Izdelek\fix-remaining-vulnerabilities.bat
echo Fixing remaining vulnerabilities...

:: Create backups directory if it doesn't exist
if not exist backups mkdir backups

:: Get current date and time for backup filenames
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set datetime=%%a
set timestamp=%datetime:~0,14%

:: Backup package files
copy package.json "backups\package.json.%timestamp%"
if exist package-lock.json copy package-lock.json "backups\package-lock.json.%timestamp%"

:: Remove the problematic package
echo Removing and reinstalling nodemon with the latest version...
call npm uninstall nodemon
call npm install --save-dev nodemon@latest

:: Run security audit
echo Running security audit...
call npm audit

echo.
echo Update complete! Please restart your development server if it was running.
pause