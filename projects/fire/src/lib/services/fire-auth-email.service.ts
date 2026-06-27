import { Injectable, inject } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
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

  public createUserWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserCredential> {
    return createUserWithEmailAndPassword(
      this.fireAuth.getInstance(),
      email,
      password,
    );
  }

  public signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserCredential> {
    return signInWithEmailAndPassword(
      this.fireAuth.getInstance(),
      email,
      password,
    );
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
}
