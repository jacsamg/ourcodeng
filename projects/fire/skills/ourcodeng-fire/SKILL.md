---
name: ourcodeng-fire
description: Integration guide for application developers consuming @ourcodeng/fire from node_modules. Use when an agent needs to implement or fix Firebase setup in an Angular app using this package, including app initialization, Auth flows, Firestore (single or multiple databases), Storage, emulator config, token/custom-claims access, and dependency-injected service usage in app code.
---

# Ourcodeng Fire

## Overview

Use this skill when working in an Angular app that already has `@ourcodeng/fire` installed.

Implement integration in app code. Do not modify `node_modules`.

## Quick Intake

Determine the user goal before coding:

- Bootstrap: initialize Firebase app and dependent services.
- Auth: login/logout, reset password, update email/password, token or claims.
- Firestore: default DB or named DB instances.
- Storage: initialize and use Firebase Storage instance.
- Emulators: customize host/port and enable/disable by environment.

Read `references/api-map.md` first for ready-to-use patterns.

## Use Package Exports

Import only from `@ourcodeng/fire` in the consumer app:

```ts
import {
  FirebaseService,
  FireAuthService,
  FirestoreService,
  FireStorageService,
  type FirebaseEmulatorConfig,
} from '@ourcodeng/fire';
```

Prefer these services instead of duplicating SDK bootstrap logic.

## Initialization Pattern

Apply this sequence in app startup logic (for example, app initializer or root service):

1. `firebaseService.init(firebaseOptions, enableEmulators?, emulatorConfig?)`
2. `await fireAuthService.init()`
3. `firestoreService.init(dbNames)`
4. `fireStorageService.init()`

Pass all required Firestore DB names up front.

## Auth Pattern

Use wrapper methods in `FireAuthService`:

- `signInWithEmailAndPassword`
- `signOut`
- `sendPasswordResetEmail`
- `updateEmail`
- `updatePassword`
- `getIdToken`
- `getIdTokenResult`
- `getCustomClaims<T>`

Use `currentUser$` and `currentUserState$` for reactive auth state in components/services.

## Firestore Pattern

Initialize with DB names once, then resolve instances by name:

- `firestoreService.init(['(default)', 'analytics'])`
- `firestoreService.getDbInstance()` for default DB
- `firestoreService.getDbInstance('analytics')` for named DB

Treat `Firestore instance not found` as configuration error in app bootstrap.

## Emulator Pattern

Configure emulators from `FirebaseService`:

- Enable only in local/dev environments unless explicitly requested.
- Keep auth/firestore/storage host-port values aligned with local emulator suite.
- Pass the boolean flag separately from the port config object.

Example:

```ts
firebaseService.init(firebaseOptions, true, {
  auth: { host: '127.0.0.1', port: 9099 },
  firestore: { host: '127.0.0.1', port: 8080 },
  storage: { host: '127.0.0.1', port: 9199 },
});
```

If the app already has an environment config system, wire emulator config through it.

## Guardrails

Before finishing changes:

1. Ensure all calls happen after corresponding `init` methods.
2. Ensure all Firestore DB names used by app code are included during init.
3. Ensure token/claims calls happen only with authenticated users.
4. Keep changes in consumer app files; avoid editing library internals.

## Validation Checklist

1. Run consumer app build/tests relevant to modified files.
2. Validate login/logout and one Firestore read/write flow.
3. Validate emulator behavior only in environments where it is enabled.

If full validation cannot run, report exactly what was skipped.

## References

Read `references/api-map.md` for method signatures and copy-paste snippets.
