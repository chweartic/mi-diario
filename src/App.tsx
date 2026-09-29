import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Save, Calendar } from 'lucide-react';

// TUS CLAVES DE FIREBASE (Ya integradas)
const firebaseConfig = {
  apiKey: 'AIzaSyCn-QRfuN7HnPvYrz6EIxkSk9hV4oOkkqk',
  authDomain: 'diario-20-26.firebaseapp.com',
  projectId: 'diario-20-26',
  storageBucket: 'diario-20-26.firebasestorage.app',
  messagingSenderId: '860293953697',
  appId: '1:860293953697:web:4a658a6dc4ae675b1b98e0',
  measurementId: 'G-Y4FC0BBY3B',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const [buenas, setBuenas] = useState(['', '', '', '', '']);
  const [malas, setMalas] = useState(['', '', '', '', '']);
  const [ratings, setRatings] = useState({
    familia: 0,
    amigos: 0,
    novio: 0,
    general: 0,
  });

  // Iniciar sesión anónima automáticamente
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Cargar datos al cambiar de fecha
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, 'diarios', `${user.uid}_${date}`),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBuenas(data.buenas || ['', '', '', '', '']);
          setMalas(data.malas || ['', '', '', '', '']);
          setRatings(
            data.ratings || { familia: 0, amigos: 0, novio: 0, general: 0 }
          );
        } else {
          setBuenas(['', '', '', '', '']);
          setMalas(['', '', '', '', '']);
          setRatings({ familia: 0, amigos: 0, novio: 0, general: 0 });
        }
      }
    );
    return () => unsub();
  }, [user, date]);

  // Guardar datos
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await setDoc(doc(db, 'diarios', `${user.uid}_${date}`), {
      buenas,
      malas,
      ratings,
    });
    setTimeout(() => setSaving(false), 1000);
  };

  const updateArray = (setter, array, index, value) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const StarRating = ({ label, field }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        marginBottom: '4px',
      }}
    >
      <span style={{ width: '150px' }}>{label}</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRatings({ ...ratings, [field]: star })}
          style={{
            cursor: 'pointer',
            opacity: ratings[field] >= star ? 1 : 0.3,
          }}
        >
          🌟
        </span>
      ))}
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8F4EC',
        padding: '20px',
        fontFamily: 'serif',
        color: '#333',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#FFFDF7',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          border: '1px solid #EBE3D5',
        }}
      >
        {/* Cabecera y Selector de Fecha */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #EBE3D5',
            paddingBottom: '20px',
            marginBottom: '30px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '32px',
                fontStyle: 'italic',
                color: '#B26E63',
                margin: 0,
              }}
            >
              Daily Journal
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px',
              }}
            >
              <Calendar size={18} color="#888" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '16px',
                  fontFamily: 'serif',
                  color: '#555',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#B26E63',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <Save size={16} /> {saving ? 'Guardado' : 'Guardar diario'}
          </button>
        </div>

        {/* 5 Cosas Buenas */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>
            5 cosas buenas
          </h3>
          {buenas.map((item, i) => (
            <div
              key={`buena-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <span style={{ color: '#B26E63' }}>•</span>
              <input
                type="text"
                value={item}
                onChange={(e) =>
                  updateArray(setBuenas, buenas, i, e.target.value)
                }
                placeholder={`Cosa buena ${i + 1}...`}
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px dashed #CCC',
                  backgroundColor: 'transparent',
                  padding: '5px',
                  fontSize: '15px',
                  fontFamily: 'serif',
                  outline: 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* 5 Cosas Malas */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>
            5 cosas malas
          </h3>
          {malas.map((item, i) => (
            <div
              key={`mala-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <span style={{ color: '#555' }}>•</span>
              <input
                type="text"
                value={item}
                onChange={(e) =>
                  updateArray(setMalas, malas, i, e.target.value)
                }
                placeholder={`Cosa mala ${i + 1}...`}
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px dashed #CCC',
                  backgroundColor: 'transparent',
                  padding: '5px',
                  fontSize: '15px',
                  fontFamily: 'serif',
                  outline: 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Valoraciones Footer */}
        <div
          style={{
            marginTop: '50px',
            paddingTop: '20px',
            borderTop: '1px solid #EBE3D5',
          }}
        >
          <StarRating label="Familia" field="familia" />
          <StarRating label="Amigos" field="amigos" />
          <StarRating label="Novio" field="novio" />
          <StarRating label="Sentimientos generales" field="general" />
        </div>
      </div>
    </div>
  );
}
