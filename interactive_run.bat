@echo off
title Smart Parcel Tracking - Interactive User Input Mode
echo =====================================================================
echo    Executing Interactive Observer Pattern (InteractiveMain.java)
echo =====================================================================
echo.

where javac >nul 2>&1
if %ERRORLEVEL% equ 0 (
    javac InteractiveMain.java
    java InteractiveMain
) else (
    "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.4\jbr\bin\javac.exe" InteractiveMain.java
    "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.4\jbr\bin\java.exe" InteractiveMain
)

echo.
pause
