import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, getDocs } from 'firebase/firestore';

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCn-QRfuN7HnPvYrz6EIxkSk9hV4oOkkqk",
  authDomain: "diario-20-26.firebaseapp.com",
  projectId: "diario-20-26",
  storageBucket: "diario-20-26.firebasestorage.app",
  messagingSenderId: "860293953697",
  appId: "1:860293953697:web:4a658a6dc4ae675b1b98e0",
  measurementId: "G-Y4FC0BBY3B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ESTILOS GLOBALES Y FUENTES ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    background-color: #EFEBE4; /* Fondo grisáceo del borde exterior */
    font-family: 'Playfair Display', serif;
    color: #4A5568;
  }
  
  * {
    box-sizing: border-box;
  }
  
  .cursiva {
    font-family: 'Great Vibes', cursive;
  }

  /* Scrollbar bonita para el interior */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #C4B5A5;
    border-radius: 4px;
  }
`;

// --- HELPER FECHAS ---
const getFormattedDate = (dateString) => {
  const date = new Date(dateString);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const diaSemana = dias[date.getDay()];
  const diaMes = date.getDate();
  const mes = meses[date.getMonth()];
  
  return (
    <>
      <span className="cursiva" style={{ fontSize: '42px', marginRight: '8px' }}>{diaSemana},</span> 
      {diaMes} DE <span className="cursiva" style={{ fontSize: '42px', marginLeft: '8px', textTransform: 'capitalize' }}>{mes}</span>
    </>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // Controla si estamos en portada o dentro
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  
  const [buenas, setBuenas] = useState(["", "", "", "", ""]);
  const [malas, setMalas] = useState(["", "", "", "", ""]);
  
  const [entradasPasadas, setEntradasPasadas] = useState([]);

  // Autenticación
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Cargar datos del día seleccionado
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "diarios", `${user.uid}_${currentDate}`), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBuenas(data.buenas || ["", "", "", "", ""]);
        setMalas(data.malas || ["", "", "", "", ""]);
      } else {
        setBuenas(["", "", "", "", ""]);
        setMalas(["", "", "", "", ""]);
      }
    });
    return () => unsub();
  }, [user, currentDate]);

  // Guardar datos (auto-guardado al escribir)
  useEffect(() => {
    if (!user || !isOpen) return;
    const saveTimer = setTimeout(async () => {
      setSaving(true);
      await setDoc(doc(db, "diarios", `${user.uid}_${currentDate}`), { buenas, malas });
      setTimeout(() => setSaving(false), 500);
    }, 1000); // Guarda 1 segundo después de dejar de teclear
    return () => clearTimeout(saveTimer);
  }, [buenas, malas, currentDate, user, isOpen]);


  const updateArray = (setter, array, index, value) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const handleEscribirHoy = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // --- VISTA PORTADA ---
  if (!isOpen) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ 
            width: '100%', maxWidth: '900px', height: '600px',
            backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            display: 'flex'
          }}>
            {/* Menú lateral simulado (portada) */}
            <div style={{ width: '280px', backgroundColor: '#F8F6F0', borderRight: '1px solid #E2DCD0', padding: '30px' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ margin: 0, color: '#B04A5A', lineHeight: '0.8' }}>
                  <span className="cursiva" style={{ fontSize: '42px', fontWeight: 'normal' }}>Daily</span><br/>
                  <span style={{ fontSize: '14px', letterSpacing: '2px', fontWeight: '600' }}>JOURNAL</span>
                </h1>
              </div>
              <button disabled style={{ width: '100%', padding: '12px', backgroundColor: 'white', border: '1px solid #E2DCD0', borderRadius: '8px', color: '#888', marginBottom: '30px', cursor: 'not-allowed' }}>
                + Escribir Hoy
              </button>
              <div>
                <p style={{ fontSize: '10px', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>Entradas pasadas</p>
                <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#999' }}>Aún no hay entradas.</p>
              </div>
            </div>

            {/* Zona central (Rayas y cartel) */}
            <div style={{ 
              flex: 1, 
              backgroundImage: 'repeating-linear-gradient(to right, #9BA6C7, #9BA6C7 45px, #FFFFFF 45px, #FFFFFF 90px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
              <div style={{
                backgroundColor: '#F3D6D6', border: '2px dashed #D9A0A0', borderRadius: '12px',
                padding: '30px 50px', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                marginBottom: '40px'
              }}>
                <h2 style={{ margin: 0, color: '#A03B4A', lineHeight: '0.9' }}>
                  <span className="cursiva" style={{ fontSize: '58px', fontWeight: 'normal' }}>Daily</span><br/>
                  <span style={{ fontSize: '22px', letterSpacing: '4px', fontWeight: '600' }}>JOURNAL</span>
                </h2>
              </div>

              <button 
                onClick={() => setIsOpen(true)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '25px',
                  padding: '12px 30px', color: '#A03B4A', fontSize: '16px', fontWeight: '600',
                  cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Abrir Diario <span style={{ fontSize: '18px' }}>›</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- VISTA INTERIOR (DIARIO ABIERTO) ---
  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ 
          width: '100%', maxWidth: '1000px', height: '80vh', minHeight: '600px',
          backgroundColor: '#FCFAF6', borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)', display: 'flex'
        }}>
          
          {/* Menú lateral izquierdo */}
          <div style={{ width: '260px', backgroundColor: '#F5F2EA', borderRight: '1px solid #E6DFD3', padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px', cursor: 'pointer' }} onClick={() => setIsOpen(false)}>
              <h1 style={{ margin: 0, color: '#B04A5A', lineHeight: '0.8' }}>
                <span className="cursiva" style={{ fontSize: '38px', fontWeight: 'normal' }}>Daily</span><br/>
                <span style={{ fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}>JOURNAL</span>
              </h1>
            </div>

            <button 
              onClick={handleEscribirHoy}
              style={{ 
                width: '100%', padding: '12px', backgroundColor: 'white', border: '1px solid #E6DFD3', 
                borderRadius: '8px', color: '#4A5568', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
              }}
            >
              + Escribir Hoy
            </button>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <p style={{ fontSize: '10px', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>Entradas pasadas</p>
              
              {/* Buscador de fechas manual para entradas pasadas */}
              <div style={{ marginBottom: '15px' }}>
                 <input 
                  type="date" 
                  value={currentDate} 
                  onChange={(e) => setCurrentDate(e.target.value)}
                  style={{ 
                    width: '100%', padding: '8px', border: '1px solid #E6DFD3', 
                    borderRadius: '6px', backgroundColor: 'transparent',
                    fontFamily: 'inherit', color: '#666', fontSize: '13px'
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#999', lineHeight: '1.4' }}>
                Selecciona una fecha arriba para ver o editar la entrada de ese día.
              </p>
            </div>
          </div>

          {/* Área de escritura principal */}
          <div style={{ flex: 1, padding: '50px 60px', overflowY: 'auto', position: 'relative' }}>
            
            {/* Indicador de guardado discreto */}
            {saving && <span style={{ position: 'absolute', top: '20px', right: '30px', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>Guardando...</span>}

            {/* Cabecera Fecha */}
            <div style={{ borderBottom: '1px solid #EAE1D5', paddingBottom: '20px', marginBottom: '40px', textAlign: 'center', color: '#5A5A5A' }}>
              <h2 style={{ margin: 0, fontWeight: 'normal' }}>
                {getFormattedDate(currentDate)}
              </h2>
            </div>

            {/* 5 Cosas Buenas */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', color: '#2C3E50', fontWeight: '600', marginBottom: '20px' }}>5 cosas buenas</h3>
              {buenas.map((item, i) => (
                <div key={`buena-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <span style={{ color: '#D48694', fontSize: '14px' }}>●</span>
                  <input 
                    type="text" 
                    value={item} 
                    onChange={(e) => updateArray(setBuenas, buenas, i, e.target.value)}
                    placeholder={`Cosa buena ${i + 1}...`}
                    style={{ 
                      width: '100%', border: 'none', backgroundColor: 'transparent', 
                      padding: '5px 0', fontSize: '16px', fontFamily: 'inherit', 
                      color: '#606F7B', outline: 'none' 
                    }}
                  />
                </div>
              ))}
            </div>

            {/* 5 Cosas Malas */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', color: '#2C3E50', fontWeight: '600', marginBottom: '20px' }}>5 cosas malas</h3>
              {malas.map((item, i) => (
                <div key={`mala-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <span style={{ color: '#5A6B7C', fontSize: '14px' }}>●</span>
                  <input 
                    type="text" 
                    value={item} 
                    onChange={(e) => updateArray(setMalas, malas, i, e.target.value)}
                    placeholder={`Cosa mala ${i + 1}...`}
                    style={{ 
                      width: '100%', border: 'none', backgroundColor: 'transparent', 
                      padding: '5px 0', fontSize: '16px', fontFamily: 'inherit', 
                      color: '#606F7B', outline: 'none' 
                    }}
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}