/**
 * Smart Parcel Tracking and Notification System
 * Multi-Parcel Real-time Courier System (Observer Pattern)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Multi-parcel in-memory database
let parcels = {
    "P101": {
        parcelId: "P101",
        recipient: "Rahul Sharma",
        sender: "Amazon Central Hub (Mumbai)",
        destination: "Andheri West, Mumbai",
        status: "Packed",
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        observers: [
            { id: "obs_1", name: "Rahul Sharma", type: "Customer", active: true, registeredAt: "09:00 AM" },
            { id: "obs_2", name: "Agent Amit", type: "Delivery Agent", active: true, registeredAt: "09:10 AM" }
        ],
        notifications: [
            {
                id: "notif_1",
                recipientName: "Rahul Sharma",
                recipientType: "Customer",
                parcelId: "P101",
                status: "Packed",
                message: "Hello Rahul Sharma! Your parcel P101 is now: Packed",
                timestamp: "09:00 AM"
            },
            {
                id: "notif_2",
                recipientName: "Agent Amit",
                recipientType: "Delivery Agent",
                parcelId: "P101",
                status: "Packed",
                message: "Agent Amit: Parcel P101 status updated to: Packed",
                timestamp: "09:10 AM"
            }
        ]
    },
    "P102": {
        parcelId: "P102",
        recipient: "Priya Patel",
        sender: "Flipkart Logistics (Bangalore)",
        destination: "Koramangala, Bangalore",
        status: "Shipped",
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        observers: [
            { id: "obs_3", name: "Priya Patel", type: "Customer", active: true, registeredAt: "10:15 AM" },
            { id: "obs_4", name: "Agent Vikram", type: "Delivery Agent", active: true, registeredAt: "10:20 AM" }
        ],
        notifications: [
            {
                id: "notif_3",
                recipientName: "Priya Patel",
                recipientType: "Customer",
                parcelId: "P102",
                status: "Shipped",
                message: "Hello Priya Patel! Your parcel P102 is now: Shipped",
                timestamp: "10:15 AM"
            },
            {
                id: "notif_4",
                recipientName: "Agent Vikram",
                recipientType: "Delivery Agent",
                parcelId: "P102",
                status: "Shipped",
                message: "Agent Vikram: Parcel P102 status updated to: Shipped",
                timestamp: "10:20 AM"
            }
        ]
    },
    "P103": {
        parcelId: "P103",
        recipient: "Sneha Roy",
        sender: "Delhivery Hub (Delhi)",
        destination: "Salt Lake, Kolkata",
        status: "Out for Delivery",
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        observers: [
            { id: "obs_5", name: "Sneha Roy", type: "Customer", active: true, registeredAt: "11:00 AM" },
            { id: "obs_6", name: "Agent Rajesh", type: "Delivery Agent", active: true, registeredAt: "11:05 AM" }
        ],
        notifications: [
            {
                id: "notif_5",
                recipientName: "Sneha Roy",
                recipientType: "Customer",
                parcelId: "P103",
                status: "Out for Delivery",
                message: "Hello Sneha Roy! Your parcel P103 is now: Out for Delivery",
                timestamp: "11:00 AM"
            },
            {
                id: "notif_6",
                recipientName: "Agent Rajesh",
                recipientType: "Delivery Agent",
                parcelId: "P103",
                status: "Out for Delivery",
                message: "Agent Rajesh: Parcel P103 status updated to: Out for Delivery",
                timestamp: "11:05 AM"
            }
        ]
    }
};

let activeParcelId = "P101";

// Trigger Observer notifications on status change
function notifyParcelObservers(parcel, newStatus) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newNotifications = [];

    const activeObservers = parcel.observers.filter(o => o.active);

    activeObservers.forEach(obs => {
        let message = "";
        if (obs.type === "Customer") {
            message = `Hello ${obs.name}! Your parcel ${parcel.parcelId} is now: ${newStatus}`;
        } else {
            message = `Agent ${obs.name}: Parcel ${parcel.parcelId} status updated to: ${newStatus}`;
        }

        const notif = {
            id: "notif_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
            recipientName: obs.name,
            recipientType: obs.type,
            parcelId: parcel.parcelId,
            status: newStatus,
            message: message,
            timestamp: timestamp
        };

        newNotifications.push(notif);
        parcel.notifications.unshift(notif);
    });

    return newNotifications;
}

// Parse JSON Body
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

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
};

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

    // GET /api/parcels - List all parcels
    if (pathname === '/api/parcels' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            activeParcelId: activeParcelId,
            parcels: Object.values(parcels)
        }));
        return;
    }

    // GET /api/parcel - Get active parcel
    if (pathname === '/api/parcel' && req.method === 'GET') {
        const id = url.searchParams.get('id') || activeParcelId;
        const target = parcels[id] || parcels[activeParcelId];
        activeParcelId = target.parcelId;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(target));
        return;
    }

    // POST /api/parcel/create - Create a brand new parcel
    if (pathname === '/api/parcel/create' && req.method === 'POST') {
        parseRequestBody(req, (err, data) => {
            if (err || !data.parcelId || !data.recipient) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Parcel ID and recipient are required" }));
                return;
            }

            const id = data.parcelId.trim().toUpperCase();
            if (parcels[id]) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Parcel ${id} already exists!` }));
                return;
            }

            const newParcel = {
                parcelId: id,
                recipient: data.recipient.trim(),
                sender: data.sender ? data.sender.trim() : "Central Dispatch Hub",
                destination: data.destination ? data.destination.trim() : "Local Delivery Zone",
                status: "Packed",
                lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                observers: [
                    { id: "obs_" + Date.now(), name: data.recipient.trim(), type: "Customer", active: true, registeredAt: "Just now" },
                    { id: "obs_" + (Date.now() + 1), name: "Agent Assigned", type: "Delivery Agent", active: true, registeredAt: "Just now" }
                ],
                notifications: []
            };

            notifyParcelObservers(newParcel, "Packed");
            parcels[id] = newParcel;
            activeParcelId = id;

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, parcel: newParcel }));
        });
        return;
    }

    // POST /api/update-status - Update status of active parcel
    if (pathname === '/api/update-status' && req.method === 'POST') {
        parseRequestBody(req, (err, data) => {
            const id = data.parcelId || activeParcelId;
            const target = parcels[id];
            if (!target) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Parcel not found" }));
                return;
            }

            const oldStatus = target.status;
            const newStatus = data.status;

            if (oldStatus === newStatus) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ changed: false, parcel: target, newNotifications: [] }));
                return;
            }

            target.status = newStatus;
            target.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dispatched = notifyParcelObservers(target, newStatus);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ changed: true, parcel: target, newNotifications: dispatched }));
        });
        return;
    }

    // POST /api/subscribe - Add observer to active parcel
    if (pathname === '/api/subscribe' && req.method === 'POST') {
        parseRequestBody(req, (err, data) => {
            const id = data.parcelId || activeParcelId;
            const target = parcels[id];
            if (!target) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Parcel not found" }));
                return;
            }

            const newObserver = {
                id: "obs_" + Date.now(),
                name: data.name.trim(),
                type: data.type === "Delivery Agent" ? "Delivery Agent" : "Customer",
                active: true,
                registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            target.observers.push(newObserver);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, observer: newObserver, parcel: target }));
        });
        return;
    }

    // POST /api/unsubscribe - Unsubscribe observer
    if (pathname === '/api/unsubscribe' && req.method === 'POST') {
        parseRequestBody(req, (err, data) => {
            const id = data.parcelId || activeParcelId;
            const target = parcels[id];
            if (!target) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Parcel not found" }));
                return;
            }

            const obs = target.observers.find(o => o.id === data.id);
            if (obs) {
                obs.active = false;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, parcel: target }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Observer not found" }));
            }
        });
        return;
    }

    // POST /api/resubscribe - Re-subscribe observer
    if (pathname === '/api/resubscribe' && req.method === 'POST') {
        parseRequestBody(req, (err, data) => {
            const id = data.parcelId || activeParcelId;
            const target = parcels[id];
            const obs = target ? target.observers.find(o => o.id === data.id) : null;
            if (obs) {
                obs.active = true;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, parcel: target }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Observer not found" }));
            }
        });
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
    console.log(`📦 SmartParcel Express - Multi-Parcel Real-time System`);
    console.log(`📍 Web URL   : http://localhost:${PORT}`);
    console.log(`================================================================\n`);
});
