import { Injectable, inject, NgZone } from '@angular/core';
import {
  type FirebaseApp,
  type FirebaseOptions,
  initializeApp,
} from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly ngZone = inject(NgZone);
  private app!: FirebaseApp;

  public init(options: FirebaseOptions): void {
    if (this.app) return;
    this.app = this.ngZone.runOutsideAngular(() => initializeApp(options));
  }

  public getApp(): FirebaseApp {
    return this.app;
  }
}
