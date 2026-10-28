# Smart Parcel Tracking and Notification System

A college mini project demonstrating the **Observer Design Pattern** in Java with a Spring Boot backend and an interactive HTML/CSS/JavaScript web frontend.

---

## 📌 1. Project Overview

The **Smart Parcel Tracking and Notification System** demonstrates how the **Observer Design Pattern** enables loose coupling between a state-changing entity (the `Parcel`, acting as the **Subject**) and multiple interested parties (`Customer` and `DeliveryAgent`, acting as **Observers**).

When an administrator updates a parcel's status (e.g. from `Packed` to `Shipped`), all subscribed observers are automatically notified with tailored messages—without the Parcel having to know the concrete implementation details of its observers.

---

## 🛠️ 2. Technologies Used

- **Backend**: Java 17+, Spring Boot 3.2.0 (Spring Web, Spring Test)
- **Design Pattern**: Observer Design Pattern (manual implementation)
- **Data Storage**: In-Memory Java Collections (`HashMap`, `ArrayList`)
- **Frontend**: HTML5, Modern CSS3 (Flexbox/Grid, Responsive), Vanilla JavaScript (Fetch API)
- **Build Tool**: Maven

---

## 📐 3. Observer Design Pattern Mapping

| Pattern Component | Project Class / Interface | Role & Responsibility |
| :--- | :--- | :--- |
| **Subject Interface** | [`ParcelSubject`](src/main/java/com/parceltracker/observer/ParcelSubject.java) | Declares methods: `registerObserver()`, `removeObserver()`, `notifyObservers()` |
| **Concrete Subject** | [`Parcel`](src/main/java/com/parceltracker/model/Parcel.java) | Maintains list of observers (`List<ParcelObserver>`), manages status, and invokes `notifyObservers()` inside `setStatus()` |
| **Observer Interface** | [`ParcelObserver`](src/main/java/com/parceltracker/observer/ParcelObserver.java) | Declares `update(parcelId, status)` callback and identity methods |
| **Concrete Observer #1** | [`Customer`](src/main/java/com/parceltracker/observer/Customer.java) | Implements `update()` to store customer-friendly notification history |
| **Concrete Observer #2** | [`DeliveryAgent`](src/main/java/com/parceltracker/observer/DeliveryAgent.java) | Implements `update()` to store action-oriented notifications for field agents |

---

## 🚀 4. How to Run the Project

### Prerequisites
- **Java Development Kit (JDK 17 or higher)** installed.
- **Maven** installed (or use your IDE's bundled Maven).

### Option A: Running from an IDE (IntelliJ IDEA / Eclipse / VS Code)
1. Open IntelliJ IDEA or VS Code.
2. Select **Open Project** and navigate to `smart-parcel-tracker` (where `pom.xml` is located).
3. Wait for Maven to sync dependencies.
4. **To test pure Java Observer Pattern (Console Demo)**:
   - Navigate to [`src/main/java/com/parceltracker/Main.java`](src/main/java/com/parceltracker/Main.java).
   - Right-click and choose **Run 'Main.main()'**.
5. **To run the full Web Application**:
   - Navigate to [`src/main/java/com/parceltracker/SmartParcelTrackerApplication.java`](src/main/java/com/parceltracker/SmartParcelTrackerApplication.java).
   - Right-click and select **Run 'SmartParcelTrackerApplication'**.
6. Open your web browser and navigate to:
   ```
   http://localhost:8080
   ```

### Option B: Running via Maven Command Line
In PowerShell / Command Prompt inside the `smart-parcel-tracker` folder:
```bash
# Run tests
mvn test

# Start the Spring Boot Web Server
mvn spring-boot:run
```
Once started, visit: `http://localhost:8080`

---

## 🧪 5. Testing the 10-Step Demonstration Scenario

1. **Open the Website**: Go to `http://localhost:8080`.
2. **Page 1 (Track Parcel)**:
   - Enter `P101` and click **Track**. Observe status is `Packed`.
3. **Page 2 (Customer Dashboard)**:
   - Pre-loaded observers: Rahul, Priya, and Agent Amit are already subscribed to `P101`.
   - Select `Parcel P101` from the dropdown under **Notification History**.
4. **Page 3 (Admin Dashboard)**:
   - Select `P101`.
   - Choose new status: **Shipped** and click **Save Status & Notify Observers**.
5. **Verify Notification Flow**:
   - Switch back to **Customer Dashboard**. You will see:
     - `[Customer Notification] Hello Rahul! Your parcel P101 has been updated to: Shipped`
     - `[Customer Notification] Hello Priya! Your parcel P101 has been updated to: Shipped`
     - `[Agent Notification] Agent Amit: Action required! Parcel P101 status changed to: Shipped`
6. **Test Unsubscribe**:
   - In Customer Dashboard, enter Parcel ID `P101` and Observer ID `cust_priya_P101`, then click **Unsubscribe**.
7. **Change Status Again in Admin**:
   - Set status to **Out for Delivery** and save.
8. **Verify Exclusion**:
   - Rahul and Amit receive the new notification. Priya receives **no** further notifications!

> **Note**: Restarting the server resets all in-memory data back to the default initial sample state.
