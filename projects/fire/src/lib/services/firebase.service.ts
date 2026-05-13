import { Injectable } from '@angular/core';
import {
  type FirebaseApp,
  type FirebaseOptions,
  initializeApp,
} from 'firebase/app';
import { defaultEmulatorconfig } from '../data/firebase.data';
import type { FirebaseEmulatorConfig } from '../types/firebase.types';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp | null = null;
  enabledEmulators = false;
  emulatorConfig: FirebaseEmulatorConfig = defaultEmulatorconfig;

  public init(
    options: FirebaseOptions,
    enableEmulators?: boolean,
    emulatorConfig?: FirebaseEmulatorConfig,
  ): void {
    if (this.app) return;

    if (enableEmulators !== undefined) {
      this.enabledEmulators = enableEmulators;
    }

    if (emulatorConfig !== undefined) {
      this.emulatorConfig = emulatorConfig;
    }

    this.app = initializeApp(options);
  }

  public getApp(): FirebaseApp {
    if (!this.app) {
      throw new Error('Firebase app is not initialized');
    }

    return this.app;
  }
}
