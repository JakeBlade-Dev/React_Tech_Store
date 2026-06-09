const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');

const serviceAccount = require('./firebase-credentials.json');

initializeApp({
  credential: cert(serviceAccount)
});

async function extractUsers() {
  try {
    const listUsersResult = await getAuth().listUsers(1000);
    const users = listUsersResult.users.map((u, index) => {
      return {
        id: index + 1000, // Fake ID para evitar choques
        firebase_uid: u.uid,
        nombre: u.displayName || u.email.split('@')[0],
        correo: u.email,
        rol: 'cliente',
        fecha_registro: u.metadata.creationTime,
        eliminado: false
      };
    });

    fs.writeFileSync('./public/usuarios.json', JSON.stringify(users, null, 2));
    console.log(`Guardados ${users.length} usuarios en public/usuarios.json`);
    process.exit(0);
  } catch (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }
}

extractUsers();
