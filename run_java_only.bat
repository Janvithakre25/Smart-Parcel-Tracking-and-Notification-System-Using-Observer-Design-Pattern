@echo off
title Pure Java Console - Main.java
echo =====================================================================
echo    Executing Original Unedited Java Observer Pattern (Main.java)
echo =====================================================================
echo.

REM Try system javac, fallback to IntelliJ JBR if not on PATH
where javac >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [Using system javac & java]
    javac Main.java
    java Main
) else (
    echo [Using bundled OpenJDK from IntelliJ JBR]
    "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.4\jbr\bin\javac.exe" Main.java
    "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.4\jbr\bin\java.exe" Main
)

echo.
echo =====================================================================
echo Execution Complete!
echo =====================================================================
pause
