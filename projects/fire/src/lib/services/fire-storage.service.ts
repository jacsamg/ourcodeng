import { Injectable, inject, NgZone } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import {
  connectStorageEmulator,
  deleteObject,
  type FirebaseStorage,
  getDownloadURL,
  getStorage,
  ref,
  type StorageReference,
  type UploadMetadata,
  type UploadResult,
  uploadBytes,
} from 'firebase/storage';
import { defaultEmulatorconfig } from '../data/firebase.data';
import type { FirebaseEmulatorConfig } from '../types/firebase.types';

@Injectable({
  providedIn: 'root',
})
export class FireStorageService {
  private readonly ngZone = inject(NgZone);

  private instance!: FirebaseStorage;

  public init(
    fireApp: FirebaseApp,
    emulatorConfig: FirebaseEmulatorConfig = defaultEmulatorconfig,
  ): void {
    if (this.instance) return;

    this.instance = this.ngZone.runOutsideAngular(() => {
      const instance = getStorage(fireApp);

      if (emulatorConfig.enable) {
        const emulator = emulatorConfig.storage;
        connectStorageEmulator(instance, emulator.host, emulator.port);
      }

      return instance;
    });
  }

  public ref(path?: string): StorageReference {
    return ref(this.instance, path);
  }

  public uploadBytes(
    path: string | StorageReference,
    data: Blob | Uint8Array | ArrayBuffer,
    metadata?: UploadMetadata,
  ): Promise<UploadResult> {
    const ref = typeof path === 'string' ? this.ref(path) : path;
    return this.ngZone.runOutsideAngular(() => {
      return uploadBytes(ref, data, metadata);
    });
  }

  public getDownloadURL(ref: StorageReference): Promise<string> {
    return this.ngZone.runOutsideAngular(() => {
      return getDownloadURL(ref);
    });
  }

  public deleteFile(path: string): Promise<void> {
    const ref = this.ref(path);
    return this.ngZone.runOutsideAngular(() => {
      return deleteObject(ref);
    });
  }
}
