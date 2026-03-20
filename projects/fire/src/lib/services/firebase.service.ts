import { Injectable } from '@angular/core';
import {
  type FirebaseApp,
  type FirebaseOptions,
  initializeApp,
} from 'firebase/app';
import { FirebaseEmulatorConfig } from '../types/firebase.types';
import { defaultEmulatorconfig } from '../data/firebase.data';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app!: FirebaseApp;
  enabledEmulators = false;
  emulatorConfig: FirebaseEmulatorConfig = defaultEmulatorconfig;

  public init(
    options: FirebaseOptions,
    enableEmulators?: boolean,
    emulatorConfig?: FirebaseEmulatorConfig
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
    return this.app;
  }
}
