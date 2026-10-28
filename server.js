/**
 * Smart Parcel Tracking and Notification System
 * Lightweight External Integration Launcher for Java Observer Pattern
 * 
 * STRICT COMPLIANCE:
 * - Does NOT modify Main.java in any way.
 * - Compiles and executes the original unedited Java program.
 * - Streams/serves the authentic console output to the web dashboard.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, execSync, spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const MAIN_JAVA_PATH = path.join(__dirname, 'Main.java');

// Find Java and Javac executables
function findJavaBinaries() {
    let javacCmd = 'javac';
    let javaCmd = 'java';

    // Test default path first
    try {
        execSync('javac -version', { stdio: 'pipe' });
        return { javac: 'javac', java: 'java', source: 'System PATH' };
    } catch (e) {
        // Not in default path, search known directories
    }

    const candidateDirs = [
        process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin') : null,
        'C:\\Program Files\\JetBrains\\IntelliJ IDEA 2026.1.4\\jbr\\bin',
        'C:\\Program Files\\Java\\latest\\bin',
        'C:\\Program Files\\Java\\jdk-21\\bin',
        'C:\\Program Files\\Java\\jdk-17\\bin',
        'C:\\Program Files\\Java\\jdk1.8.0_491\\bin',
        'C:\\Program Files (x86)\\Common Files\\Oracle\\Java\\java8path'
    ].filter(Boolean);

    for (const dir of candidateDirs) {
        const testJavac = path.join(dir, 'javac.exe');
        const testJava = path.join(dir, 'java.exe');
        if (fs.existsSync(testJavac) && fs.existsSync(testJava)) {
            return {
                javac: `"${testJavac}"`,
                java: `"${testJava}"`,
                source: dir
            };
        } else if (fs.existsSync(testJava)) {
            // Found java, check if javac exists elsewhere or if java can run directly
            return {
                javac: fs.existsSync(testJavac) ? `"${testJavac}"` : 'javac',
                java: `"${testJava}"`,
                source: dir
            };
        }
    }

    return { javac: 'javac', java: 'java', source: 'Fallback default' };
}

const javaEnv = findJavaBinaries();

// Helper to compile and run Main.java
function executeJavaProgram(callback) {
    const startTime = Date.now();
    const compileCmd = `${javaEnv.javac} Main.java`;
    const runCmd = `${javaEnv.java} Main`;

    // 1. Compile Main.java
    exec(compileCmd, { cwd: __dirname }, (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
            return callback({
                success: false,
                stage: 'compilation',
                error: compileStderr || compileErr.message,
                command: compileCmd,
                executionTimeMs: Date.now() - startTime
            });
        }

        // 2. Run Main
        exec(runCmd, { cwd: __dirname }, (runErr, runStdout, runStderr) => {
            const executionTimeMs = Date.now() - startTime;
            if (runErr) {
                return callback({
                    success: false,
                    stage: 'runtime',
                    error: runStderr || runErr.message,
                    stdout: runStdout,
                    command: runCmd,
                    executionTimeMs
                });
            }

            callback({
                success: true,
                stdout: runStdout,
                stderr: runStderr,
                executionTimeMs,
                timestamp: new Date().toISOString(),
                command: `${compileCmd} && ${runCmd}`,
                compilerPath: javaEnv.source
            });
        });
    });
}

// MIME types dictionary
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.java': 'text/plain; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Create HTTP server
const server = http.createServer((req, res) => {
    // Add CORS headers so external callers / local file callers can communicate
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // API: Run original Java program
    if (pathname === '/api/run-java' && (req.method === 'POST' || req.method === 'GET')) {
        executeJavaProgram((result) => {
            res.writeHead(result.success ? 200 : 500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result, null, 2));
        });
        return;
    }

    // API: Get original Main.java source code
    if (pathname === '/api/java-source') {
        fs.readFile(MAIN_JAVA_PATH, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Could not read Main.java' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    filename: 'Main.java',
                    path: MAIN_JAVA_PATH,
                    source: data,
                    lineCount: data.split('\n').length
                }));
            }
        });
        return;
    }

    // API: Status check
    if (pathname === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'online',
            service: 'Smart Parcel Tracking - Java Integration Layer',
            javaEnvironment: javaEnv,
            nodeVersion: process.version,
            serverTime: new Date().toISOString()
        }));
        return;
    }

    // Static file serving
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    
    // Normalize and security check
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`================================================================`);
        console.log(`🚀 Smart Parcel Tracking Web Dashboard & Java Integration Layer`);
        console.log(`================================================================`);
        console.log(`📍 Web Dashboard URL : http://localhost:${PORT}`);
        console.log(`☕ Java Binary Path  : ${javaEnv.source}`);
        console.log(`📄 Target Java File  : ${MAIN_JAVA_PATH} (100% UNMODIFIED)`);
        console.log(`📡 Ready to execute Java Observer pattern and serve web client!`);
        console.log(`================================================================\n`);
    });
}

module.exports = { executeJavaProgram, javaEnv, server };

