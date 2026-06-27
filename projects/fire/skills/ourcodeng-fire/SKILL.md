---
name: ourcodeng-fire
description: Integration guide for application developers consuming @ourcodeng/fire from node_modules. Use when an agent needs to implement or fix Firebase setup in an Angular app using this package, including app initialization, Auth initialization with caller-controlled persistence/popup-redirect resolver, Auth flows, Firestore (single or multiple databases), Storage, emulator config, token/custom-claims access, and dependency-injected service usage in app code.
---

# Ourcodeng Fire

## Overview

Use this skill when working in an Angular app that already has `@ourcodeng/fire` installed.

Implement integration in app code. Do not modify `node_modules`.

## Quick Intake

Determine the user goal before coding:

- Bootstrap: initialize Firebase app and dependent services.
- Auth: initialize persistence/resolver, login/logout, reset password, update email/password, token or claims.
- Firestore: default DB or named DB instances.
- Storage: initialize and use Firebase Storage instance.
- Emulators: customize host/port and enable/disable by environment.

Read `references/api-map.md` first for ready-to-use patterns.

## Use Package Exports

Import only from `@ourcodeng/fire` in the consumer app:

```ts
import { FirebaseService, FireAuthService, FireAuthEmailService, FireAuthFacebookService, FireAuthGoogleService, FirestoreService, FireStorageService, type FirebaseEmulatorConfig } from "@ourcodeng/fire";
```

Prefer these services instead of duplicating SDK bootstrap logic.

## Initialization Pattern

Apply this sequence in app startup logic (for example, app initializer or root service):

1. `firebaseService.init(firebaseOptions, enableEmulators?, emulatorConfig?)`
2. `await fireAuthService.init(persistence?, popupRedirectResolver?)`
3. `firestoreService.init(dbNames)`
4. `fireStorageService.init()`

Pass all required Firestore DB names up front.

`firebaseService.getApp()` throws `Firebase app is not initialized` when used before `firebaseService.init(...)`; treat that as a bootstrap ordering error.

## Auth Pattern

Use `FireAuthService` for auth initialization, caller-selected persistence/popup-redirect resolver, shared auth state, token access, and sign-out:

- `getInstance`
- `signOut`
- `getIdToken`
- `getIdTokenResult`
- `getCustomClaims<T>`

`FireAuthService.init(...)` defaults to `indexedDBLocalPersistence` and `browserPopupRedirectResolver`. Pass Firebase Auth SDK values when the app needs different behavior, for example `browserSessionPersistence`, `inMemoryPersistence`, or `undefined` as the resolver when popup/redirect support should not be installed.

Example:

```ts
import {
  browserPopupRedirectResolver,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";

await fireAuthService.init(indexedDBLocalPersistence, browserPopupRedirectResolver);
await fireAuthService.init(browserSessionPersistence);
await fireAuthService.init(inMemoryPersistence, undefined);
```

Use `FireAuthEmailService` for email/password account creation, auth, and account management:

- `createUserWithEmailAndPassword`
- `signInWithEmailAndPassword`
- `sendPasswordResetEmail`
- `updateEmail`
- `updatePassword`

`updateEmail` reauthenticates with the current password, sends verification to the new email through Firebase Auth, and completes the email change after the user verifies it. `updatePassword` reauthenticates with the current password before changing it.

Use `FireAuthGoogleService` for Google auth:

- `signInWithPopup` for popup login or registration
- `signInWithRedirect` to start redirect login or registration
- `getRedirectResult` after returning from redirect

Use `FireAuthFacebookService` for Facebook auth:

- `signInWithPopup` for popup login or registration
- `signInWithRedirect` to start redirect login or registration
- `getRedirectResult` after returning from redirect

Use `currentUser$` and `currentUserState$` for reactive auth state in components/services.

Google and Facebook services use the already-initialized `FireAuthService` instance. Configure popup/redirect behavior in `FireAuthService.init(...)` before calling those provider services.

## Firestore Pattern

Initialize with DB names once, then resolve instances by name:

- `firestoreService.init(['(default)', 'analytics'])`
- `firestoreService.getDbInstance()` for default DB
- `firestoreService.getDbInstance('analytics')` for named DB

Treat `Firestore instance not found` as configuration error in app bootstrap.

## Storage Pattern

Initialize Storage before resolving the SDK instance:

- `fireStorageService.init()`
- `fireStorageService.getInstance()`

Treat `Firebase Storage is not initialized` as a bootstrap ordering error; call `fireStorageService.init()` before any storage read/write code asks for the instance.

## Emulator Pattern

Configure emulators from `FirebaseService`:

- Enable only in local/dev environments unless explicitly requested.
- Keep auth/firestore/storage host-port values aligned with local emulator suite.
- Pass the boolean flag separately from the port config object.

Example:

```ts
firebaseService.init(firebaseOptions, true, {
  auth: { host: "127.0.0.1", port: 9099 },
  firestore: { host: "127.0.0.1", port: 8080 },
  storage: { host: "127.0.0.1", port: 9199 },
});
```

If the app already has an environment config system, wire emulator config through it.

## Guardrails

Before finishing changes:

1. Ensure all calls happen after corresponding `init` methods.
2. Ensure Auth persistence and popup/redirect resolver choices match the target runtime.
3. Ensure all Firestore DB names used by app code are included during init.
4. Ensure token/claims calls happen only with authenticated users.
5. Check for explicit initialization errors: `Firebase app is not initialized`, `Auth instance not initialized. Call init() first.`, `Firestore instance not found for dbName`, and `Firebase Storage is not initialized`.
6. Keep changes in consumer app files; avoid editing library internals.

## Validation Checklist

1. Run consumer app build/tests relevant to modified files.
2. Validate login/logout and one Firestore read/write flow.
3. Validate emulator behavior only in environments where it is enabled.

If full validation cannot run, report exactly what was skipped.

## References

Read `references/api-map.md` for method signatures and copy-paste snippets.
