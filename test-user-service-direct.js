// Test direct des logs serveur
const UserService = require('./src/services/UserService');

async function testUserUpdateDirect() {
  console.log('🔧 Test direct de UserService.updateUser\n');

  try {
    // Test 1: Récupération de l'utilisateur 1
    console.log('1️⃣ Test getUserById(1)...');
    const getResult = await UserService.getUserById(1);
    console.log('Résultat:', getResult);

    // Test 2: Mise à jour de l'utilisateur 1
    console.log('\n2️⃣ Test updateUser(1, {...})...');
    const updateData = { nom: 'Admin Debug' };
    const updateResult = await UserService.updateUser(1, updateData);
    console.log('Résultat:', updateResult);

    // Test 3: Récupération après mise à jour
    console.log('\n3️⃣ Test getUserById(1) après mise à jour...');
    const getResult2 = await UserService.getUserById(1);
    console.log('Résultat:', getResult2);

    // Test 4: Test avec ID sous forme de string
    console.log('\n4️⃣ Test updateUser("1", {...})...');
    const updateData2 = { nom: 'Admin Debug String' };
    const updateResult2 = await UserService.updateUser("1", updateData2);
    console.log('Résultat:', updateResult2);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }

  process.exit(0);
}

testUserUpdateDirect().catch(console.error);
