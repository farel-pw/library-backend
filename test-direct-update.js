const BookService = require('./src/services/BookService');

async function testDirectUpdate() {
  console.log('🔧 Test direct de mise à jour du livre\n');

  try {
    // Test avec des données problématiques
    const updateData = {
      titre: 'Debug Test Book - Modifié v2',
      auteur: 'Debug Author Modified',
      genre: 'Test Modified',
      isbn: '9999999999999',
      annee_publication: 2024,
      description: 'Livre pour debug modifié',
      exemplaires_total: 3  // Ce champ cause le problème
    };

    console.log('🔄 Données à mettre à jour:', updateData);
    
    const result = await BookService.updateBook(1, updateData);
    console.log('📋 Résultat:', result);

  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('Stack:', error.stack);
  }
}

testDirectUpdate().catch(console.error);
