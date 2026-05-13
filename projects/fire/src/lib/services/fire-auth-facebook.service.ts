import { Injectable, inject } from '@angular/core';
import {
  type Auth,
  browserLocalPersistence,
  FacebookAuthProvider,
  getRedirectResult,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from 'firebase/auth';
import { FireAuthService } from './fire-auth.service';

@Injectable({
  providedIn: 'root',
})
export class FireAuthFacebookService {
  private readonly fireAuth = inject(FireAuthService);
  private readonly provider = new FacebookAuthProvider();

  public async signInWithPopup(): Promise<UserCredential> {
    const auth = await this.getAuthInstance();
    return signInWithPopup(auth, this.provider);
  }

  public async signInWithRedirect(): Promise<void> {
    const auth = await this.getAuthInstance();
    await signInWithRedirect(auth, this.provider);
  }

  public async getRedirectResult(): Promise<UserCredential | null> {
    const auth = await this.getAuthInstance();
    return getRedirectResult(auth);
  }

  private async getAuthInstance(): Promise<Auth> {
    const auth = this.fireAuth.getInstance();
    await setPersistence(auth, browserLocalPersistence);

    return auth;
  }
}
