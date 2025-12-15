import { Injectable } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  type Firestore,
  getFirestore,
} from 'firebase/firestore';
import { defaultEmulatorconfig } from '../data/firebase.data';
import { FIRESTORE_DEFAULT_DB_NAME } from '../data/firestore.data';
import type { FirebaseEmulatorConfig } from '../types/firebase.types';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private dbInstances: Map<string, Firestore> = new Map();
  private bootstraped = false;

  public init(
    fireApp: FirebaseApp,
    dbNames: string[],
    emulatorConfig: FirebaseEmulatorConfig = defaultEmulatorconfig,
  ): void {
    if (this.bootstraped) return;

    for (const dbName of dbNames) {
      const instance = getFirestore(fireApp, dbName);

      if (emulatorConfig.enable) {
        const emulator = emulatorConfig.firestore;
        connectFirestoreEmulator(instance, emulator.host, emulator.port);
      }

      this.dbInstances.set(dbName, instance);
    }

    this.bootstraped = true;
  }

  public getDbInstance(dbName: string = FIRESTORE_DEFAULT_DB_NAME): Firestore {
    const instance = this.dbInstances.get(dbName);

    if (!instance) {
      throw new Error(`Firestore instance not found for dbName: ${dbName}`);
    }

    return instance;
  }
}
