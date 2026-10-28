package com.parceltracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

// ==========================================================
// 1. OBSERVER INTERFACE (Only Interface)
// ==========================================================
interface Observer {
    void update(String parcelId, String status);
    String getName();
}

// ==========================================================
// 2. CONCRETE OBSERVER 1: CUSTOMER
// ==========================================================
class Customer implements Observer {
    private String name;

    public Customer(String name) {
        this.name = name;
    }

    @Override
    public void update(String parcelId, String status) {
        String msg = "Hello " + name + "! Your parcel " + parcelId + " is now: " + status;
        System.out.println("[CUSTOMER] " + msg);
        // Also save to global notification feed for the website
        SmartParcelTrackerApplication.addNotification(parcelId, "👤 " + msg);
    }

    @Override
    public String getName() {
        return name;
    }
}

// ==========================================================
// 3. CONCRETE OBSERVER 2: DELIVERY AGENT
// ==========================================================
class DeliveryAgent implements Observer {
    private String name;

    public DeliveryAgent(String name) {
        this.name = name;
    }

    @Override
    public void update(String parcelId, String status) {
        String msg = "Agent " + name + ": Parcel " + parcelId + " status updated to: " + status;
        System.out.println("[AGENT] " + msg);
        // Also save to global notification feed for the website
        SmartParcelTrackerApplication.addNotification(parcelId, "🚚 " + msg);
    }

    @Override
    public String getName() {
        return name;
    }
}

// ==========================================================
// 4. CONCRETE SUBJECT: PARCEL (No Subject Interface!)
// ==========================================================
class Parcel {
    private String parcelId;
    private String status;
    private List<Observer> observers = new ArrayList<>();

    public Parcel(String parcelId, String status) {
        this.parcelId = parcelId;
        this.status = status;
    }

    public void registerObserver(Observer o) {
        // Prevent duplicate subscriptions for same name
        for (Observer existing : observers) {
            if (existing.getName().equalsIgnoreCase(o.getName())) {
                return;
            }
        }
        observers.add(o);
    }

    public void removeObserver(String name) {
        observers.removeIf(o -> o.getName().equalsIgnoreCase(name));
    }

    public void notifyObservers() {
        for (Observer o : observers) {
            o.update(parcelId, status);
        }
    }

    // Changing status triggers notifyObservers automatically!
    public void setStatus(String newStatus) {
        if (!this.status.equals(newStatus)) {
            this.status = newStatus;
            notifyObservers();
        }
    }

    // Simple getters for web display
    public String getParcelId() { return parcelId; }
    public String getStatus() { return status; }
    public int getObserverCount() { return observers.size(); }
    public List<String> getObserverNames() {
        List<String> names = new ArrayList<>();
        for (Observer o : observers) names.add(o.getName());
        return names;
    }
}

// ==========================================================
// 5. SPRING BOOT APPLICATION + REST API CONTROLLER
// ==========================================================
@SpringBootApplication
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/parcels")
public class SmartParcelTrackerApplication {

    // In-memory parcel storage
    public static Map<String, Parcel> parcelDB = new HashMap<>();

    // In-memory notification storage per parcel
    public static Map<String, List<String>> notificationsDB = new HashMap<>();

    public static void addNotification(String parcelId, String msg) {
        notificationsDB.computeIfAbsent(parcelId.toUpperCase(), k -> new ArrayList<>()).add(msg);
    }

    public static void main(String[] args) {
        // Initialize Sample Data
        Parcel p101 = new Parcel("P101", "Packed");
        Parcel p102 = new Parcel("P102", "Shipped");
        Parcel p103 = new Parcel("P103", "Out for Delivery");

        // Initial sample subscribers
        p101.registerObserver(new Customer("Rahul"));
        p101.registerObserver(new Customer("Priya"));
        p101.registerObserver(new DeliveryAgent("Amit"));

        parcelDB.put("P101", p101);
        parcelDB.put("P102", p102);
        parcelDB.put("P103", p103);

        notificationsDB.put("P101", new ArrayList<>());
        notificationsDB.put("P102", new ArrayList<>());
        notificationsDB.put("P103", new ArrayList<>());

        SpringApplication.run(SmartParcelTrackerApplication.class, args);
        System.out.println("\n>>> Server is running at: http://localhost:8080 <<<\n");
    }

