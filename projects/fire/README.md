# Fire 🔥

- Angular services and utilities to work with Firebase
- Install with `npm i @ourcodeng/fire`

## Quick Start

```ts
firebaseService.init(firebaseOptions, enableEmulators, emulatorConfig);
await fireAuthService.init();
firestoreService.init(['(default)']);
fireStorageService.init();
```

Use `enableEmulators` as the boolean switch and `emulatorConfig` only for host/port values.
