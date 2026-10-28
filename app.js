/**
 * SmartParcel Express - Client Application Controller
 * Realistic Real-time Parcel Tracking & Observer Pattern System
 */

// Local fallback state (used when opened directly via file:// without server.js)
let localState = {
    parcelId: "P101",
    sender: "Amazon Central Fulfillment - Mumbai Hub",
    destination: "Janvi Thakre, Pune Central, Maharashtra",
    status: "Packed",
    lastUpdated: "Just now",
    observers: [
        { id: "obs_1", name: "Rahul", type: "Customer", active: true, registeredAt: "09:00 AM" },
        { id: "obs_2", name: "Priya", type: "Customer", active: true, registeredAt: "09:15 AM" },
        { id: "obs_3", name: "Amit", type: "Delivery Agent", active: true, registeredAt: "09:30 AM" }
    ],
    notifications: []
};

let isConnectedToServer = false;
const API_BASE = window.location.origin.includes('http') ? window.location.origin : 'http://localhost:3000';

// DOM Elements
const currentStatusBadge = document.getElementById('currentStatusBadge');
const lastUpdatedText = document.getElementById('lastUpdatedText');
const displayParcelId = document.getElementById('displayParcelId');
const timelineBarFill = document.getElementById('timelineBarFill');
const statusButtons = document.querySelectorAll('.status-action-btn');
const observersListContainer = document.getElementById('observersListContainer');
const activeSubCount = document.getElementById('activeSubCount');
const notificationsFeed = document.getElementById('notificationsFeed');
const addObserverForm = document.getElementById('addObserverForm');
const obsNameInput = document.getElementById('obsNameInput');
const obsTypeInput = document.getElementById('obsTypeInput');
const filterPills = document.querySelectorAll('.filter-pill');
const btnResetDemo = document.getElementById('btnResetDemo');
const toastContainer = document.getElementById('toastContainer');

const STAGE_CONFIG = {
    "Packed": { index: 0, progress: 10, node: "node-Packed" },
    "Shipped": { index: 1, progress: 40, node: "node-Shipped" },
    "Out for Delivery": { index: 2, progress: 75, node: "node-Out-for-Delivery" },
    "Delivered": { index: 3, progress: 100, node: "node-Delivered" }
};

let currentFilter = 'all';

// Initialize and Fetch Parcel State
async function initApp() {
    try {
        const response = await fetch(`${API_BASE}/api/parcel`);
        if (response.ok) {
            const data = await response.json();
            localState = data;
            isConnectedToServer = true;
            renderAll();
            return;
        }
    } catch (e) {
        console.log("Running in offline client mode");
    }

    // Fallback: initialize packed alert in client mode
    if (localState.notifications.length === 0) {
        clientNotify("Packed");
    }
    renderAll();
}

// Render complete dashboard
function renderAll() {
    renderStatus(localState.status);
    renderObservers(localState.observers);
    renderNotifications(localState.notifications);
}

