import java.util.ArrayList;
import java.util.List;

// Observer Interface
interface Observer {
    void update(String parcelId, String status);
}

// Concrete Observer 1
class Customer implements Observer {
    private String name;

    public Customer(String name) {
        this.name = name;
    }

    @Override
    public void update(String parcelId, String status) {
        System.out.println("Hello " + name + "! Your parcel " + parcelId + " is now: " + status);
    }
}

// Concrete Observer 2
class DeliveryAgent implements Observer {
    private String name;

    public DeliveryAgent(String name) {
        this.name = name;
    }

    @Override
    public void update(String parcelId, String status) {
        System.out.println("Agent " + name + ": Parcel " + parcelId + " status updated to: " + status);
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
    }

    public void removeObserver(Observer o) {
        observers.remove(o);
    }

    public void notifyObservers() {
        for (Observer o : observers) {
            o.update(parcelId, status);
        }
    }

    public void setStatus(String newStatus) {
        if (!this.status.equals(newStatus)) {
            this.status = newStatus;
            notifyObservers();
        }
    }
}

// Main Class
public class Main {
    public static void main(String[] args) {

        Parcel parcel = new Parcel("P101", "Packed");

        Customer rahul = new Customer("Rahul");
        Customer priya = new Customer("Priya");
        DeliveryAgent amit = new DeliveryAgent("Amit");

        parcel.registerObserver(rahul);
        parcel.registerObserver(priya);
        parcel.registerObserver(amit);

        System.out.println("--- Status updated to Shipped ---");
        parcel.setStatus("Shipped");

        System.out.println("\n--- Priya unsubscribes ---");
        parcel.removeObserver(priya);

        System.out.println("\n--- Status updated to Out for Delivery ---");
        parcel.setStatus("Out for Delivery");
    }
}
