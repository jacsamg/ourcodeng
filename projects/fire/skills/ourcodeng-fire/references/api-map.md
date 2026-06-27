# API Map for Consumers

Use this reference when coding in an Angular app that consumes `@ourcodeng/fire`.

## Imports

```ts
import { FirebaseService, FireAuthService, FireAuthEmailService, FireAuthFacebookService, FireAuthGoogleService, FirestoreService, FireStorageService, type FirebaseEmulatorConfig, type FirestoreUpdateData } from "@ourcodeng/fire";
import { browserPopupRedirectResolver, indexedDBLocalPersistence } from "firebase/auth";
```

## Startup Recipe

```ts
firebaseService.init(firebaseOptions, enableEmulators, emulatorConfig);
await fireAuthService.init(indexedDBLocalPersistence, browserPopupRedirectResolver);
firestoreService.init(["(default)"]);
fireStorageService.init();
```

## FirebaseService

- `init(options: FirebaseOptions, enableEmulators?: boolean, emulatorConfig?: FirebaseEmulatorConfig): void`
- `getApp(): FirebaseApp`

Purpose: initialize and expose `FirebaseApp` once, and centralize emulator enablement plus host/port configuration.

Notes:

- `getApp()` throws `Firebase app is not initialized` if called before `init(...)`.

## FirestoreService

- `init(dbNames?: string | string[] | null): void`
- `getDbInstance(dbName?: string): Firestore`

Notes:

- Default DB name is `'(default)'` when omitted.
- Throws if requested DB name was not initialized.
- Reads emulator state from `FirebaseService`.

## FireAuthService

- `init(persistence?: Persistence, popupRedirectResolver?: PopupRedirectResolver | undefined): Promise<void>`
- `getInstance(): Auth`
- `currentUser$` (`Observable<User | null>`)
- `currentUserState$` (`Observable<boolean>`)
- `signOut(): Promise<void>`
- `getIdToken(refresh?: boolean): Promise<string>`
- `getIdTokenResult(refresh?: boolean): Promise<IdTokenResult>`
- `getCustomClaims<T>(refresh?: boolean): Promise<T & ParsedToken>`

Notes:

- `init` defaults to `indexedDBLocalPersistence` and `browserPopupRedirectResolver`.
- Pass a Firebase Auth `Persistence` when the app needs a different session policy, such as `browserSessionPersistence` or `inMemoryPersistence`.
- Pass `undefined` as the second argument when the app should initialize Auth without popup/redirect resolver support.
- Configure popup/redirect resolver before using Google or Facebook provider services.
- Token and claims calls require authenticated user context.
- Reads emulator state from `FirebaseService`.

Examples:

```ts
import {
  browserPopupRedirectResolver,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";

await fireAuthService.init();
await fireAuthService.init(indexedDBLocalPersistence, browserPopupRedirectResolver);
await fireAuthService.init(browserSessionPersistence);
await fireAuthService.init(inMemoryPersistence, undefined);
```

## FireAuthEmailService

- `createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>`
- `signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>`
- `sendPasswordResetEmail(email: string): Promise<void>`
- `updateEmail(newEmail: string, password: string): Promise<void>`
- `updatePassword(currentPassword: string, nextPassword: string): Promise<void>`

Notes:

- Uses the initialized `FireAuthService` instance.
- `updateEmail` reauthenticates with the current password, sends verification to the new email through Firebase Auth, and completes the email change after the user verifies it.
- `updatePassword` requires reauthentication with the current password before changing it.

## FireAuthGoogleService

- `signInWithPopup(): Promise<UserCredential>`
- `signInWithRedirect(): Promise<void>`
- `getRedirectResult(): Promise<UserCredential | null>`

Notes:

- Google sign-in also registers first-time users.
- Uses the initialized `FireAuthService` instance and its configured popup/redirect resolver.

## FireAuthFacebookService

- `signInWithPopup(): Promise<UserCredential>`
- `signInWithRedirect(): Promise<void>`
- `getRedirectResult(): Promise<UserCredential | null>`

Notes:

- Facebook sign-in also registers first-time users.
- Uses the initialized `FireAuthService` instance and its configured popup/redirect resolver.

## FireStorageService

- `init(): void`
- `getInstance(): FirebaseStorage`

Purpose: expose configured Storage instance for app logic.
Reads emulator state from `FirebaseService`.

Notes:

- `getInstance()` throws `Firebase Storage is not initialized` if called before `init()`.

## Emulator Config Shape

```ts
interface FirebaseEmulatorConfig {
  auth: { host: string; port: number };
  firestore: { host: string; port: number };
  storage: { host: string; port: number };
}
```

Emulators are enabled separately:

```ts
firebaseService.init(firebaseOptions, true, emulatorConfig);
```

Typical local ports:

- Auth: `9099`
- Firestore: `8080`
- Storage: `9199`

## Common Failures and Fixes

- Error: Firestore instance not found for dbName
  - Fix: include that DB name in `firestoreService.init(dbNames)`.

- Error or undefined behavior from uninitialized services
  - Fix: run startup recipe before using auth/firestore/storage APIs.

- Error: Firebase app is not initialized
  - Fix: call `firebaseService.init(...)` before initializing Auth, Firestore, Storage, or calling `firebaseService.getApp()`.

- Error: Firebase Storage is not initialized
  - Fix: call `fireStorageService.init()` before `fireStorageService.getInstance()`.

- Claims/token reads failing
  - Fix: confirm user is signed in before requesting token/claims.

- Emulators not connecting
  - Fix: ensure `enableEmulators` is `true` in `firebaseService.init(...)`; host/port config alone does not enable them.
