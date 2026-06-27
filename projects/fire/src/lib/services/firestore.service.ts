import { inject, Service } from '@angular/core';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { FIRESTORE_DEFAULT_DB_NAME } from '../data/firestore.data';
import { FirebaseService } from './firebase.service';

@Service()
export class FirestoreService {
  private readonly firebase = inject(FirebaseService);

  private readonly dbNames: string[] = [];

  private dbInstances: Map<string, Firestore> = new Map();
  private bootstraped = false;
  private initPromise: Promise<void> | null = null;

  public initDbNames(dbNames?: string | string[] | null): void {
    if (this.bootstraped) {
      throw new Error('Cannot initialize database names after bootstrap.');
    }

    if (this.initPromise) {
      throw new Error(
        'Cannot initialize database names while bootstrap is running.',
      );
    }

    this.dbNames.push(...this.normalizeDbNames(dbNames));
  }

  public async init(dbNames?: string | string[] | null): Promise<void> {
    if (this.bootstraped) return;

    this.initPromise ??= this.bootstrap(dbNames).catch((error: unknown) => {
      this.initPromise = null;
      throw error;
    });

    return this.initPromise;
  }

  public async getDbInstance(
    dbName: string = FIRESTORE_DEFAULT_DB_NAME,
  ): Promise<Firestore> {
    if (!this.bootstraped) {
      await this.init();
    }

    const instance = this.dbInstances.get(dbName);
    if (!instance) {
      throw new Error(`Firestore instance not found for dbName: ${dbName}`);
    }

    return instance;
  }

  private async bootstrap(dbNames?: string | string[] | null): Promise<void> {
    const names = new Set([...this.dbNames, ...this.normalizeDbNames(dbNames)]);
    if (names.size === 0) {
      throw new Error(
        'No Firestore database names provided for initialization.',
      );
    }

    for (const dbName of names) {
      const instance = getFirestore(this.firebase.getApp(), dbName);

      await this.connectEmulatorIfEnabled(instance);

      this.dbInstances.set(dbName, instance);
    }

    this.bootstraped = true;
  }

  private normalizeDbNames(dbNames?: string | string[] | null): string[] {
    if (Array.isArray(dbNames)) {
      return dbNames.length > 0 ? dbNames : [FIRESTORE_DEFAULT_DB_NAME];
    }

    if (typeof dbNames === 'string') {
      return [dbNames];
    }

    return [FIRESTORE_DEFAULT_DB_NAME];
  }

  private async connectEmulatorIfEnabled(instance: Firestore): Promise<void> {
    if (!this.firebase.enabledEmulators) return;

    const emulator = this.firebase.emulatorConfig.firestore;
    const { connectFirestoreEmulator } = await import('firebase/firestore');

    connectFirestoreEmulator(instance, emulator.host, emulator.port);
  }
}
