// Test simple pour les commentaires
const CommentService = require('./src/services/CommentService');

console.log('🧪 Test du service CommentService...');

async function testCommentService() {
  try {
    console.log('📝 Test getAllCommentsWithDetails...');
    const result = await CommentService.getAllCommentsWithDetails();
    console.log('📝 Résultat:', result);
    
    if (result.error) {
      console.error('❌ Erreur du service:', result.message);
    } else {
      console.log('✅ Service OK, nombre de commentaires:', result.data?.length || 0);
      if (result.data && result.data.length > 0) {
        console.log('Premier commentaire:', result.data[0]);
      }
    }
  } catch (error) {
    console.error('❌ Erreur catch:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCommentService();
