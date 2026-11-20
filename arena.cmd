@echo off
setlocal
if not defined AUTOFORGE_CLIENT_ROOT set "AUTOFORGE_CLIENT_ROOT=D:\C\WartuneUltra\client-qa-java-v1"
node "%~dp0arena\autoforge.mjs" %*
exit /b %errorlevel%
