package com.parceltracker;

/**
 * ============================================================
 *  STANDALONE CONSOLE TEST (No Server Needed)
 * ============================================================
 * You can right-click and run this file directly in your IDE!
 */
public class Main {
    public static void main(String[] args) {
        // Create Subject
        Parcel parcel = new Parcel("P101", "Packed");

        // Create Observers
        Customer rahul = new Customer("Rahul");
        Customer priya = new Customer("Priya");
        DeliveryAgent amit = new DeliveryAgent("Amit");

        // Step 1: Subscribe observers
        parcel.registerObserver(rahul);
        parcel.registerObserver(priya);
        parcel.registerObserver(amit);

        // Step 2: Update status -> All 3 get notified automatically
        System.out.println("--- Status updated to Shipped ---");
        parcel.setStatus("Shipped");

        // Step 3: Priya unsubscribes
        System.out.println("\n--- Priya unsubscribes ---");
        parcel.removeObserver("Priya");

        // Step 4: Update status again -> Only Rahul and Amit get notified
        System.out.println("\n--- Status updated to Out for Delivery ---");
        parcel.setStatus("Out for Delivery");
    }
}
