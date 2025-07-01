import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDoc, getDocs, addDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";

function App() {
  const [accounts, setAccounts] = useState([]);

  // Store which account’s history is visible
  const [activeAccountId, setActiveAccountId] = useState(null);

  // Form inputs for adding booking
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [darshan, setDarshan] = useState(0);
  const [accommodation, setAccommodation] = useState(0);
  const [laddus, setLaddus] = useState(0);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  
  // Cumulative totals
  const [totalDarshan, setTotalDarshan] = useState(0);
  const [totalAccommodation, setTotalAccommodation] = useState(0);
  const [totalLaddus, setTotalLaddus] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "accounts"), async (snapshot) => {
      let accountList = []; 
      let darshan = 0;
      let accommodation = 0;
      let laddus = 0;

      for (let docSnap of snapshot.docs) {
        let account = { id: docSnap.id, ...docSnap.data(), booking_history: [] };
        accountList.push(account);
        darshan += account.darshan_remaining;
        accommodation += account.accommodation_remaining;
        laddus += account.laddus_remaining;

        // Get booking history for each account (fetch subcollection)
        const bookingSnap = await getDocs(collection(db, "accounts", docSnap.id, "booking_history"));
        account.booking_history = bookingSnap.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));
      }

      setAccounts(accountList);
      setTotalDarshan(darshan);
      setTotalAccommodation(accommodation);
      setTotalLaddus(laddus);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  async function handleAddBooking(e) {
    e.preventDefault();

    if (!selectedAccountId) return;

    try {
      const accountRef = doc(db, "accounts", selectedAccountId);
      const accountSnap = await getDoc(accountRef);

      if (!accountSnap.exists()) {
        alert("Selected account does not exist.");
        return;
      }

      const currentData = accountSnap.data();

      await updateDoc(accountRef, {
        darshan_remaining: Math.max(0, currentData.darshan_remaining - darshan),
        accommodation_remaining: Math.max(0, currentData.accommodation_remaining - accommodation),
        laddus_remaining: Math.max(0, currentData.laddus_remaining - laddus),
        darshan_availed: (currentData.darshan_availed || 0) + darshan,
        accommodation_availed: (currentData.accommodation_availed || 0) + accommodation,
      });

      await addDoc(collection(db, "accounts", selectedAccountId, "booking_history"), {
        name,
        date,
        darshan,
        accommodation,
        laddus,
      });

      alert("Booking successfully added.");

      // Clear form inputs after submit
      setSelectedAccountId('');
      setDarshan(0);
      setAccommodation(0);
      setLaddus(0);
      setName('');
      setDate('');
    } catch (error) {
      console.error("Error adding booking.", error);
      alert("Failed to add booking.");
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily:' Arial, sans serif', background: '#fff5cc', color: '#5d4037' }}>
      <h1 style={{ color: '#ff9900' }}>TTD Donor Privileges 2025</h1>

      <h2 style={{ color: '#ff9900' }}>Cumulative Availability</h2>
      <ul style={{ 
        display: 'flex',
        gap: '20px',
        listStyle: 'none',
        padding: 0,
        marginBottom:'20px'
      }}>
        <li style={{ padding:'20px', border:'1px solid #ffcc80', borderRadius:'10px', background:'#ffe0b2', boxShadow:'0 2px 5px #ffcc80' }}>
          <strong>Darshan Remaining:</strong> {totalDarshan}
        </li>
        <li style={{ padding:'20px', border:'1px solid #ffcc80', borderRadius:'10px', background:'#ffe0b2', boxShadow:'0 2px 5px #ffcc80' }}>
          <strong>Accommodation Remaining:</strong> {totalAccommodation}
        </li>
        <li style={{ padding:'20px', border:'1px solid #ffcc80', borderRadius:'10px', background:'#ffe0b2', boxShadow:'0 2px 5px #ffcc80' }}>
          <strong>Laddus Remaining:</strong> {totalLaddus}
        </li>
      </ul>


      <h2 style={{ color: '#ff9900' }}>Accounts</h2>
      {accounts.map((account) => (
        <div 
          key={account.id}
          style={{ 
            border:'1px solid #ffcc80',
            padding:'20px',
            marginBottom:'20px',
            borderRadius:'10px',
            background:'#fff3cc',
            boxShadow:'0 2px 5px #ffcc80',
            position:'relative'
          }}>
          <h3 style={{ color: '#ff9900' }}>{account.id.toUpperCase()}</h3>

          <ul style={{ 
            display:'flex',
            gap:'20px',
            listStyle:'none',
            padding: 0,
            marginBottom:'20px'
          }}>
            <li style={{ padding:'20px', border:'1px solid #ffcc80', borderRadius:'10px', background:'#ffe0b2' }}>
              <strong>Darshan Remaining:</strong> {account.darshan_remaining}
            </li>
            <li style={{ padding:'20px', border:'1px solid #ffcc80', borderRadius:'10px', background:'#ffe0b2' }}>
              <strong>Accommodation Remaining:</strong> {account.accommodation_remaining}
            </li>
            <li style={{ padding:'20px', border:'1px solid #ffcc80', borderRadius:'10px', background:'#ffe0b2' }}>
              <strong>Laddus Remaining:</strong> {account.laddus_remaining}
            </li>
          </ul>

          {/* View/Hide Booking History Button placed at the top right corner */}
          <button 
            onClick={() => setActiveAccountId(activeAccountId === account.id ? null : account.id)} 
            style={{ position:'absolute', top:'20px', right:'20px', padding:'10px 20px', background:'#ff9900', color:'#fff', border:'none', borderRadius:'5px', cursor:'pointer' }}>
            {activeAccountId === account.id ? "Hide Booking History" : "View Booking History"}
          </button>

          {/* Booking History Table */}
          {activeAccountId === account.id && (
            account.booking_history.length ? (
              <table style={{ width:'100%', borderCollapse:'collapse', marginTop:'20px' }}>
                <thead>
                    <tr style={{ background:'#ffcc80' }}>
                        <th style={{ border:'1px solid #ffcc80', padding:'10px' }}>Date</th>
                        <th style={{ border:'1px solid #ffcc80', padding:'10px' }}>Name</th>
                        <th style={{ border:'1px solid #ffcc80', padding:'10px' }}>Darshan</th>
                        <th style={{ border:'1px solid #ffcc80', padding:'10px' }}>Accommodation</th>
                        <th style={{ border:'1px solid #ffcc80', padding:'10px' }}>Laddus</th>
                    </tr>
                </thead>
                <tbody>
                    {account.booking_history.map((item) => (
                        <tr key={item.id}>
                           <td style={{ border:'1px solid #ffcc80', padding:'10px' }}>{item.date}</td>
                           <td style={{ border:'1px solid #ffcc80', padding:'10px' }}>{item.name}</td>
                           <td style={{ border:'1px solid #ffcc80', padding:'10px' }}>{item.darshan}</td>
                           <td style={{ border:'1px solid #ffcc80', padding:'10px' }}>{item.accommodation}</td>
                           <td style={{ border:'1px solid #ffcc80', padding:'10px' }}>{item.laddus}</td>
                        </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p>Booking history is empty</p>
            )
          )}

        </div>
      ))}

      <h2 style={{ color: '#ff9900' }}>Add Booking</h2>
      <form onSubmit={(e) => handleAddBooking(e)} style={{marginBottom:'20px', padding:'20px', border:'1px solid #ffcc80', borderRadius:'10px', background:'#fff3cc' }}>
        <label>Account:
          <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} required>
            <option value="">Select</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.id}
              </option>
            ))}
          </select>
        </label>
        <br/>

        <label>Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)} 
            required
          />
        </label>
        <br/>

        <label>Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)} 
            required
          />
        </label>
        <br/>

        <label>Darshan:
          <input
            type="number"
            value={darshan}
            onChange={(e) => setDarshan(Number(e.target.value))}
            min="0"
          />
        </label>
        <br/>

        <label>Accommodation:
          <input
            type="number"
            value={accommodation}
            onChange={(e) => setAccommodation(Number(e.target.value))}
            min="0"
          />
        </label>
        <br/>

        <label>Laddus:
          <input
            type="number"
            value={laddus}
            onChange={(e) => setLaddus(Number(e.target.value))}
            min="0"
          />
        </label>
        <br/>

        <button 
          disabled={!selectedAccountId ||
            (darshan === 0 && accommodation === 0 && laddus === 0)} 
          style={{ padding:'10px 20px', background: '#ff9900', color:'#fff', border:'none', borderRadius:'5px', cursor:'pointer' }}>
          Add Booking
        </button>

      </form>

    </div>
  )
}

export default App;
