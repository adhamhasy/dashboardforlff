// pos-print.js
// This module handles the hardware connection and raw printing commands (ESC/POS).
// It relies on the QZ Tray library being loaded in dashboard.html.

// --- ESC/POS COMMANDS ---
// These are common raw byte sequences for thermal printers.
// Cash Drawer Kick: ESC p 0 50 50 (Hex: 1B 70 00 32 32)
const ESC_POS_KICK_DRAWER = [27, 112, 0, 50, 50]; 
// Full Cut: GS V A 0 (Hex: 1D 56 41 00)
const ESC_POS_FULL_CUT = [29, 86, 65, 0]; 

/**
 * Generates the raw receipt content in a basic text format.
 * This function calculates the amount based on the plan.
 * @param {Object} member - The subscription data object.
 * @param {string} docId - The Firestore document ID.
 * @returns {string} - The formatted receipt text.
 */
export function generateReceiptContent(member, docId) {
    // Determine the price based on the plan name
    let totalAmount = 'N/A';
    if (member.plan.includes('30 Days')) {
        totalAmount = '1200';
    } else if (member.plan.includes('12 Days')) {
        totalAmount = '800';
    }
    
    // The payment type is assumed to be CASH when using the Mark Paid button for the kick drawer action
    const paymentType = 'CASH'; 

    let content = [
        '        LET\'S GO GYM',
        '      Official Receipt',
        '--------------------------------',
        `Date: ${new Date().toLocaleDateString('en-US')}`,
        `Time: ${new Date().toLocaleTimeString('en-US')}`,
        `Transaction ID: ${docId.substring(0, 8)}`,
        '--------------------------------',
        `Member: ${member.name}`,
        `User ID: ${member.username}`,
        `Code: ${member.code}`,
        '--------------------------------',
        `PLAN: ${member.plan}`,
        `AMOUNT: EGP ${totalAmount}.00`,
        `PAYMENT: ${paymentType}`,
        '--------------------------------',
        '       THANK YOU!',
        '--------------------------------\n\n\n\n' // Extra line breaks for paper feed before cut
    ].join('\n');
    
    return content;
}

/**
 * Connects to QZ Tray and prints the raw receipt data.
 * This also triggers the cash drawer kick.
 * @param {string} receiptData - The formatted text receipt content.
 * @returns {Promise<boolean>} - True if print command was sent successfully.
 */
export async function printReceipt(receiptData) {
    // 1. Establish connection to QZ Tray
    if (!qz.websocket.isActive()) {
        try {
            await qz.websocket.connect();
        } catch (e) {
            console.error("QZ Tray connection failed:", e);
            alert("Could not connect to QZ Tray. Ensure the software is running on this computer.");
            return false;
        }
    }

    try {
        // 2. Specify the printer name. CORRECTED to 'casher'
        const printer = 'casher'; // <-- CORRECT PRINTER NAME
        const config = qz.configs.create(printer);

        // 3. Define the data array: Text, Drawer Kick, Full Cut
        const data = [
            receiptData, 
            { type: 'raw', data: ESC_POS_KICK_DRAWER }, // Kick the Cash Drawer
            { type: 'raw', data: ESC_POS_FULL_CUT }    // Cut the paper
        ];

        // 4. Send the print job
        await qz.print(config, data);
        return true;

    } catch (e) {
        console.error("Printing failed:", e);
        alert(`Receipt printing failed: ${e.message}. Check printer name ('casher') and QZ Tray connection.`);
        return false;
    }
}