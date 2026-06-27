import { inject, Service } from '@angular/core';
import {
  type Auth,
  getIdToken,
  getIdTokenResult,
  type IdTokenResult,
  type ParsedToken,
  type User,
} from 'firebase/auth';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { FireAuthInitializerService } from './fire-auth-initializer.service';

@Service()
export class FireAuthService {
  private readonly authInitializer = inject(FireAuthInitializerService);

  private readonly currentUserSubject = new ReplaySubject<User | null>(1);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly currentUserStateSubject = new ReplaySubject<boolean>(1);
  public readonly currentUserState$ =
    this.currentUserStateSubject.asObservable();

  public getInstance(): Auth {
    return this.authInitializer.getInstance();
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
