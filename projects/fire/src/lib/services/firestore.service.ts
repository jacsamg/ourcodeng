import { Injectable, inject, NgZone } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import {
  addDoc,
  type CollectionReference,
  collection,
  connectFirestoreEmulator,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  deleteDoc,
  doc,
  type Firestore,
  getDoc,
  getDocs,
  getFirestore,
  type Query,
  type QuerySnapshot,
  type SetOptions,
  setDoc,
  type UpdateData,
  updateDoc,
  type WithFieldValue,
} from 'firebase/firestore';
import { defaultEmulatorconfig } from '../data/firebase.data';
import type { FirebaseEmulatorConfig } from '../types/firebase.types';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private readonly ngZone = inject(NgZone);

  private dbInstances: Map<string, Firestore> = new Map();
  private bootstraped = false;

  public init(
    fireApp: FirebaseApp,
    dbNames: string[],
    emulatorConfig: FirebaseEmulatorConfig = defaultEmulatorconfig,
  ): void {
    if (this.bootstraped) return;

    this.ngZone.runOutsideAngular(() => {
      for (const dbName of dbNames) {
        const instance = getFirestore(fireApp, dbName);

        if (emulatorConfig.enable) {
          const emulator = emulatorConfig.firestore;
          connectFirestoreEmulator(instance, emulator.host, emulator.port);
        }

        this.dbInstances.set(dbName, instance);
      }
    });

    this.bootstraped = true;
  }

  private getDbInstance(dbName: string): Firestore {
    const instance = this.dbInstances.get(dbName);

    if (!instance) {
      throw new Error(`Firestore instance not found for dbName: ${dbName}`);
    }

    return instance;
  }

  public coll(
    dbName: string,
    collPath: string,
  ): CollectionReference<DocumentData> {
    return collection(this.getDbInstance(dbName), collPath);
  }

  public doc(dbName: string, docPath: string): DocumentReference<DocumentData> {
    return doc(this.getDbInstance(dbName), docPath);
  }

  public addDoc<T>(
    reference: CollectionReference<T>,
    data: WithFieldValue<T>,
  ): Promise<DocumentReference<T>> {
    return this.ngZone.runOutsideAngular(() => addDoc(reference, data));
  }

  public setDoc<T>(
    reference: DocumentReference<T>,
    data: WithFieldValue<T>,
    options?: SetOptions,
  ): Promise<void> {
    return this.ngZone.runOutsideAngular(() =>
      setDoc(reference, data, <SetOptions>options),
    );
  }

  public updateDoc<T, DbModelType extends DocumentData>(
    reference: DocumentReference<T>,
    data: UpdateData<DbModelType>,
  ): Promise<void> {
    return this.ngZone.runOutsideAngular(() => updateDoc(reference, data));
  }

  public async getDoc<T>(
    reference: DocumentReference<T>,
  ): Promise<DocumentSnapshot<T>> {
    return this.ngZone.runOutsideAngular(() => getDoc(reference));
  }

  public async getDocs<T>(query: Query<T>): Promise<QuerySnapshot<T>> {
    return this.ngZone.runOutsideAngular(() => getDocs(query));
  }

  public async deleteDoc<T>(reference: DocumentReference<T>): Promise<void> {
    return this.ngZone.runOutsideAngular(() => deleteDoc(reference));
  }
}
