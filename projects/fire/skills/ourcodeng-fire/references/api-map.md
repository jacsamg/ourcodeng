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
firebaseService.init(firebaseOptions);
const app = firebaseService.getApp();

await fireAuthService.init(app, emulatorConfig);
firestoreService.init(app, ['(default)'], emulatorConfig);
fireStorageService.init(app, emulatorConfig);
```

## FirebaseService

- `init(options: FirebaseOptions): void`
- `getApp(): FirebaseApp`

Purpose: initialize and expose `FirebaseApp` once.

## FirestoreService

- `init(fireApp: FirebaseApp, dbNames: string[], emulatorConfig?: FirebaseEmulatorConfig): void`
- `getDbInstance(dbName?: string): Firestore`

Notes:

- Default DB name is `'(default)'` when omitted.
- Throws if requested DB name was not initialized.

## FireAuthService

- `init(fireApp: FirebaseApp, emulatorConfig?: FirebaseEmulatorConfig): Promise<void>`
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

## FireStorageService

- `init(fireApp: FirebaseApp, emulatorConfig?: FirebaseEmulatorConfig): void`
- `getInstance(): FirebaseStorage`

Purpose: expose configured Storage instance for app logic.

## Emulator Config Shape

```ts
interface FirebaseEmulatorConfig {
  enable: boolean;
  auth: { host: string; port: number };
  firestore: { host: string; port: number };
  storage: { host: string; port: number };
}
```

Typical local ports:

- Auth: `9099`
- Firestore: `8080`
- Storage: `9199`

## Common Failures and Fixes

- Error: Firestore instance not found for dbName
  - Fix: include that DB name in `firestoreService.init(..., dbNames, ...)`.

- Error or undefined behavior from uninitialized services
  - Fix: run startup recipe before using auth/firestore/storage APIs.

- Claims/token reads failing
  - Fix: confirm user is signed in before requesting token/claims.
