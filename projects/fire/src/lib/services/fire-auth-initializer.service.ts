import { inject, Service } from '@angular/core';
import {
  type Auth,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
  type Persistence,
  type PopupRedirectResolver,
  type User,
} from 'firebase/auth';
import { ReplaySubject } from 'rxjs';
import { FirebaseService } from './firebase.service';

@Service()
export class FireAuthInitializerService {
  private readonly firebase = inject(FirebaseService);
  private instance: Auth | null = null;

  private readonly currentUserSubject = new ReplaySubject<User | null>(1);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly currentUserStateSubject = new ReplaySubject<boolean>(1);
  public readonly currentUserState$ =
    this.currentUserStateSubject.asObservable();

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

    if (this.firebase.enabledEmulators) {
      const emulator = this.firebase.emulatorConfig.auth;

      connectAuthEmulator(
        this.instance,
        `http://${emulator.host}:${emulator.port}`,
        { disableWarnings: true },
      );
    }

    this.instance.onAuthStateChanged((user: User | null) => {
      this.currentUserSubject.next(user);
      this.currentUserStateSubject.next(!!user);
    });
  }

  public getInstance(): Auth {
    if (!this.instance) {
      throw new Error('Auth instance not initialized. Call init() first.');
    }

    return this.instance;
  }
}
