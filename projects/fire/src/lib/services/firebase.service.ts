import { Injectable } from '@angular/core';
import {
  type FirebaseApp,
  type FirebaseOptions,
  initializeApp,
} from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app!: FirebaseApp;

  public init(options: FirebaseOptions): void {
    if (this.app) return;
    this.app = initializeApp(options);
  }

  public getApp(): FirebaseApp {
    return this.app;
  }
}
