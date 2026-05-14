import { Injectable, inject } from '@angular/core';
import {
  type Auth,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  type User,
  type UserCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { FireAuthService } from './fire-auth.service';

@Injectable({
  providedIn: 'root',
})
export class FireAuthEmailService {
  private readonly fireAuth = inject(FireAuthService);

  public async createUserWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserCredential> {
    const auth = await this.getAuthInstance();
    return createUserWithEmailAndPassword(auth, email, password);
  }

  public async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserCredential> {
    const auth = await this.getAuthInstance();
    return signInWithEmailAndPassword(auth, email, password);
  }

  private async reauthenticateWithCredential(password: string): Promise<User> {
    const user = <User>await firstValueFrom(this.fireAuth.currentUser$);
    const credential = EmailAuthProvider.credential(
      <string>user.email,
      password,
    );

    await reauthenticateWithCredential(user, credential);
    return user;
  }

  public async updateEmail(newEmail: string, password: string): Promise<void> {
    const user = await this.reauthenticateWithCredential(password);
    await verifyBeforeUpdateEmail(user, newEmail);
  }

  public async updatePassword(
    currentPassword: string,
    nextPassword: string,
  ): Promise<void> {
    const user = await this.reauthenticateWithCredential(currentPassword);
    await updatePassword(user, nextPassword);
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    if (!email) return;
    await sendPasswordResetEmail(this.fireAuth.getInstance(), email);
  }

  private async getAuthInstance(): Promise<Auth> {
    const auth = this.fireAuth.getInstance();
    await setPersistence(auth, browserLocalPersistence);

    return auth;
  }
}
