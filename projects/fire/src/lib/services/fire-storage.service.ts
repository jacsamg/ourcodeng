import { inject, Service } from '@angular/core';
import {
  connectStorageEmulator,
  type FirebaseStorage,
  getStorage,
} from 'firebase/storage';
import { FirebaseService } from './firebase.service';

@Service()
export class FireStorageService {
  private readonly firebase = inject(FirebaseService);
  private instance: FirebaseStorage | null = null;

  public init(): void {
    if (this.instance) return;

    this.instance = getStorage(this.firebase.getApp());

    if (this.firebase.enabledEmulators) {
      const emulator = this.firebase.emulatorConfig.storage;
      connectStorageEmulator(this.instance, emulator.host, emulator.port);
    }
  }

  public getInstance(): FirebaseStorage {
    if (!this.instance) {
      throw new Error('Firebase Storage is not initialized');
    }

    return this.instance;
  }
}
