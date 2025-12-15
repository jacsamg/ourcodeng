import { Injectable } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import {
  connectStorageEmulator,
  type FirebaseStorage,
  getStorage,
} from 'firebase/storage';
import { defaultEmulatorconfig } from '../data/firebase.data';
import type { FirebaseEmulatorConfig } from '../types/firebase.types';

@Injectable({
  providedIn: 'root',
})
export class FireStorageService {
  private instance!: FirebaseStorage;

  public init(
    fireApp: FirebaseApp,
    emulatorConfig: FirebaseEmulatorConfig = defaultEmulatorconfig,
  ): void {
    if (this.instance) return;

    this.instance = getStorage(fireApp);

    if (emulatorConfig.enable) {
      const emulator = emulatorConfig.storage;
      connectStorageEmulator(this.instance, emulator.host, emulator.port);
    }
  }

  public getInstance(): FirebaseStorage {
    return this.instance;
  }
}
