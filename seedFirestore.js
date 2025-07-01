const admin = require('firebase-admin');

// Initialize the app with a service account
const serviceAccount = require('D:\\booking-tracker\\booking-app-242b5-firebase-adminsdk-fbsvc-2e8e787e4b.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

async function seedAccounts() {
  const accountsCollection = db.collection('accounts');

  for (let i = 1; i <= 7; i++) {
    const docId = `account${i}`;
    const accountData = {
      accommodation_availed: 0,
      accommodation_remaining: 3,
      darshan_availed: 0,
      darshan_remaining: 3,
      laddus_remaining: 20,
    };

    // Create the account first
    await accountsCollection.doc(docId).set(accountData);
    console.log(`Created document ${docId}`);

    // Now create a subcollection for booking history (with a sample booking or just leave it empty)
    // Uncomment if you want to add a dummy booking:
    // await accountsCollection.doc(docId).collection('booking_history').add({ 
    //   date: new Date().toISOString().split('T')[0],
    //   name: "Sample Person",
    //   accommodationAvailed: 0,
    //   darshanAvailed: 0,
    //   laddusAvailed: 0,
    // });

    console.log(`Created booking_history subcollection for ${docId}.`);

  }

  console.log("Seeding done!");
}

seedAccounts().catch(console.error);
