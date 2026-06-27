import { Injectable, inject } from '@angular/core';
import {
  type Auth,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  getIdToken,
  getIdTokenResult,
  type IdTokenResult,
  indexedDBLocalPersistence,
  initializeAuth,
  type ParsedToken,
  type Persistence,
  type PopupRedirectResolver,
  type User,
} from 'firebase/auth';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class FireAuthService {
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

  public async signOut(): Promise<void> {
    await this.getInstance().signOut();
  }

  public async getIdToken(refresh?: boolean): Promise<string> {
    const currentUserSubject = await firstValueFrom(this.currentUser$);
    return getIdToken(<User>currentUserSubject, refresh);
  }

  public async getIdTokenResult(refresh?: boolean): Promise<IdTokenResult> {
    const currentUserSubject = await firstValueFrom(this.currentUser$);
    return getIdTokenResult(<User>currentUserSubject, refresh);
  }

  public async getCustomClaims<T>(refresh?: boolean): Promise<T & ParsedToken> {
    const token = await this.getIdTokenResult(refresh);
    return <T & ParsedToken>(token.claims as unknown);
  }
}
