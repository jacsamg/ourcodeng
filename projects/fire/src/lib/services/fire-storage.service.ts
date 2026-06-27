import { inject, Service } from '@angular/core';
import type { FirebaseStorage } from 'firebase/storage';
import { FirebaseService } from './firebase.service';

@Service()
export class FireStorageService {
  private readonly firebase = inject(FirebaseService);
  private instance: FirebaseStorage | null = null;
  private initPromise: Promise<FirebaseStorage> | null = null;

  public async init(): Promise<FirebaseStorage> {
    if (this.instance) return this.instance;

    this.initPromise ??= this.createInstance().catch((error: unknown) => {
      this.initPromise = null;
      throw error;
    });

    return this.initPromise;
  }

  public async getInstance(): Promise<FirebaseStorage> {
    return this.instance ?? this.init();
  }

  private async createInstance(): Promise<FirebaseStorage> {
    const { getStorage } = await import('firebase/storage');
    const instance = getStorage(this.firebase.getApp());

    await this.connectEmulatorIfEnabled(instance);

    this.instance = instance;
    return this.instance;
  }

  private async connectEmulatorIfEnabled(
    instance: FirebaseStorage,
  ): Promise<void> {
    if (!this.firebase.enabledEmulators) return;

    const emulator = this.firebase.emulatorConfig.storage;
    const { connectStorageEmulator } = await import('firebase/storage');

    connectStorageEmulator(instance, emulator.host, emulator.port);
  }
}
