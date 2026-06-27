import { inject, Service } from '@angular/core';
import {
  type Auth,
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  initializeAuth,
  type Persistence,
  type PopupRedirectResolver,
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';

@Service()
export class FireAuthInitializerService {
  private readonly firebase = inject(FirebaseService);
  private instance: Auth | null = null;

  public async init(
    persistence: Persistence = indexedDBLocalPersistence,
    popupRedirectResolver:
      | PopupRedirectResolver
      | undefined = browserPopupRedirectResolver,
  ): Promise<void> {
    if (this.instance) return;

    this.instance = initializeAuth(this.firebase.getApp(), {
      persistence,
      popupRedirectResolver,
    });

    await this.connectEmulatorIfEnabled(this.instance);
  }

  public getInstance(): Auth {
    if (!this.instance) {
      throw new Error('Auth instance not initialized. Call init() first.');
    }

    return this.instance;
  }

  private async connectEmulatorIfEnabled(instance: Auth): Promise<void> {
    if (!this.firebase.enabledEmulators) return;

    const emulator = this.firebase.emulatorConfig.auth;
    const { connectAuthEmulator } = await import('firebase/auth');

    connectAuthEmulator(instance, `http://${emulator.host}:${emulator.port}`, {
      disableWarnings: true,
    });
  }
}
