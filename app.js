/**
 * SmartParcel Express - Client Application Controller
 * Multi-Parcel Real-time Tracking & Observer Pattern System
 */

// Local state with multiple parcels (supports both server-backed and offline client mode)
let parcelsData = {
    "P101": {
        parcelId: "P101",
        recipient: "Rahul Sharma",
        sender: "Amazon Central Hub (Mumbai)",
        destination: "Andheri West, Mumbai",
        status: "Packed",
        lastUpdated: "Just now",
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
        lastUpdated: "Just now",
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
        lastUpdated: "Just now",
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
let isConnectedToServer = false;
const API_BASE = window.location.origin.includes('http') ? window.location.origin : 'http://localhost:3000';

// DOM Elements
const parcelDropdown = document.getElementById('parcelDropdown');
const statRecipientPill = document.getElementById('statRecipientPill');
const statCityPill = document.getElementById('statCityPill');

const displayParcelId = document.getElementById('displayParcelId');
const displayRecipientName = document.getElementById('displayRecipientName');
const displaySenderText = document.getElementById('displaySenderText');
const displayDestinationText = document.getElementById('displayDestinationText');
const currentStatusBadge = document.getElementById('currentStatusBadge');
const lastUpdatedText = document.getElementById('lastUpdatedText');
const timelineBarFill = document.getElementById('timelineBarFill');
const actionParcelIdText = document.getElementById('actionParcelIdText');

const statusButtons = document.querySelectorAll('.status-action-btn');
const observersListContainer = document.getElementById('observersListContainer');
const activeSubCount = document.getElementById('activeSubCount');
const notificationsFeed = document.getElementById('notificationsFeed');
const addObserverForm = document.getElementById('addObserverForm');
const obsNameInput = document.getElementById('obsNameInput');
const obsTypeInput = document.getElementById('obsTypeInput');
const filterPills = document.querySelectorAll('.filter-pill');

// Modal Elements
const btnOpenNewParcelModal = document.getElementById('btnOpenNewParcelModal');
const newParcelModal = document.getElementById('newParcelModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');
const createParcelForm = document.getElementById('createParcelForm');
const toastContainer = document.getElementById('toastContainer');

const STAGE_CONFIG = {
    "Packed": { index: 0, progress: 10, node: "node-Packed" },
    "Shipped": { index: 1, progress: 40, node: "node-Shipped" },
    "Out for Delivery": { index: 2, progress: 75, node: "node-Out-for-Delivery" },
    "Delivered": { index: 3, progress: 100, node: "node-Delivered" }
};

let currentFilter = 'all';

// Initialize
async function initApp() {
    try {
        const response = await fetch(`${API_BASE}/api/parcels`);
        if (response.ok) {
            const data = await response.json();
            isConnectedToServer = true;
            parcelsData = {};
            data.parcels.forEach(p => { parcelsData[p.parcelId] = p; });
            activeParcelId = data.activeParcelId || "P101";
        }
    } catch (e) {
        console.log("Using client offline database");
    }

    populateDropdown();
    renderActiveParcel();
}

// Populate Parcel Dropdown
function populateDropdown() {
    parcelDropdown.innerHTML = '';
    Object.values(parcelsData).forEach(p => {
        const option = document.createElement('option');
        option.value = p.parcelId;
        option.innerText = `#${p.parcelId} — ${p.recipient} (${p.destination.split(',').pop().trim()})`;
        if (p.parcelId === activeParcelId) {
            option.selected = true;
        }
        parcelDropdown.appendChild(option);
    });
}

// Render Currently Selected Parcel
function renderActiveParcel() {
    const parcel = parcelsData[activeParcelId];
    if (!parcel) return;

    // Header & Hero info
    displayParcelId.innerText = `#${parcel.parcelId}`;
    displayRecipientName.innerText = parcel.recipient;
    displaySenderText.innerText = `📍 ${parcel.sender}`;
    displayDestinationText.innerText = `🏠 ${parcel.destination}`;
    currentStatusBadge.innerText = parcel.status;
    lastUpdatedText.innerText = `Updated: ${parcel.lastUpdated || 'Just now'}`;
    actionParcelIdText.innerText = `Parcel #${parcel.parcelId}`;

    // Quick Stats
    statRecipientPill.innerText = `Recipient: ${parcel.recipient}`;
    statCityPill.innerText = `Route: ${parcel.destination.split(',').pop().trim()}`;

    // Update 4-Stage Timeline
    const config = STAGE_CONFIG[parcel.status] || STAGE_CONFIG["Packed"];
    timelineBarFill.style.width = `${config.progress}%`;

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

    // Update Dispatch Buttons
    statusButtons.forEach(btn => {
        if (btn.dataset.status === parcel.status) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Render Subscribed Observers
    renderObservers(parcel.observers || []);

    // Render Notifications Feed
    renderNotifications(parcel.notifications || []);
}

// Render Subscribed Observers
function renderObservers(observers) {
    observersListContainer.innerHTML = '';
    const activeCount = observers.filter(o => o.active).length;
    activeSubCount.innerText = `${activeCount} Active`;

    if (observers.length === 0) {
        observersListContainer.innerHTML = `<div class="empty-notifs">No observers registered yet.</div>`;
        return;
    }

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
                <button class="btn-toggle-sub ${obs.active ? 'active' : 'inactive'}" data-id="${obs.id}">
                    ${obs.active ? '✕ Unsubscribe' : '✓ Re-subscribe'}
                </button>
            </div>
        `;

        const toggleBtn = item.querySelector('.btn-toggle-sub');
        toggleBtn.addEventListener('click', () => toggleSubscription(obs.id, obs.active, obs.name));

        observersListContainer.appendChild(item);
    });
}

// Render Notifications
function renderNotifications(notifications) {
    notificationsFeed.innerHTML = '';

    const filtered = notifications.filter(n => {
        if (currentFilter === 'all') return true;
        return n.recipientType === currentFilter;
    });

    if (filtered.length === 0) {
        notificationsFeed.innerHTML = `
            <div class="empty-notifs">
                No notifications logged for Parcel #${activeParcelId} in this filter.
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
    const parcel = parcelsData[activeParcelId];
    if (!parcel) return;

    if (parcel.status === newStatus) {
        showToast(`Parcel #${parcel.parcelId} is already "${newStatus}"`);
        return;
    }

    if (isConnectedToServer) {
        try {
            const res = await fetch(`${API_BASE}/api/update-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parcelId: activeParcelId, status: newStatus })
            });

            if (res.ok) {
                const data = await res.json();
                parcelsData[activeParcelId] = data.parcel;
                renderActiveParcel();
                const count = data.newNotifications ? data.newNotifications.length : 0;
                showToast(`Parcel #${activeParcelId} status updated to "${newStatus}"! ${count} observers notified.`);
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Client fallback
    parcel.status = newStatus;
    parcel.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const activeObservers = parcel.observers.filter(o => o.active);

    activeObservers.forEach(obs => {
        const msg = obs.type === 'Customer'
            ? `Hello ${obs.name}! Your parcel ${parcel.parcelId} is now: ${newStatus}`
            : `Agent ${obs.name}: Parcel ${parcel.parcelId} status updated to: ${newStatus}`;

        parcel.notifications.unshift({
            id: 'notif_' + Date.now() + Math.random(),
            recipientName: obs.name,
            recipientType: obs.type,
            parcelId: parcel.parcelId,
            status: newStatus,
            message: msg,
            timestamp: timestamp
        });
    });

    renderActiveParcel();
    showToast(`Parcel #${activeParcelId} status updated to "${newStatus}"! ${activeObservers.length} observers notified.`);
}

// Toggle Subscription
async function toggleSubscription(obsId, currentlyActive, obsName) {
    const endpoint = currentlyActive ? '/api/unsubscribe' : '/api/resubscribe';

    if (isConnectedToServer) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parcelId: activeParcelId, id: obsId })
            });

            if (res.ok) {
                const data = await res.json();
                parcelsData[activeParcelId] = data.parcel;
                renderActiveParcel();
                showToast(currentlyActive 
                    ? `✕ ${obsName} unsubscribed from Parcel #${activeParcelId}` 
                    : `✓ ${obsName} re-subscribed to Parcel #${activeParcelId}!`
                );
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Client fallback
    const parcel = parcelsData[activeParcelId];
    const target = parcel.observers.find(o => o.id === obsId);
    if (target) {
        target.active = !currentlyActive;
        renderActiveParcel();
        showToast(currentlyActive 
            ? `✕ ${obsName} unsubscribed from Parcel #${activeParcelId}` 
            : `✓ ${obsName} re-subscribed to Parcel #${activeParcelId}!`
        );
    }
}

// Add New Observer to Active Parcel
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
                body: JSON.stringify({ parcelId: activeParcelId, name, type })
            });

            if (res.ok) {
                const data = await res.json();
                parcelsData[activeParcelId] = data.parcel;
                obsNameInput.value = '';
                renderActiveParcel();
                showToast(`✓ Subscribed ${type} "${name}" to Parcel #${activeParcelId}`);
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Client fallback
    const parcel = parcelsData[activeParcelId];
    parcel.observers.push({
        id: 'obs_' + Date.now(),
        name: name,
        type: type,
        active: true,
        registeredAt: 'Just now'
    });
    obsNameInput.value = '';
    renderActiveParcel();
    showToast(`✓ Subscribed ${type} "${name}" to Parcel #${activeParcelId}`);
}

// Create New Consignment / Parcel
async function handleCreateParcel(e) {
    e.preventDefault();
    const id = document.getElementById('newParcelId').value.trim().toUpperCase();
    const recipient = document.getElementById('newRecipientName').value.trim();
    const sender = document.getElementById('newSender').value.trim() || 'Central Dispatch Hub';
    const destination = document.getElementById('newDestination').value.trim();

    if (!id || !recipient) return;

    if (parcelsData[id]) {
        alert(`Parcel #${id} already exists! Please choose another ID.`);
        return;
    }

    if (isConnectedToServer) {
        try {
            const res = await fetch(`${API_BASE}/api/parcel/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parcelId: id, recipient, sender, destination })
            });

            if (res.ok) {
                const data = await res.json();
                parcelsData[id] = data.parcel;
                activeParcelId = id;
                closeModal();
                populateDropdown();
                renderActiveParcel();
                showToast(`✓ Consignment #${id} created for ${recipient}!`);
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Client fallback
    const newParcel = {
        parcelId: id,
        recipient: recipient,
        sender: sender,
        destination: destination,
        status: "Packed",
        lastUpdated: "Just now",
        observers: [
            { id: "obs_" + Date.now(), name: recipient, type: "Customer", active: true, registeredAt: "Just now" },
            { id: "obs_" + (Date.now() + 1), name: "Agent Assigned", type: "Delivery Agent", active: true, registeredAt: "Just now" }
        ],
        notifications: [
            {
                id: "notif_" + Date.now(),
                recipientName: recipient,
                recipientType: "Customer",
                parcelId: id,
                status: "Packed",
                message: `Hello ${recipient}! Your parcel ${id} is now: Packed`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]
    };

    parcelsData[id] = newParcel;
    activeParcelId = id;
    closeModal();
    populateDropdown();
    renderActiveParcel();
    showToast(`✓ Consignment #${id} created for ${recipient}!`);
}

// Modal Helpers
function openModal() {
    newParcelModal.classList.add('open');
    document.getElementById('newParcelId').value = `P${Math.floor(100 + Math.random() * 900)}`;
    document.getElementById('newRecipientName').value = '';
    document.getElementById('newDestination').value = '';
}

function closeModal() {
    newParcelModal.classList.remove('open');
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

// Event Listeners
parcelDropdown.addEventListener('change', (e) => {
    activeParcelId = e.target.value;
    renderActiveParcel();
});

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
        const parcel = parcelsData[activeParcelId];
        renderNotifications(parcel ? parcel.notifications : []);
    });
});

addObserverForm.addEventListener('submit', handleAddObserver);

btnOpenNewParcelModal.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
btnCancelModal.addEventListener('click', closeModal);
createParcelForm.addEventListener('submit', handleCreateParcel);

window.addEventListener('DOMContentLoaded', initApp);
