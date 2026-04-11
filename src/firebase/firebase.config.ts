import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Load service account from environment variable
const getServiceAccount = (): ServiceAccount | null => {
  const saContent = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!saContent) return null;
  try {
    return JSON.parse(saContent) as ServiceAccount;
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error);
    return null;
  }
};

const serviceAccount = getServiceAccount();

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else if (!serviceAccount) {
  console.warn('FIREBASE_SERVICE_ACCOUNT not found in environment variables.');
}

export default admin;