    // --- Web Endpoints ---

    // 1. Get all parcels (for Admin table)
    @GetMapping
    public List<Map<String, Object>> getAllParcels() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Parcel p : parcelDB.values()) {
            list.add(Map.of(
                "parcelId", p.getParcelId(),
                "status", p.getStatus(),
                "observerCount", p.getObserverCount(),
                "observers", p.getObserverNames()
            ));
        }
        return list;
    }

    // 2. Track single parcel
    @GetMapping("/{id}")
    public ResponseEntity<?> getParcel(@PathVariable String id) {
        Parcel p = parcelDB.get(id.toUpperCase());
        if (p == null) return ResponseEntity.status(404).body(Map.of("error", "Parcel not found"));
        return ResponseEntity.ok(Map.of(
            "parcelId", p.getParcelId(),
            "status", p.getStatus(),
            "observerCount", p.getObserverCount(),
            "observers", p.getObserverNames()
        ));
    }

    // 3. Update status (Triggers Observer pattern!)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Parcel p = parcelDB.get(id.toUpperCase());
        if (p == null) return ResponseEntity.status(404).body(Map.of("error", "Parcel not found"));

        String newStatus = body.get("status");
        p.setStatus(newStatus); // This invokes notifyObservers() automatically!

        return ResponseEntity.ok(Map.of(
            "message", "Status updated to " + newStatus,
            "status", p.getStatus(),
            "notifiedCount", p.getObserverCount()
        ));
    }

    // 4. Subscribe (Customer or Delivery Agent)
    @PostMapping("/{id}/subscribe")
    public ResponseEntity<?> subscribe(@PathVariable String id, @RequestBody Map<String, String> body) {
        Parcel p = parcelDB.get(id.toUpperCase());
        if (p == null) return ResponseEntity.status(404).body(Map.of("error", "Parcel not found"));

        String name = body.get("name");
        String type = body.getOrDefault("type", "customer");

        if ("agent".equalsIgnoreCase(type)) {
            p.registerObserver(new DeliveryAgent(name));
        } else {
            p.registerObserver(new Customer(name));
        }

        return ResponseEntity.ok(Map.of("message", name + " subscribed successfully to " + id.toUpperCase()));
    }

    // 5. Unsubscribe
    @DeleteMapping("/{id}/unsubscribe")
    public ResponseEntity<?> unsubscribe(@PathVariable String id, @RequestBody Map<String, String> body) {
        Parcel p = parcelDB.get(id.toUpperCase());
        if (p == null) return ResponseEntity.status(404).body(Map.of("error", "Parcel not found"));

        String name = body.get("name");
        p.removeObserver(name);

        return ResponseEntity.ok(Map.of("message", name + " unsubscribed from " + id.toUpperCase()));
    }

    // 6. Get notifications for Customer Dashboard
    @GetMapping("/{id}/notifications")
    public List<String> getNotifications(@PathVariable String id) {
        return notificationsDB.getOrDefault(id.toUpperCase(), Collections.emptyList());
    }

    // 7. Create new parcel
    @PostMapping
    public ResponseEntity<?> createParcel(@RequestBody Map<String, String> body) {
        String id = body.get("parcelId").toUpperCase();
        if (parcelDB.containsKey(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Parcel already exists"));
        }
        Parcel p = new Parcel(id, "Packed");
        parcelDB.put(id, p);
        notificationsDB.put(id, new ArrayList<>());
        return ResponseEntity.ok(Map.of("message", "Parcel " + id + " created", "parcelId", id));
    }
}
