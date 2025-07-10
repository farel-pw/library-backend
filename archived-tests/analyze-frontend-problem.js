// Script pour créer une version corrigée de la page des livres
const fs = require('fs');

console.log('🔍 Analyse du problème potentiel...');

// Les problèmes possibles:
console.log('\n📋 Problèmes potentiels identifiés:');
console.log('1. ❌ État loading qui reste à true');
console.log('2. ❌ Erreur dans api.getLivres()');
console.log('3. ❌ useEffect qui ne se déclenche pas');
console.log('4. ❌ Filtre qui cache tous les livres');
console.log('5. ❌ Contexte d\'authentification qui bloque');

// Solutions recommandées
console.log('\n🛠️ Solutions recommandées:');
console.log('1. ✅ Visiter http://localhost:3001/debug-livres pour voir les logs');
console.log('2. ✅ Ouvrir la console du navigateur (F12)');
console.log('3. ✅ Vérifier l\'onglet Network pour les requêtes API');
console.log('4. ✅ Vérifier si le token d\'authentification est présent');

// Créer un composant simple pour tester
const simpleTestComponent = `
"use client"

import { useState } from "react"

export default function TestSimplePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:4401/livres')
      const result = await response.json()
      console.log('API Response:', result)
      setData(result)
    } catch (error) {
      console.error('Error:', error)
      setData({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Simple API</h1>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Test en cours...' : 'Tester l\'API'}
      </button>

      {data && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h2>Résultat:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
`;

// Créer le dossier et le fichier
try {
  if (!fs.existsSync('c:\\Users\\fanko\\OneDrive\\Desktop\\projet 1\\fronctend\\app\\test-simple')) {
    fs.mkdirSync('c:\\Users\\fanko\\OneDrive\\Desktop\\projet 1\\fronctend\\app\\test-simple');
  }
  
  fs.writeFileSync('c:\\Users\\fanko\\OneDrive\\Desktop\\projet 1\\fronctend\\app\\test-simple\\page.tsx', simpleTestComponent);
  
  console.log('\n✅ Page de test simple créée: /app/test-simple/page.tsx');
  console.log('📍 URL: http://localhost:3001/test-simple');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
}

console.log('\n🎯 ÉTAPES DE DEBUG:');
console.log('1. Allez sur http://localhost:3001/debug-livres');
console.log('2. Allez sur http://localhost:3001/test-simple');
console.log('3. Ouvrez la console du navigateur (F12)');
console.log('4. Testez l\'API avec le bouton');
console.log('5. Vérifiez les erreurs dans la console');
