const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = '1234@@';
  const saltRounds = 12;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Senha:', password);
    console.log('Hash gerado:', hash);
    
    // Verificar se o hash está correto
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash válido:', isValid);
    
    console.log('\nSQL para atualizar:');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE username = 'Admin';`);
  } catch (error) {
    console.error('Erro:', error);
  }
}

generateHash();
