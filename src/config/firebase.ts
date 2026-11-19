import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let firebaseInitialized = false;

export const initFirebase = () => {
  if (firebaseInitialized) return admin;

  try {
    let credential: admin.ServiceAccount | null = null;

    // 1. Cek dari Environment Variable FIREBASE_SERVICE_ACCOUNT
    const envServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (envServiceAccount) {
      try {
        if (envServiceAccount.trim().startsWith('{')) {
          credential = JSON.parse(envServiceAccount);
        } else {
          // Coba parse base64 jika di-encode
          const decoded = Buffer.from(envServiceAccount, 'base64').toString('utf-8');
          if (decoded.trim().startsWith('{')) {
            credential = JSON.parse(decoded);
          }
        }
      } catch (e) {
        console.warn('[Firebase] Gagal mem-parse FIREBASE_SERVICE_ACCOUNT dari env:', e);
      }
    }

    // 2. Jika tidak ada di env, baca dari file lokal di folder keys
    if (!credential) {
      const keyPaths = [
        path.resolve(process.cwd(), 'keys/firebase-service-account.json'),
        path.resolve(__dirname, '../../keys/firebase-service-account.json'),
        path.resolve(process.cwd(), 'firebase-service-account.json'),
      ];

      for (const p of keyPaths) {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf-8');
          credential = JSON.parse(content);
          break;
        }
      }
    }

    if (credential) {
      admin.initializeApp({
        credential: admin.credential.cert(credential),
      });
      firebaseInitialized = true;
      console.log('Firebase Admin SDK berhasil diinisialisasi untuk project:', credential.projectId);
    } else {
      console.warn('[Firebase] Kredensial Firebase Service Account tidak ditemukan. Fitur Push Notification FCM nonaktif.');
    }
  } catch (err) {
    console.error('[Firebase] Gagal inisialisasi Firebase Admin SDK:', err);
  }

  return admin;
};

export const getFirebaseMessaging = () => {
  if (!firebaseInitialized) {
    initFirebase();
  }
  return firebaseInitialized ? admin.messaging() : null;
};
