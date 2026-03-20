import { inject, Injectable } from '@angular/core';
import {
  connectFirestoreEmulator,
  type Firestore,
  getFirestore,
} from 'firebase/firestore';
import { FIRESTORE_DEFAULT_DB_NAME } from '../data/firestore.data';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private readonly firebase = inject(FirebaseService);

  private dbInstances: Map<string, Firestore> = new Map();
  private bootstraped = false;

  public init(dbNames: string[]): void {
    if (this.bootstraped) return;

    for (const dbName of dbNames) {
      const instance = getFirestore(this.firebase.getApp(), dbName);

      if (this.firebase.enabledEmulators) {
        const emulator = this.firebase.emulatorConfig.firestore;
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
