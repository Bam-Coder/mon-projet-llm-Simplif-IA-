import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState('👶 Enfant (5 ans)');
  const [provider, setProvider] = useState('openai'); // OpenAI, Gemini, DeepSeek
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const levels = ["👶 Enfant (5 ans)", "😎 Adolescent", "🎓 Étudiant", "🚀 Expert (Métaphore)"];

  const handleProcess = async () => {
    if (!text) {
      return alert("Veuillez remplir le texte !");
    }

    setLoading(true);
    setResult('');

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/simplify', {
        text,
        level,
        provider
      });

      setResult(res.data.output);

    } catch (err) {
      console.error(err);

      // Si le serveur renvoie un message de crédit insuffisant ou erreur API
      const errorMessage = err.response?.data?.detail || "Erreur de connexion au serveur.";

      // Simplification pour l'utilisateur final
      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("balance") ||
        errorMessage.includes("Insufficient")
      ) {
        setResult("⚠️ Crédit insuffisant pour ce provider. Veuillez recharger votre compte.");
      } else {
        setResult(`❌ Erreur serveur : ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Simplif-IA 💡</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>L'IA qui explique tout, à tout le monde.</p>
      
      <hr style={{ margin: '20px 0', border: '0.5px solid #eee' }} />

      {/* Sélection provider */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <label><b>1. Choisir le moteur d'IA :</b></label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }}
        >
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
          <option value="deepseek">DeepSeek</option>
        </select>
      </div>

      {/* Texte à simplifier */}
      <label><b>2. Texte complexe :</b></label>
      <textarea
        placeholder="Copiez-collez un article, un cours, ou un contrat compliqué..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', height: '150px', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
      />

      {/* Choix du niveau */}
      <div style={{ margin: '20px 0' }}>
        <p><b>3. Pour quel public ?</b></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {levels.map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              style={{
                padding: '10px 15px',
                cursor: 'pointer',
                borderRadius: '20px',
                border: '1px solid #007bff',
                background: level === l ? '#007bff' : 'white',
                color: level === l ? 'white' : '#007bff',
                transition: '0.3s'
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Bouton */}
      <button
        onClick={handleProcess}
        disabled={loading}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '18px',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        {loading ? "L'IA réfléchit... 🧠" : "Transformer le savoir ✨"}
      </button>

      {/* Résultat */}
      {result && (
        <div style={{
          marginTop: '30px',
          padding: '25px',
          background: result.includes("⚠️") ? '#fff3cd' : '#e9f7ef',
          borderRadius: '10px',
          borderLeft: `5px solid ${result.includes("⚠️") ? '#856404' : '#28a745'}`,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: result.includes("⚠️") ? '#856404' : '#155724' }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
