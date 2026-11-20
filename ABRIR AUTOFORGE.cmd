@echo off
setlocal
cd /d "%~dp0"
node alfa\cli.mjs open
if errorlevel 1 pause
