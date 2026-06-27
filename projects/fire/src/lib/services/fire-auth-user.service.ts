import { inject, Service } from '@angular/core';
import type { Auth, User } from 'firebase/auth';
import { ReplaySubject } from 'rxjs';
import { FireAuthInitializerService } from './fire-auth-initializer.service';

@Service()
export class FireAuthUserService {
  private readonly authInitializer = inject(FireAuthInitializerService);

  private bootstrapped = false;

  private readonly currentUserSubject = new ReplaySubject<User | null>(1);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly currentUserStateSubject = new ReplaySubject<boolean>(1);
  public readonly currentUserState$ =
    this.currentUserStateSubject.asObservable();

  public async init(): Promise<void> {
    if (this.bootstrapped) return;

    this.getInstance().onAuthStateChanged((user: User | null) => {
      this.currentUserSubject.next(user);
      this.currentUserStateSubject.next(!!user);
    });

    this.bootstrapped = true;
  }

  public getInstance(): Auth {
    return this.authInitializer.getInstance();
  }
}
