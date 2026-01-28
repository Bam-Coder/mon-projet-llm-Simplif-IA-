import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState('👶 Enfant (5 ans)');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const levels = ["👶 Enfant (5 ans)", "Adolescent", "🎓 Étudiant", "🚀 Expert (Métaphore)"];

  const handleProcess = async () => {
    if (!apiKey || !text) return alert("Remplissez tous les champs !");
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/simplify', {
        text, level, api_key: apiKey
      });
      setResult(res.data.output);
    } catch (err) {
      setResult("Erreur: Impossible de contacter le serveur.");
    }
    setLoading(false);
  };

  return (
    <div className="app-container" style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Simplif-IA 💡</h1>
      
      <input 
        type="password" 
        placeholder="Ta clé API OpenAI" 
        value={apiKey} 
        onChange={(e) => setApiKey(e.target.value)} 
        style={{ display: 'block', marginBottom: '20px', width: '100%' }}
      />

      <textarea 
        placeholder="Colle ton texte complexe ici..." 
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', height: '150px' }}
      />

      <div style={{ margin: '20px 0' }}>
        <p>Choisir le public cible :</p>
        {levels.map(l => (
          <button 
            key={l} 
            onClick={() => setLevel(l)}
            style={{ marginRight: '10px', padding: '10px', background: level === l ? '#007bff' : '#eee', color: level === l ? 'white' : 'black' }}
          >
            {l}
          </button>
        ))}
      </div>

      <button 
        onClick={handleProcess} 
        disabled={loading}
        style={{ padding: '15px 30px', cursor: 'pointer', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        {loading ? "L'IA réfléchit..." : "Transformer ✨"}
      </button>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#f4f4f4', borderRadius: '10px' }}>
          <h3>Résultat :</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;