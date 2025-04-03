import * as admin from "firebase-admin";

import serviceAccount from '../../cerdital-g-firebase-adminsdk-fbsvc-cbebc2bcee.json'; // Ajusta la ruta al JSON

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  export default admin;
