import type { FirebaseEmulatorConfig } from '../types/firebase.types';

export const defaultEmulatorconfig: FirebaseEmulatorConfig = {
  auth: {
    // Usar localhost para coincidir con la URL del cliente y prevenir fallos en redirect de social OAuth
    host: 'localhost',
    port: 9099,
  },
  firestore: {
    host: 'localhost',
    port: 8080,
  },
  storage: {
    host: 'localhost',
    port: 9199,
  },
};
