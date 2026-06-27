import { inject, Service } from '@angular/core';
import {
  FacebookAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from 'firebase/auth';
import { FireAuthService } from './fire-auth.service';

@Service()
export class FireAuthFacebookService {
  private readonly fireAuth = inject(FireAuthService);
  private readonly provider = new FacebookAuthProvider();

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
