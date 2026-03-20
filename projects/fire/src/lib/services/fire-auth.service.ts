import { inject, Injectable } from '@angular/core';
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
  type ParsedToken,
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
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class FireAuthService {
  private readonly firebase = inject(FirebaseService);
  private instance!: Auth;

  private readonly currentUserSubject = new ReplaySubject<User | null>(1);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly currentUserStateSubject = new ReplaySubject<boolean>(1);
  public readonly currentUserState$ =
    this.currentUserStateSubject.asObservable();

  public async init(): Promise<void> {
    if (this.instance) return;

    this.instance = getAuth(this.firebase.getApp());

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

  private async reauthenticateWithCredential(password: string): Promise<void> {
    const user = <User>await firstValueFrom(this.currentUser$);
    const credential = EmailAuthProvider.credential(
      <string>user.email,
      password,
    );

    await reauthenticateWithCredential(user, credential);
  }

  public async updateEmail(newEmail: string, password: string): Promise<void> {
    const user = <User>await firstValueFrom(this.currentUser$);

    await this.reauthenticateWithCredential(password);
    await verifyBeforeUpdateEmail(user, newEmail);
  }

  public async updatePassword(
    currentPassword: string,
    nextPassword: string,
  ): Promise<void> {
    const user = <User>await firstValueFrom(this.currentUser$);

    await this.reauthenticateWithCredential(currentPassword);
    await updatePassword(user, nextPassword);
  }

  public async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserCredential> {
    await setPersistence(this.instance, browserLocalPersistence);
    return signInWithEmailAndPassword(this.instance, email, password);
  }

  public async signOut(): Promise<void> {
    await this.instance.signOut();
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    if (!email) return;
    await sendPasswordResetEmail(this.instance, email);
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
