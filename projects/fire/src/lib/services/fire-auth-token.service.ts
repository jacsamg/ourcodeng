import { inject, Service } from '@angular/core';
import {
  getIdToken,
  getIdTokenResult,
  type IdTokenResult,
  type ParsedToken,
  type User,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { FireAuthUserService } from './fire-auth-user.service';

@Service()
export class FireAuthTokenService {
  private readonly authUser = inject(FireAuthUserService);

  public async getIdToken(refresh?: boolean): Promise<string> {
    const currentUserSubject = await firstValueFrom(this.authUser.currentUser$);
    return getIdToken(<User>currentUserSubject, refresh);
  }

  public async getIdTokenResult(refresh?: boolean): Promise<IdTokenResult> {
    const currentUserSubject = await firstValueFrom(this.authUser.currentUser$);
    return getIdTokenResult(<User>currentUserSubject, refresh);
  }

  public async getCustomClaims<T>(refresh?: boolean): Promise<T & ParsedToken> {
    const token = await this.getIdTokenResult(refresh);
    return <T & ParsedToken>(token.claims as unknown);
  }
}
