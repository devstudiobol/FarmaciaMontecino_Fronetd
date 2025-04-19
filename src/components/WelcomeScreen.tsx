// WelcomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const quotes = [
  '"Tu salud es nuestra prioridad. Confía en profesionales que cuidan de ti."',
  '"Medicamentos de calidad y atención personalizada para tu bienestar."',
  '"Cuidamos de ti y tu familia las 24 horas del día."'
];

const WelcomeScreen: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);
  
    useEffect(() => {
        if (loading) {
          let quoteChanges = 0;
          const quoteInterval = setInterval(() => {
            setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
            quoteChanges++;
            if (quoteChanges >= 2) {
              clearInterval(quoteInterval);
              setFadeOut(true);
              setTimeout(() => navigate('/login'), 1000);
            }
          }, 2500);
    
          return () => clearInterval(quoteInterval);
        }
      }, [loading, navigate]);
    
      const handleStart = () => {
        setLoading(true);
      };

  return (
    <div className={`welcome-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="overlay">
        <div className={`container ${loading ? 'loading' : ''}`}>
          <div className="card">
            <div className="glass-effect" />
            <div className="card-content">
              <div className="logo-container">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4320/4320337.png"
                  alt="Pharmacy Logo"
                  className="logo"
                />
              </div>

              <h1 className="title">Farmacia Central</h1>
              
              <p className="subtitle">
                {quotes[currentQuoteIndex]}
              </p>

              <button 
                className={`start-button ${loading ? 'loading' : ''}`}
                onClick={handleStart}
                disabled={loading}
              >
                {loading ? (
                  <div className="loader"></div>
                ) : (
                  'Ingresar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .welcome-screen {
          width: 100%;
          height: 100vh;
          background-image: url('fondo.jpg');
          background-size: cover;
          background-position: center;
          transition: opacity 1s;
        }

        .welcome-screen.fade-out {
          opacity: 0;
        }

        .overlay {
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.65);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .container {
          width: 90%;
          max-width: 600px;
          animation: breathe 4s infinite ease-in-out;
        }

        @keyframes breathe {
          0%, 100% { transform: scale(0.95); }
          50% { transform: scale(1); }
        }

        .card {
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }

        .glass-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(28, 40, 51, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-content {
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .logo-container {
          width: 150px;
          height: 150px;
          margin-bottom: 30px;
        }

        .logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .title {
          font-size: 32px;
          font-weight: bold;
          color: #2196F3;
          margin-bottom: 20px;
          text-align: center;
          text-shadow: -1px 1px 10px rgba(0, 0, 0, 0.75);
        }

        .subtitle {
          font-size: 16px;
          color: #E0E0E0;
          text-align: center;
          margin-bottom: 40px;
          padding: 0 20px;
          line-height: 24px;
          font-style: italic;
          transition: opacity 0.5s;
        }

        .start-button {
          background-color: #2196F3;
          padding: 15px 40px;
          border-radius: 25px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
        }

        .start-button:hover {
          background-color: #1976D2;
        }

        .start-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loader {
          width: 20px;
          height: 20px;
          border: 3px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;