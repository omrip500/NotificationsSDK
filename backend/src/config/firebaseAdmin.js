import admin from "firebase-admin";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// פתרון ל־__dirname ב־ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// טען את JSON המפתח לשירות
const serviceAccount = JSON.parse(
  await readFile(
    path.join(
      __dirname,
      "push-notification-sdk-782ab-firebase-adminsdk-fbsvc-b360f96fba.json"
    ),
    "utf-8"
  )
);

// אתחול Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
