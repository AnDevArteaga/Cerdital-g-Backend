import * as admin from "firebase-admin";

import serviceAccount from '../../firebase.json'; // Ajusta la ruta al JSON

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  export default admin;
