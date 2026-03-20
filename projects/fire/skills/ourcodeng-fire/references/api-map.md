# API Map for Consumers

Use this reference when coding in an Angular app that consumes `@ourcodeng/fire`.

## Imports

```ts
import {
  FirebaseService,
  FireAuthService,
  FirestoreService,
  FireStorageService,
  type FirebaseEmulatorConfig,
  type FirestoreUpdateData,
} from '@ourcodeng/fire';
```

## Startup Recipe

```ts
firebaseService.init(firebaseOptions, enableEmulators, emulatorConfig);
await fireAuthService.init();
firestoreService.init(['(default)']);
fireStorageService.init();
```

## FirebaseService

- `init(options: FirebaseOptions, enableEmulators?: boolean, emulatorConfig?: FirebaseEmulatorConfig): void`
- `getApp(): FirebaseApp`

Purpose: initialize and expose `FirebaseApp` once, and centralize emulator enablement plus host/port configuration.

## FirestoreService

- `init(dbNames: string[]): void`
- `getDbInstance(dbName?: string): Firestore`

Notes:

- Default DB name is `'(default)'` when omitted.
- Throws if requested DB name was not initialized.
- Reads emulator state from `FirebaseService`.

## FireAuthService

- `init(): Promise<void>`
- `currentUser$` (`Observable<User | null>`)
- `currentUserState$` (`Observable<boolean>`)
- `signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>`
- `signOut(): Promise<void>`
- `sendPasswordResetEmail(email: string): Promise<void>`
- `updateEmail(newEmail: string, password: string): Promise<void>`
- `updatePassword(currentPassword: string, nextPassword: string): Promise<void>`
- `getIdToken(refresh?: boolean): Promise<string>`
- `getIdTokenResult(refresh?: boolean): Promise<IdTokenResult>`
- `getCustomClaims<T>(refresh?: boolean): Promise<T & ParsedToken>`

Notes:

- `updateEmail` and `updatePassword` require user reauthentication with current password.
- Token and claims calls require authenticated user context.
- Reads emulator state from `FirebaseService`.

## FireStorageService

- `init(): void`
- `getInstance(): FirebaseStorage`

Purpose: expose configured Storage instance for app logic.
Reads emulator state from `FirebaseService`.

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

- Claims/token reads failing
  - Fix: confirm user is signed in before requesting token/claims.

- Emulators not connecting
  - Fix: ensure `enableEmulators` is `true` in `firebaseService.init(...)`; host/port config alone does not enable them.
