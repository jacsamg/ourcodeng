import { Injectable, inject } from '@angular/core';
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from 'firebase/auth';
import { FireAuthService } from './fire-auth.service';

@Injectable({
  providedIn: 'root',
})
export class FireAuthGoogleService {
  private readonly fireAuth = inject(FireAuthService);
  private readonly provider = new GoogleAuthProvider();

  public signInWithPopup(): Promise<UserCredential> {
    return signInWithPopup(this.fireAuth.getInstance(), this.provider);
  }

  public signInWithRedirect(): Promise<void> {
    return signInWithRedirect(this.fireAuth.getInstance(), this.provider);
  }

  public getRedirectResult(): Promise<UserCredential | null> {
    return getRedirectResult(this.fireAuth.getInstance());
  }
}
