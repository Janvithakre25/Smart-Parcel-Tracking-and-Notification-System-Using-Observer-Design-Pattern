# Smart Parcel Tracking and Notification System Using Observer Design Pattern in Java

A college mini project demonstrating the **Observer Design Pattern** in pure, unedited Java with a modern **blue-and-white** web dashboard and an external launcher integration layer.

---

## 📌 1. Project Overview & Code Integrity Guarantee

### Strict Requirement Compliance
- **Zero Modifications to Java**: The student's original Java code in [`Main.java`](Main.java) is **100% UNCHANGED**.
- **No Extra Methods**: No getters, setters, controllers, or helper methods were added.
- **No Spring Boot / No Database**: Pure Java SE standard library (`java.util.ArrayList`, `java.util.List`).
- **Real Integration Layer**: An external launcher (`server.js`) compiles and executes the unedited `Main.java` on the JVM and streams its verbatim standard output directly into the web dashboard.
- **Academic Transparency**: Clearly distinguishes between **Actual Java-Backed JVM Execution** and the **Interactive Visual Stepper (Client-Side Simulation)**.

---

## 📐 2. Observer Design Pattern Mapping

| Pattern Participant | Java Component in `Main.java` | Role & Responsibility |
| :--- | :--- | :--- |
| **Observer Interface** | `interface Observer` | Declares the notification contract: `void update(String parcelId, String status)`. |
| **Concrete Observer 1** | `class Customer` | Implements `update()` to print customer-tailored status alerts: `"Hello <name>! Your parcel <id> is now: <status>"`. |
| **Concrete Observer 2** | `class DeliveryAgent` | Implements `update()` to print courier-tailored status alerts: `"Agent <name>: Parcel <id> status updated to: <status>"`. |
| **Concrete Subject** | `class Parcel` | Maintains internal state (`parcelId`, `status`) and observer registry (`List<Observer> observers`). Exposes `registerObserver()`, `removeObserver()`, `notifyObservers()`, and `setStatus()`. |
| **Client / Driver** | `public class Main` | Instantiates `Parcel("P101", "Packed")`, registers `Rahul`, `Priya`, and `Amit`, changes status to `Shipped`, unsubscribes `Priya`, and updates status to `Out for Delivery`. |

---

## 🚀 3. How to Run the Project

### Option A: 1-Click Launch (Web Dashboard + Java Integration Server)

1. Open PowerShell or Command Prompt in this folder (`DP`):
   ```bash
   node server.js
   ```
   *(Or simply double-click **`run.bat`**)*

2. Open your web browser at:
   ```
   http://localhost:3000
   ```

3. Click **"Run Original Java Program"** to trigger live compilation (`javac Main.java`) and JVM execution (`java Main`) with real-time output and execution metrics!

---

### Option B: Pure Java Console Execution (No Web Server Needed)

You can compile and run `Main.java` directly in any standard Java environment:

```bash
# Compile
javac Main.java

# Run
java Main
```

*(Or simply double-click **`run_java_only.bat`**)*

#### Expected Exact Console Output:
```text
--- Status updated to Shipped ---
Hello Rahul! Your parcel P101 is now: Shipped
Hello Priya! Your parcel P101 is now: Shipped
Agent Amit: Parcel P101 status updated to: Shipped

--- Priya unsubscribes ---

--- Status updated to Out for Delivery ---
Hello Rahul! Your parcel P101 is now: Out for Delivery
Agent Amit: Parcel P101 status updated to: Out for Delivery
```

---

## ⚠️ 4. System Limitations & Academic Architecture Explanation

### Question: *Why can't the website interactively change parcel status inside Java without modifying the Java code?*

1. **JVM Process Lifecycle**:
   - `Main.java` is a standard, standalone console application (`public static void main(String[] args)`).
   - When launched, the JVM executes the sequential statements in `main()`, prints the output to `System.out`, and terminates (Exit Code 0).
   - It does not stay alive waiting for incoming network requests.

2. **Strict Non-Modification Constraint**:
   - To make the Java program dynamically listen for button clicks from a web browser, we would have to modify `Main.java` to include a socket listener, an HTTP server, or Spring Web controllers, and add public setters/getters.
   - Because the project rules strictly forbid adding any methods, controllers, or changing existing statements, **modifying the Java code was deliberately rejected**.

3. **How This Project Solves It Transparently**:
   - **Authentic Execution**: The website includes an **External Launcher** that runs the real `Main.java` via the operating system process layer and captures authentic stdout.
   - **Visual Educational Stepper**: The website provides a separate, clearly labeled interactive visual stepper (client-side simulation) to help visualize runtime observer interactions during viva presentations without modifying the immutable Java source code.

---

## 🎓 5. College Viva Defense Notes

1. **What is Loose Coupling?**
   - The Subject (`Parcel`) only knows about the abstract `Observer` interface. It does not know or care whether an observer is a `Customer`, a `DeliveryAgent`, or a future `SmsAlertService`.

2. **What is the Open-Closed Principle (OCP)?**
   - Open for extension, closed for modification. New types of observers can be added without altering the `Parcel` class.

3. **Why did Priya stop receiving notifications?**
   - In `Main.java`, `parcel.removeObserver(priya)` removed her instance from `List<Observer> observers`. When `setStatus("Out for Delivery")` was subsequently invoked, `notifyObservers()` only iterated through the remaining elements (`Rahul` and `Amit`).
