import { db } from './firebase-init.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Function to generate a random 8-digit unique code
// This is used as the membership code for lookup.
function generateUniqueCode() {
    // Generate a random number between 10000000 and 99999999
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Function to generate a simple username (Client-side)
function generateUsername(name) {
    const namePart = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomPart = Math.floor(Math.random() * 9000) + 1000; 
    return namePart + randomPart;
}

// Function to display messages in the custom box
function displayMessage(text, isSuccess) {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');

    if (messageBox && messageText) { 
        // Reset classes
        messageBox.classList.remove('hidden', 'opacity-0', 'bg-success', 'bg-error');
        messageBox.classList.add(isSuccess ? 'bg-success' : 'bg-error');
        messageText.textContent = text;
        
        // Show the box with a slight delay for transition
        setTimeout(() => messageBox.classList.remove('opacity-0'), 10);
        
        // Hide the box after 5 seconds
        setTimeout(() => messageBox.classList.add('hidden', 'opacity-0'), 5000);
    }
}


async function handleSubscription(event) {
    event.preventDefault(); 
    
    const form = event.target;
    const planInput = form.querySelector('input[name="plan"]:checked'); 
    const nameInput = form.querySelector('#name').value;
    const emailInput = form.querySelector('#email').value;

    // --- Local Validation Check ---
    if (!planInput || !nameInput || !emailInput) {
        displayMessage("Please fill in all required fields and select a plan.", false);
        return;
    }
    
    // Determine duration based on plan selection (assuming fixed durations)
    let durationDays = 30; // Default to 30 days
    if (planInput.value.includes('12 Days')) {
        durationDays = 12;
    } else if (planInput.value.includes('Monthly')) {
        durationDays = 30;
    } else if (planInput.value.includes('Yearly')) {
        durationDays = 365;
    }


    const subscriptionCode = generateUniqueCode();
    const username = generateUsername(nameInput);

    const newSubscription = {
        name: nameInput,
        email: emailInput,
        plan: planInput.value,
        code: subscriptionCode, // Numbers only for easy lookup
        username: username,
        date: new Date().toLocaleDateString('en-US'),
        startDate: Date.now(), // Store as a timestamp (number)
        duration: durationDays, // Stored as number of days
        isPaid: false // Default status
    };

    try {
        // --- 2. Store Data in Firestore ---
        // Adds a new document to the "subscriptions" collection
        const docRef = await addDoc(collection(db, "subscriptions"), newSubscription);
        
        // --- 3. Save the code and Doc ID locally for the success page ---
        localStorage.setItem('currentSubscriptionDocId', docRef.id);
        localStorage.setItem('currentSubscriptionCode', subscriptionCode);

        // --- 4. Redirect to success page ---
        window.location.href = `success.html`;
        
    } catch (e) {
        console.error("Error adding document: ", e);
        // Display user-friendly error
        displayMessage(`Error saving subscription: ${e.message}`, false);
    }
}

// Make handleSubscription available globally to the form's onsubmit attribute
window.handleSubscription = handleSubscription;