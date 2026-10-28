@echo off
title Smart Parcel Tracking - Observer Pattern
echo =====================================================================
echo    Smart Parcel Tracking and Notification System (Java Observer)
echo =====================================================================
echo.
echo Starting Java Integration Server & Web Dashboard...
echo.

start http://localhost:3000
node server.js

pause
