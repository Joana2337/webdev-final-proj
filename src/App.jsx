// src/App.jsx
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUqw_nq8SpFrHYyv9Z1Eah_s-ZI_pqrNA",
  authDomain: "counter-app-366fe.firebaseapp.com",
  projectId: "counter-app-366fe",
  storageBucket: "counter-app-366fe.firebasestorage.app",
  messagingSenderId: "241170198627",
  appId: "1:241170198627:web:8007d6b6849d71569c0856",
  measurementId: "G-BL0S0NFZQ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [counters, setCounters] = useState([]);
  const [newCounterName, setNewCounterName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // READ - Fetch counters from Firebase
  const fetchCounters = async () => {
    setLoading(true);
    try {
      const counterCollection = collection(db, 'counters');
      const counterSnapshot = await getDocs(counterCollection);
      const counterList = counterSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCounters(counterList);
      setError(null);
    } catch (err) {
      console.error("Error fetching counters:", err);
      setError("Failed to fetch counters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch counters when component mounts
  useEffect(() => {
    fetchCounters();
  }, []);

  // CREATE - Add a new counter
  const addCounter = async (e) => {
    e.preventDefault();
    if (!newCounterName.trim()) return;
    
    try {
      await addDoc(collection(db, 'counters'), {
        name: newCounterName,
        value: 0
      });
      setNewCounterName('');
      fetchCounters(); // Refresh the list
    } catch (err) {
      console.error("Error adding counter:", err);
      setError("Failed to add counter. Please try again.");
    }
  };

  //Increment or decrement counter value
  const updateCounter = async (id, increment) => {
    try {
      const counter = counters.find(c => c.id === id);
      const newValue = counter.value + increment;
      
      const counterRef = doc(db, 'counters', id);
      await updateDoc(counterRef, {
        value: newValue
      });
      
      fetchCounters(); // Refresh the list
    } catch (err) {
      console.error("Error updating counter:", err);
      setError("Failed to update counter. Please try again.");
    }
  };

  // DELETE - Remove a counter
  const deleteCounter = async (id) => {
    try {
      await deleteDoc(doc(db, 'counters', id));
      fetchCounters(); // Refresh the list
    } catch (err) {
      console.error("Error deleting counter:", err);
      setError("Failed to delete counter. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Counter App with Firebase CRUD</h1>
        <p className="text-gray-600">Create, Read, Update, and Delete counters with Firebase backend</p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
          {error}
        </div>
      )}

      {/* Create new counter form */}
      <div className="mb-8 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Create New Counter</h2>
        <form onSubmit={addCounter} className="flex gap-2">
          <input
            type="text"
            value={newCounterName}
            onChange={(e) => setNewCounterName(e.target.value)}
            placeholder="Counter name"
            className="flex-grow px-4 py-2 border rounded"
            required
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Counter
          </button>
        </form>
      </div>

      {/* Display counters */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Your Counters</h2>
        
        {loading ? (
          <p className="text-center py-4">Loading counters...</p>
        ) : counters.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No counters added yet. Create one above!</p>
        ) : (
          <ul className="space-y-4">
            {counters.map(counter => (
              <li 
                key={counter.id} 
                className="bg-white p-4 rounded-md shadow flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold">{counter.name}</h3>
                  <p>Value: {counter.value}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateCounter(counter.id, -1)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    -1
                  </button>
                  <button 
                    onClick={() => updateCounter(counter.id, 1)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    +1
                  </button>
                  <button 
                    onClick={() => deleteCounter(counter.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;