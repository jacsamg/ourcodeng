# API Map for Consumers

Use this reference when coding in an Angular app that consumes `@ourcodeng/fire`.

## Imports

```ts
import { FirebaseService, FireAuthInitializerService, FireAuthUserService, FireAuthTokenService, FireAuthEmailService, FireAuthFacebookService, FireAuthGoogleService, FirestoreService, FireStorageService, type FirebaseEmulatorConfig, type FirestoreUpdateData } from "@ourcodeng/fire";
import { browserPopupRedirectResolver, indexedDBLocalPersistence } from "firebase/auth";
```

## Startup Recipe

```ts
firebaseService.init(firebaseOptions, enableEmulators, emulatorConfig);
await fireAuthInitializerService.init(indexedDBLocalPersistence, browserPopupRedirectResolver);
await fireAuthUserService.init();
await firestoreService.init(["(default)"]);
await fireStorageService.init();
```

## FirebaseService

- `init(options: FirebaseOptions, enableEmulators?: boolean, emulatorConfig?: FirebaseEmulatorConfig): void`
- `getApp(): FirebaseApp`

Purpose: initialize and expose `FirebaseApp` once, and centralize emulator enablement plus host/port configuration.

Notes:

- `getApp()` throws `Firebase app is not initialized` if called before `init(...)`.

## FirestoreService

- `initDbNames(dbNames?: string | string[] | null): void`
- `init(dbNames?: string | string[] | null): Promise<void>`
- `getDbInstance(dbName?: string): Promise<Firestore>`

Notes:

- Default DB name is `'(default)'` when omitted.
- Throws if requested DB name was not initialized.
- `initDbNames(...)` can register DB names before bootstrap; it throws if called after bootstrap or during bootstrap.
- `getDbInstance(...)` lazily calls `init()` if Firestore has not bootstrapped yet.
- Reads emulator state from `FirebaseService`.

## FireAuthInitializerService

- `init(persistence?: Persistence, popupRedirectResolver?: PopupRedirectResolver | undefined): Promise<void>`
- `getInstance(): Auth`

Notes:

- `init` defaults to `indexedDBLocalPersistence` and `browserPopupRedirectResolver`.
- Pass a Firebase Auth `Persistence` when the app needs a different session policy, such as `browserSessionPersistence` or `inMemoryPersistence`.
- Pass `undefined` as the second argument when the app should initialize Auth without popup/redirect resolver support.
- Configure popup/redirect resolver before using Google or Facebook provider services.
- Reads emulator state from `FirebaseService`.

Examples:

```ts
import {
  browserPopupRedirectResolver,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";

await fireAuthInitializerService.init();
await fireAuthInitializerService.init(indexedDBLocalPersistence, browserPopupRedirectResolver);
await fireAuthInitializerService.init(browserSessionPersistence);
await fireAuthInitializerService.init(inMemoryPersistence, undefined);
```

## FireAuthUserService

- `init(): Promise<void>`
- `getInstance(): Auth`
- `currentUser$` (`Observable<User | null>`)
- `currentUserState$` (`Observable<boolean>`)

Notes:

- Uses the initialized `FireAuthInitializerService` instance.
- Call `init()` once after Auth initialization to start publishing auth state.

## FireAuthTokenService

- `getIdToken(refresh?: boolean): Promise<string>`
- `getIdTokenResult(refresh?: boolean): Promise<IdTokenResult>`
- `getCustomClaims<T>(refresh?: boolean): Promise<T & ParsedToken>`

Notes:

- Uses `FireAuthUserService.currentUser$`.
- Token and claims calls require authenticated user context.

## FireAuthEmailService

- `createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>`
- `signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>`
- `sendPasswordResetEmail(email: string): Promise<void>`
- `updateEmail(newEmail: string, password: string): Promise<void>`
- `updatePassword(currentPassword: string, nextPassword: string): Promise<void>`

Notes:

- Uses the initialized `FireAuthUserService` instance.
- `updateEmail` reauthenticates with the current password, sends verification to the new email through Firebase Auth, and completes the email change after the user verifies it.
- `updatePassword` requires reauthentication with the current password before changing it.

## FireAuthGoogleService

- `signInWithPopup(): Promise<UserCredential>`
- `signInWithRedirect(): Promise<void>`
- `getRedirectResult(): Promise<UserCredential | null>`

Notes:

- Google sign-in also registers first-time users.
- Uses the initialized Auth instance and the popup/redirect resolver configured through `FireAuthInitializerService`.

## FireAuthFacebookService

- `signInWithPopup(): Promise<UserCredential>`
- `signInWithRedirect(): Promise<void>`
- `getRedirectResult(): Promise<UserCredential | null>`

Notes:

- Facebook sign-in also registers first-time users.
- Uses the initialized Auth instance and the popup/redirect resolver configured through `FireAuthInitializerService`.

## FireStorageService

- `init(): Promise<FirebaseStorage>`
- `getInstance(): Promise<FirebaseStorage>`

Purpose: expose configured Storage instance for app logic.
Reads emulator state from `FirebaseService`.

Notes:

- `getInstance()` lazily initializes Storage when needed.

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

- Claims/token reads failing
  - Fix: call `fireAuthUserService.init()` and confirm user is signed in before requesting token/claims.

- Emulators not connecting
  - Fix: ensure `enableEmulators` is `true` in `firebaseService.init(...)`; host/port config alone does not enable them.
