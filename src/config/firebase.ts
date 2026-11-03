import fs from "fs";
import path from "path";
import * as admin from "firebase-admin";

const file = path.resolve(process.cwd(), "firebase.json");

if (fs.existsSync(file)) {
    const serviceAccount = JSON.parse(fs.readFileSync(file, "utf8"));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export const firebaseReady = admin.apps.length > 0;

export default admin;