// Render Status and 4-Stage Timeline
function renderStatus(status) {
    currentStatusBadge.innerText = status;
    lastUpdatedText.innerText = `Updated: ${localState.lastUpdated || 'Just now'}`;

    const config = STAGE_CONFIG[status] || STAGE_CONFIG["Packed"];

    // Update Progress Bar
    timelineBarFill.style.width = `${config.progress}%`;

    // Update Timeline Step Nodes
    const stages = ["Packed", "Shipped", "Out for Delivery", "Delivered"];
    stages.forEach((stage, idx) => {
        const nodeEl = document.getElementById(STAGE_CONFIG[stage].node);
        if (!nodeEl) return;

        nodeEl.classList.remove('completed', 'active');
        if (idx < config.index) {
            nodeEl.classList.add('completed');
        } else if (idx === config.index) {
            nodeEl.classList.add('active');
        }
    });

    // Update Dispatch Control Buttons
    statusButtons.forEach(btn => {
        if (btn.dataset.status === status) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Render Subscribed Observers
function renderObservers(observers) {
    observersListContainer.innerHTML = '';
    const activeCount = observers.filter(o => o.active).length;
    activeSubCount.innerText = `${activeCount} Active`;

    observers.forEach(obs => {
        const item = document.createElement('div');
        item.className = `observer-item ${obs.active ? '' : 'inactive'}`;

        const isCustomer = obs.type === 'Customer';
        const avatar = isCustomer ? '👤' : '🚚';
        const roleClass = isCustomer ? 'Customer' : 'Agent';

        item.innerHTML = `
            <div class="obs-left">
                <div class="obs-avatar ${isCustomer ? '' : 'agent'}">${avatar}</div>
                <div>
                    <div class="obs-name">${escapeHtml(obs.name)}</div>
                    <span class="obs-role-pill ${roleClass}">${obs.type}</span>
                </div>
            </div>
            <div>
                <button class="btn-toggle-sub ${obs.active ? 'active' : 'inactive'}" data-id="${obs.id}" data-active="${obs.active}">
                    ${obs.active ? '✕ Unsubscribe' : '✓ Re-subscribe'}
                </button>
            </div>
        `;

        // Event listener for toggle button
        const toggleBtn = item.querySelector('.btn-toggle-sub');
        toggleBtn.addEventListener('click', () => toggleSubscription(obs.id, obs.active, obs.name));

        observersListContainer.appendChild(item);
    });
}

// Render Notifications Feed
function renderNotifications(notifications) {
    notificationsFeed.innerHTML = '';

    const filtered = notifications.filter(n => {
        if (currentFilter === 'all') return true;
        return n.recipientType === currentFilter;
    });

    if (filtered.length === 0) {
        notificationsFeed.innerHTML = `
            <div class="empty-notifs">
                No notifications to display for the selected filter.
            </div>
        `;
        return;
    }

    filtered.forEach(notif => {
        const card = document.createElement('div');
        const isCustomer = notif.recipientType === 'Customer';
        card.className = `notif-card ${isCustomer ? '' : 'agent-card'}`;

        const icon = isCustomer ? '👤' : '🚚';

        card.innerHTML = `
            <div class="notif-icon">${icon}</div>
            <div class="notif-body">
                <div class="notif-header">
                    <span class="notif-recipient">${escapeHtml(notif.recipientName)} (${notif.recipientType})</span>
                    <span class="notif-time">${notif.timestamp}</span>
                </div>
                <div class="notif-text">
                    "${escapeHtml(notif.message)}"
                </div>
            </div>
        `;

        notificationsFeed.appendChild(card);
    });
}

// Change Status (Triggers Observer Notifications)
async function changeParcelStatus(newStatus) {
    if (localState.status === newStatus) {
        showToast(`Parcel is already marked as "${newStatus}"`);
        return;
    }

    if (isConnectedToServer) {
        try {
            const res = await fetch(`${API_BASE}/api/update-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const data = await res.json();
                localState = data.parcel;
                renderAll();
                const activeCount = data.newNotifications ? data.newNotifications.length : 0;
                showToast(`Status updated to "${newStatus}"! ${activeCount} observers automatically notified.`);
                return;
            }
        } catch (e) {
            console.error("Server error, using client mode", e);
        }
    }

    // Client fallback
    localState.status = newStatus;
    localState.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const count = clientNotify(newStatus);
    renderAll();
    showToast(`Status updated to "${newStatus}"! ${count} observers automatically notified.`);
}

// Client Fallback Observer Notification Generator
function clientNotify(newStatus) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const activeObservers = localState.observers.filter(o => o.active);

    activeObservers.forEach(obs => {
        let msg = obs.type === 'Customer'
            ? `Hello ${obs.name}! Your parcel ${localState.parcelId} is now: ${newStatus}`
            : `Agent ${obs.name}: Parcel ${localState.parcelId} status updated to: ${newStatus}`;

        localState.notifications.unshift({
            id: 'notif_' + Date.now() + Math.random(),
            recipientName: obs.name,
            recipientType: obs.type,
            status: newStatus,
            message: msg,
            timestamp: timestamp
        });
    });

    return activeObservers.length;
}

// Toggle Subscription (Unsubscribe or Re-subscribe)
async function toggleSubscription(obsId, currentlyActive, obsName) {
    const endpoint = currentlyActive ? '/api/unsubscribe' : '/api/resubscribe';

    if (isConnectedToServer) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: obsId })
            });

            if (res.ok) {
                const data = await res.json();
                localState = data.parcel;
                renderAll();
                showToast(currentlyActive 
                    ? `✕ ${obsName} unsubscribed. They will no longer receive alerts.` 
                    : `✓ ${obsName} re-subscribed to notifications!`
                );
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Client fallback
    const target = localState.observers.find(o => o.id === obsId);
    if (target) {
        target.active = !currentlyActive;
        renderAll();
        showToast(currentlyActive 
            ? `✕ ${obsName} unsubscribed. They will no longer receive alerts.` 
            : `✓ ${obsName} re-subscribed to notifications!`
        );
    }
}

// Add New Observer
async function handleAddObserver(e) {
    e.preventDefault();
    const name = obsNameInput.value.trim();
    const type = obsTypeInput.value;

    if (!name) return;

    if (isConnectedToServer) {
        try {
            const res = await fetch(`${API_BASE}/api/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type })
            });

            if (res.ok) {
                const data = await res.json();
                localState = data.parcel;
                obsNameInput.value = '';
                renderAll();
                showToast(`✓ Subscribed new ${type}: ${name}`);
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Client fallback
    localState.observers.push({
        id: 'obs_' + Date.now(),
        name: name,
        type: type,
        active: true,
        registeredAt: 'Just now'
    });
    obsNameInput.value = '';
    renderAll();
    showToast(`✓ Subscribed new ${type}: ${name}`);
}

// Reset Demo State
async function handleResetDemo() {
    if (isConnectedToServer) {
        try {
            const res = await fetch(`${API_BASE}/api/reset`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                localState = data.parcel;
                renderAll();
                showToast("System reset back to initial state (Packed).");
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Client fallback reset
    localState = {
        parcelId: "P101",
        sender: "Amazon Central Fulfillment - Mumbai Hub",
        destination: "Janvi Thakre, Pune Central, Maharashtra",
        status: "Packed",
        lastUpdated: "Just now",
        observers: [
            { id: "obs_1", name: "Rahul", type: "Customer", active: true, registeredAt: "09:00 AM" },
            { id: "obs_2", name: "Priya", type: "Customer", active: true, registeredAt: "09:15 AM" },
            { id: "obs_3", name: "Amit", type: "Delivery Agent", active: true, registeredAt: "09:30 AM" }
        ],
        notifications: []
    };
    clientNotify("Packed");
    renderAll();
    showToast("System reset back to initial state (Packed).");
}

// Show Toast Alert Notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🔔</span> <span>${escapeHtml(message)}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// Escape HTML helper
function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

// Event Listeners
statusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const newStatus = btn.dataset.status;
        changeParcelStatus(newStatus);
    });
});

filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.dataset.filter;
        renderNotifications(localState.notifications);
    });
});

addObserverForm.addEventListener('submit', handleAddObserver);
btnResetDemo.addEventListener('click', handleResetDemo);

// Start App
window.addEventListener('DOMContentLoaded', initApp);
