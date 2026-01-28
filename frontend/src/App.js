import React, { useState } from 'react';
import axios from 'axios';

// URL de ton backend (à changer par l'URL Render après déploiement)
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mon-projet-llm-simplif-ia.onrender.com' 
  : 'http://127.0.0.1:8000/api/simplify';

function App() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState('👶 Enfant (5 ans)');
  const [provider, setProvider] = useState('openai');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const levels = ["👶 Enfant (5 ans)", "😎 Adolescent", "🎓 Étudiant", "🚀 Expert (Métaphore)"];

  const handleProcess = async () => {
    if (!text) return alert("Veuillez saisir un texte.");
    setLoading(true);
    setResult('');
    try {
      const res = await axios.post(API_URL, { text, level, provider });
      setResult(res.data.output);
    } catch (err) {
      setResult(`❌ Erreur : ${err.response?.data?.detail || "Serveur injoignable"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header Section */}
        <header style={styles.header}>
          <h1 style={styles.title}>Simplif<span style={{color: '#6366f1'}}>IA</span> 💡</h1>
          <p style={styles.subtitle}>L'intelligence artificielle qui rend le savoir accessible.</p>
        </header>

        {/* Configuration Row */}
        <div style={styles.configGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Moteur de réflexion</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} style={styles.select}>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="gemini">Google Gemini</option>
              <option value="deepseek">DeepSeek AI</option>
            </select>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Public cible</label>
            <div style={styles.buttonGroup}>
              {levels.map(l => (
                <button 
                  key={l} 
                  onClick={() => setLevel(l)} 
                  style={{...styles.levelBtn, ...(level === l ? styles.levelBtnActive : {})}}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Contenu à vulgariser</label>
          <textarea
            placeholder="Collez ici votre texte complexe..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.textarea}
          />
        </div>

        {/* Action Button */}
        <button onClick={handleProcess} disabled={loading} style={loading ? styles.btnDisabled : styles.btn}>
          {loading ? "Traitement en cours..." : "Simplifier maintenant ✨"}
        </button>

        {/* Result Area */}
        {result && (
          <div style={result.includes("❌") ? styles.resultError : styles.resultSuccess}>
            <div style={styles.resultHeader}>Résultat pour : {level}</div>
            <p style={styles.resultText}>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- JSS Styles Pro ---
const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    margin: 0,
    fontFamily: '"Inter", sans-serif',
    boxSizing: 'border-box',
    
    /* IMAGE NETTE ET PROPRE */
    // On enlève le voile blanc et on met un voile noir très léger (0.3) pour le contraste
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), 
                      url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')`,
    
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  },

  card: {
    width: '100%',
    maxWidth: '850px',
    // La carte est bien opaque pour être lisible
    backgroundColor: 'rgba(246, 218, 176, 0.95)', 
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', // Ombre plus forte pour détacher du fond
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxSizing: 'border-box',
    backdropFilter: 'blur(10px)', // Effet de flou sur l'image derrière la carte
  },
  header: { textAlign: 'center', marginBottom: '35px' },
  title: { fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', margin: '0' },
  subtitle: { color: '#64748b', fontSize: '1.1rem', marginTop: '10px' },
  configGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '25px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginLeft: '4px' },
  select: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.2s',
    cursor: 'pointer',
  },
  buttonGroup: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  levelBtn: {
    padding: '10px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  levelBtnActive: { background: '#6366f1', color: 'white', borderColor: '#6366f1', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' },
  textarea: {
    width: '100%',
    minHeight: '160px',
    padding: '15px',
    borderRadius: '16px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    lineHeight: '1.5',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    background: '#1e293b',
    color: 'white',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.1s, background 0.2s',
  },
  btnDisabled: { background: '#94a3b8', width: '100%', padding: '16px', borderRadius: '16px', border: 'none', color: 'white' },
  resultSuccess: {
    marginTop: '30px',
    padding: '25px',
    background: '#f8fafc',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    borderLeft: '6px solid #6366f1',
  },
  resultError: { marginTop: '30px', padding: '25px', background: '#fef2f2', borderRadius: '20px', border: '1px solid #fee2e2', borderLeft: '6px solid #ef4444' },
  resultHeader: { fontWeight: '700', marginBottom: '10px', color: '#1e293b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  resultText: { margin: 0, color: '#334155', lineHeight: '1.7', fontSize: '1.05rem' },
};

export default App;