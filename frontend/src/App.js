import React, { useState } from 'react';
import axios from 'axios';

// Configuration API
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mon-projet-llm-simplif-ia.onrender.com/api/simplify'
  : 'http://127.0.0.1:8000/api/simplify';

// Mapping UI <-> API
const LEVELS = [
  { label: "👶 Enfant (5 ans)", value: "enfant" },
  { label: "😎 Adolescent", value: "ado" },
  { label: "🎓 Étudiant", value: "etudiant" },
  { label: "🧠 Génie", value: "genie" },
  { label: "🧩 Adaptatif (Bonus)", value: "bonus" }
];

function App() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState('enfant');
  const [provider, setProvider] = useState('openai');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!text) return alert("Veuillez saisir un texte.");
    setLoading(true);
    setResult('');
    try {
      const res = await axios.post(API_URL, { text, level, provider });
      setResult(res.data.output);
    } catch (err) {
      setResult(`❌ Erreur : ${err.response?.data?.detail || "Le serveur ne répond pas."}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert("Texte copié dans le presse-papier !");
  };

  const speak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const getLevelLabel = (value) =>
    LEVELS.find(l => l.value === value)?.label || value;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>Simplif<span style={{color: '#6366f1'}}>IA</span> 💡</h1>
          <p style={styles.subtitle}>L'intelligence artificielle qui rend le savoir accessible.</p>
        </header>

        {/* Configuration */}
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
              {LEVELS.map(l => (
                <button 
                  key={l.value} 
                  onClick={() => setLevel(l.value)} 
                  style={{...styles.levelBtn, ...(level === l.value ? styles.levelBtnActive : {})}}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Contenu à vulgariser</label>
          <textarea
            placeholder="Collez ici votre texte complexe (article, contrat, cours...)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.textarea}
          />
        </div>

        {/* Main Action */}
        <button onClick={handleProcess} disabled={loading} style={loading ? styles.btnDisabled : styles.btn}>
          {loading ? "L'IA analyse le texte... 🧠" : "Simplifier maintenant ✨"}
        </button>

        {/* Result Display */}
        {result && (
          <div style={result.includes("❌") ? styles.resultError : styles.resultSuccess}>
            <div style={styles.resultHeaderRow}>
              <span style={styles.resultHeader}>Résultat pour : {getLevelLabel(level)}</span>
              {!result.includes("❌") && (
                <div style={styles.actionIcons}>
                  <button onClick={speak} style={styles.iconBtn} title="Écouter">🔊</button>
                  <button onClick={copyToClipboard} style={styles.iconBtn} title="Copier">📋</button>
                </div>
              )}
            </div>
            <p style={styles.resultText}>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

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
    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
                      url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  card: {
    width: '100%',
    maxWidth: '850px',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: '28px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    padding: '40px',
    boxSizing: 'border-box',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  header: { textAlign: 'center', marginBottom: '35px' },
  title: { fontSize: '2.8rem', fontWeight: '800', color: '#1e293b', margin: '0', letterSpacing: '-1px' },
  subtitle: { color: '#64748b', fontSize: '1.1rem', marginTop: '10px' },
  configGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '25px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' },
  label: { fontSize: '0.95rem', fontWeight: '600', color: '#475569', marginLeft: '4px' },
  select: { padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', cursor: 'pointer', backgroundColor: '#fff' },
  buttonGroup: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  levelBtn: { padding: '12px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: '500' },
  levelBtnActive: { background: '#6366f1', color: 'white', borderColor: '#6366f1', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)', transform: 'translateY(-2px)' },
  textarea: { width: '100%', minHeight: '180px', padding: '18px', borderRadius: '18px', border: '1px solid #cbd5e1', fontSize: '1.05rem', lineHeight: '1.6', outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  btn: { width: '100%', padding: '18px', borderRadius: '18px', background: '#1e293b', color: 'white', border: 'none', fontSize: '1.15rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  btnDisabled: { background: '#94a3b8', width: '100%', padding: '18px', borderRadius: '18px', border: 'none', color: 'white', cursor: 'not-allowed' },
  resultSuccess: { marginTop: '30px', padding: '30px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0', borderLeft: '8px solid #6366f1' },
  resultError: { marginTop: '30px', padding: '30px', background: '#fef2f2', borderRadius: '24px', border: '1px solid #fee2e2', borderLeft: '8px solid #ef4444' },
  resultHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  resultHeader: { fontWeight: '800', color: '#1e293b', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  actionIcons: { display: 'flex', gap: '12px' },
  iconBtn: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', fontSize: '1.3rem', transition: 'transform 0.1s, box-shadow 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  resultText: { margin: 0, color: '#334155', lineHeight: '1.8', fontSize: '1.1rem' },
};

export default App;
