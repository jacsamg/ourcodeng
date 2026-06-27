import { inject, Service } from '@angular/core';
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from 'firebase/auth';
import { FireAuthUserService } from './fire-auth-user.service';

@Service()
export class FireAuthGoogleService {
  private readonly fireAuth = inject(FireAuthUserService);
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
