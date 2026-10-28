import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

// Observer Interface
interface Observer {
    void update(String parcelId, String status);
    String getName();
}

// Concrete Observer 1
class Customer implements Observer {
    private String name;

    public Customer(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name + " (Customer)";
    }

    @Override
    public void update(String parcelId, String status) {
        System.out.println(">> [Customer Alert] Hello " + name + "! Your parcel " + parcelId + " is now: " + status);
    }
}

// Concrete Observer 2
class DeliveryAgent implements Observer {
    private String name;

    public DeliveryAgent(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name + " (Delivery Agent)";
    }

    @Override
    public void update(String parcelId, String status) {
        System.out.println(">> [Agent Alert] Agent " + name + ": Parcel " + parcelId + " status updated to: " + status);
    }
}

// Concrete Subject
class Parcel {
    private String parcelId;
    private String status;
    private List<Observer> observers = new ArrayList<>();

    public Parcel(String parcelId, String status) {
        this.parcelId = parcelId;
        this.status = status;
    }

    public void registerObserver(Observer o) {
        observers.add(o);
        System.out.println("Successfully subscribed: " + o.getName());
    }

    public void removeObserver(Observer o) {
        observers.remove(o);
        System.out.println("Successfully unsubscribed: " + o.getName());
    }

    public void notifyObservers() {
        if (observers.isEmpty()) {
            System.out.println("(No observers currently subscribed to receive notifications)");
            return;
        }
        for (Observer o : observers) {
            o.update(parcelId, status);
        }
    }

    public void setStatus(String newStatus) {
        if (!this.status.equalsIgnoreCase(newStatus)) {
            System.out.println("\n--- Status updated to: " + newStatus + " ---");
            this.status = newStatus;
            notifyObservers();
        } else {
            System.out.println("Status is already: " + newStatus);
        }
    }

    public String getStatus() {
        return status;
    }

    public String getParcelId() {
        return parcelId;
    }

    public List<Observer> getObservers() {
        return observers;
    }
}

// Interactive Main Class
public class InteractiveMain {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("=====================================================");
        System.out.println("   SMART PARCEL TRACKING - INTERACTIVE CONSOLE DEMO   ");
        System.out.println("=====================================================");

        // Step 1: Initialize Parcel
        System.out.print("Enter Parcel ID (e.g., P101): ");
        String parcelId = scanner.nextLine().trim();
        if (parcelId.isEmpty()) parcelId = "P101";

        System.out.print("Enter Initial Status (e.g., Packed): ");
        String initialStatus = scanner.nextLine().trim();
        if (initialStatus.isEmpty()) initialStatus = "Packed";

        Parcel parcel = new Parcel(parcelId, initialStatus);
        System.out.println("Parcel " + parcelId + " created with status: " + initialStatus);

        // Menu loop
        boolean running = true;
        while (running) {
            System.out.println("\n-----------------------------------------------------");
            System.out.println("Current Parcel: " + parcel.getParcelId() + " | Status: " + parcel.getStatus());
            System.out.println("Active Observers Count: " + parcel.getObservers().size());
            System.out.println("-----------------------------------------------------");
            System.out.println("1. Add Customer Observer (e.g., Rahul)");
            System.out.println("2. Add Delivery Agent Observer (e.g., Amit)");
            System.out.println("3. Update Parcel Status (Triggers Notifications)");
            System.out.println("4. Remove / Unsubscribe an Observer");
            System.out.println("5. View Current Observers List");
            System.out.println("6. Exit");
            System.out.print("Choose an option (1-6): ");

            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1":
                    System.out.print("Enter Customer Name: ");
                    String custName = scanner.nextLine().trim();
                    if (!custName.isEmpty()) {
                        parcel.registerObserver(new Customer(custName));
                    }
                    break;

                case "2":
                    System.out.print("Enter Delivery Agent Name: ");
                    String agentName = scanner.nextLine().trim();
                    if (!agentName.isEmpty()) {
                        parcel.registerObserver(new DeliveryAgent(agentName));
                    }
                    break;

                case "3":
                    System.out.println("\nSelect or type new status:");
                    System.out.println("  1. Packed");
                    System.out.println("  2. Shipped");
                    System.out.println("  3. Out for Delivery");
                    System.out.println("  4. Delivered");
                    System.out.print("Enter status (or choose 1-4): ");
                    String statusInput = scanner.nextLine().trim();

                    if (statusInput.equals("1")) statusInput = "Packed";
                    else if (statusInput.equals("2")) statusInput = "Shipped";
                    else if (statusInput.equals("3")) statusInput = "Out for Delivery";
                    else if (statusInput.equals("4")) statusInput = "Delivered";

                    if (!statusInput.isEmpty()) {
                        parcel.setStatus(statusInput);
                    }
                    break;

                case "4":
                    List<Observer> observers = parcel.getObservers();
                    if (observers.isEmpty()) {
                        System.out.println("No observers to remove!");
                        break;
                    }
                    System.out.println("\nSelect observer to remove:");
                    for (int i = 0; i < observers.size(); i++) {
                        System.out.println("  " + (i + 1) + ". " + observers.get(i).getName());
                    }
                    System.out.print("Enter number (1-" + observers.size() + "): ");
                    try {
                        int indexToRemove = Integer.parseInt(scanner.nextLine().trim()) - 1;
                        if (indexToRemove >= 0 && indexToRemove < observers.size()) {
                            parcel.removeObserver(observers.get(indexToRemove));
                        } else {
                            System.out.println("Invalid selection!");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("Please enter a valid number.");
                    }
                    break;

                case "5":
                    System.out.println("\n--- Current Subscribed Observers ---");
                    List<Observer> currentObs = parcel.getObservers();
                    if (currentObs.isEmpty()) {
                        System.out.println("(None)");
                    } else {
                        for (int i = 0; i < currentObs.size(); i++) {
                            System.out.println((i + 1) + ". " + currentObs.get(i).getName());
                        }
                    }
                    break;

                case "6":
                    running = false;
                    System.out.println("Exiting Smart Parcel Tracker. Thank you!");
                    break;

                default:
                    System.out.println("Invalid option! Please enter 1 to 6.");
            }
        }

        scanner.close();
    }
}
