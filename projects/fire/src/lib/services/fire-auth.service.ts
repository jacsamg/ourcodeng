import { Injectable, inject, NgZone } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import {
  type Auth,
  browserLocalPersistence,
  connectAuthEmulator,
  EmailAuthProvider,
  getAuth,
  getIdToken,
  getIdTokenResult,
  type IdTokenResult,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  type User,
  type UserCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { defaultEmulatorconfig } from '../data/firebase.data';
import { LOGGER_TAG } from '../data/logger.data';
import type { FirebaseEmulatorConfig } from '../types/firebase.types';

@Injectable({
  providedIn: 'root',
})
export class FireAuthService {
  private readonly ngZone = inject(NgZone);

  private instance!: Auth;

  private readonly currentUserSubject = new ReplaySubject<User | null>(1);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly currentUserStateSubject = new ReplaySubject<boolean>(1);
  public readonly currentUserState$ =
    this.currentUserStateSubject.asObservable();

  public async init(
    fireApp: FirebaseApp,
    emulatorConfig: FirebaseEmulatorConfig = defaultEmulatorconfig,
  ): Promise<void> {
    if (this.instance) return;

    console.info(LOGGER_TAG.STARTING, FireAuthService.name);
    this.instance = this.ngZone.runOutsideAngular(() => {
      const instance = getAuth(fireApp);

      if (emulatorConfig.enable) {
        const emulator = emulatorConfig.auth;

        connectAuthEmulator(
          instance,
          `http://${emulator.host}:${emulator.port}`,
          { disableWarnings: true },
        );
      }

      instance.onAuthStateChanged((user: User | null) =>
        this.ngZone.run(() => {
          this.currentUserSubject.next(user);
          this.currentUserStateSubject.next(!!user);
          console.info(LOGGER_TAG.INFO, 'Session:', true);
        }),
      );

      return instance;
    });
    console.info(LOGGER_TAG.STARTED, FireAuthService.name);
  }

  private async reauthenticateWithCredential(password: string): Promise<void> {
    const user = <User>await firstValueFrom(this.currentUser$);
    const credential = EmailAuthProvider.credential(
      <string>user.email,
      password,
    );

    await this.ngZone.runOutsideAngular(async () => {
      await reauthenticateWithCredential(user, credential);
    });
  }

  public async updateEmail(newEmail: string, password: string): Promise<void> {
    const user = <User>await firstValueFrom(this.currentUser$);

    await this.reauthenticateWithCredential(password);
    await this.ngZone.runOutsideAngular(async () => {
      await verifyBeforeUpdateEmail(user, newEmail);
    });
  }

  public async updatePassword(
    currentPassword: string,
    nextPassword: string,
  ): Promise<void> {
    const user = <User>await firstValueFrom(this.currentUser$);

    await this.reauthenticateWithCredential(currentPassword);
    await this.ngZone.runOutsideAngular(async () => {
      await updatePassword(user, nextPassword);
    });
  }

  public async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserCredential> {
    return this.ngZone.runOutsideAngular(async () => {
      await setPersistence(this.instance, browserLocalPersistence);
      return signInWithEmailAndPassword(this.instance, email, password);
    });
  }

  public async signOut(): Promise<void> {
    await this.ngZone.runOutsideAngular(async () => {
      await this.instance.signOut();
    });
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    if (!email) return;

    await this.ngZone.runOutsideAngular(async () => {
      await sendPasswordResetEmail(this.instance, email);
    });
  }

  public async getIdToken(refresh?: boolean): Promise<string> {
    const currentUserSubject = await firstValueFrom(this.currentUser$);
    return this.ngZone.runOutsideAngular(() =>
      getIdToken(<User>currentUserSubject, refresh),
    );
  }

  public async getIdTokenResult(refresh?: boolean): Promise<IdTokenResult> {
    const currentUserSubject = await firstValueFrom(this.currentUser$);
    return this.ngZone.runOutsideAngular(() =>
      getIdTokenResult(<User>currentUserSubject, refresh),
    );
  }

  public async getCustomClaims<T>(refresh?: boolean): Promise<T> {
    const token = await this.getIdTokenResult(refresh);
    return <T>(token.claims as unknown);
  }
}
