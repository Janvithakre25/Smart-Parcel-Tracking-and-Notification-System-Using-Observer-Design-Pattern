/**
 * Smart Parcel Tracking and Notification System
 * Realistic Web Application Backend Server (Zero External Dependencies)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// ==========================================
// In-Memory Observer Pattern State (Parcel Subject)
// ==========================================
let parcelState = {
    parcelId: "P101",
    sender: "Amazon Central Fulfillment - Mumbai Hub",
    destination: "Janvi Thakre, Pune Central, Maharashtra",
    status: "Packed", // Packed, Shipped, Out for Delivery, Delivered
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    observers: [
        { id: "obs_1", name: "Rahul", type: "Customer", active: true, registeredAt: "09:00 AM" },
        { id: "obs_2", name: "Priya", type: "Customer", active: true, registeredAt: "09:15 AM" },
        { id: "obs_3", name: "Amit", type: "Delivery Agent", active: true, registeredAt: "09:30 AM" }
    ],
    notifications: []
};

// Function: Notify all active observers when status changes (Observer Pattern)
function notifyObservers(oldStatus, newStatus) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newNotifications = [];

    const activeObservers = parcelState.observers.filter(o => o.active);

    activeObservers.forEach(obs => {
        let message = "";
        if (obs.type === "Customer") {
            message = `Hello ${obs.name}! Your parcel ${parcelState.parcelId} is now: ${newStatus}`;
        } else {
            message = `Agent ${obs.name}: Parcel ${parcelState.parcelId} status updated to: ${newStatus}`;
        }

        const notif = {
            id: "notif_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
            recipientName: obs.name,
            recipientType: obs.type,
            parcelId: parcelState.parcelId,
            status: newStatus,
            message: message,
            timestamp: timestamp
        };

        newNotifications.push(notif);
        parcelState.notifications.unshift(notif); // Add to top of list
    });

    return newNotifications;
}

// Initial trigger for packed stage
notifyObservers("", "Packed");

// Helper to parse JSON body
function parseRequestBody(req, callback) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const parsed = body ? JSON.parse(body) : {};
            callback(null, parsed);
        } catch (e) {
            callback(e);
        }
    });
}

// MIME types dictionary
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

// Create HTTP server
const server = http.createServer((req, res) => {
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

    // API: Get Current Parcel & Observer State
    if (pathname === '/api/parcel' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(parcelState));
        return;
    }

    // API: Update Parcel Status (Triggers Observer Pattern)
    if (pathname === '/api/update-status' && req.method === 'POST') {
        parseRequestBody(req, (err, data) => {
            if (err || !data.status) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Invalid status provided" }));
                return;
            }

            const oldStatus = parcelState.status;
            const newStatus = data.status;

            if (oldStatus === newStatus) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    changed: false,
                    message: `Status is already ${newStatus}`,
                    parcel: parcelState,
                    newNotifications: []
                }));
                return;
            }

            parcelState.status = newStatus;
            parcelState.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dispatched = notifyObservers(oldStatus, newStatus);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                changed: true,
                message: `Status updated to ${newStatus}`,
                parcel: parcelState,
                newNotifications: dispatched
            }));
        });
        return;
    }

    // API: Subscribe new Observer
    if (pathname === '/api/subscribe' && req.method === 'POST') {
        parseRequestBody(req, (err, data) => {
            if (err || !data.name || !data.type) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Name and type (Customer/Delivery Agent) required" }));
                return;
            }

            const newObserver = {
                id: "obs_" + Date.now(),
                name: data.name.trim(),
                type: data.type === "Delivery Agent" ? "Delivery Agent" : "Customer",
                active: true,
                registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            parcelState.observers.push(newObserver);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: `${newObserver.name} subscribed successfully`,
                observer: newObserver,
                parcel: parcelState
            }));
        });
        return;
    }

    // API: Unsubscribe an Observer
    if (pathname === '/api/unsubscribe' && req.method === 'POST') {
        parseRequestBody(req, (err, data) => {
            if (err || !data.id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Observer ID is required" }));
                return;
            }

            const target = parcelState.observers.find(o => o.id === data.id);
            if (target) {
                target.active = false;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: `${target.name} unsubscribed. They will no longer receive notifications.`,
                    parcel: parcelState
                }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Observer not found" }));
            }
        });
        return;
    }

    // API: Re-subscribe an Observer
    if (pathname === '/api/resubscribe' && req.method === 'POST') {
        parseRequestBody(req, (err, data) => {
            const target = parcelState.observers.find(o => o.id === data.id);
            if (target) {
                target.active = true;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: `${target.name} re-subscribed to parcel notifications.`,
                    parcel: parcelState
                }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Observer not found" }));
            }
        });
        return;
    }

    // API: Reset Demo to Default State
    if (pathname === '/api/reset' && req.method === 'POST') {
        parcelState = {
            parcelId: "P101",
            sender: "Amazon Central Fulfillment - Mumbai Hub",
            destination: "Janvi Thakre, Pune Central, Maharashtra",
            status: "Packed",
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            observers: [
                { id: "obs_1", name: "Rahul", type: "Customer", active: true, registeredAt: "09:00 AM" },
                { id: "obs_2", name: "Priya", type: "Customer", active: true, registeredAt: "09:15 AM" },
                { id: "obs_3", name: "Amit", type: "Delivery Agent", active: true, registeredAt: "09:30 AM" }
            ],
            notifications: []
        };
        notifyObservers("", "Packed");

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, parcel: parcelState }));
        return;
    }

    // Static File Serving
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain' });
            res.end(err.code === 'ENOENT' ? '404 Not Found' : 'Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`📦 Smart Parcel Tracking & Notification Portal`);
    console.log(`================================================================`);
    console.log(`📍 Web URL   : http://localhost:${PORT}`);
    console.log(`🚀 Real-time Observer Pattern system ready!`);
    console.log(`================================================================\n`);
});
