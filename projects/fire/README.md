# Fire

Servicios de Angular para inicializar Firebase y utilizar Auth, Firestore y
Storage desde una API pequeña y consistente.

```bash
npm i @ourcodeng/fire firebase
```

> `@ourcodeng/fire` asume que tu aplicacion ya tiene configurado Angular y que
> provees las opciones de Firebase de tu proyecto.

## Exportaciones

Importa todo desde `@ourcodeng/fire`:

```ts
import { FirebaseService, FireAuthService, FireAuthEmailService, FireAuthFacebookService, FireAuthGoogleService, FirestoreService, FireStorageService, type FirebaseEmulatorConfig, type FirestoreUpdateData } from "@ourcodeng/fire";
```

## Inicializacion

La inicializacion debe ocurrir una sola vez al arrancar la aplicacion, antes de
usar Auth, Firestore o Storage.

```ts
import { inject, Injectable } from "@angular/core";
import { FirebaseService, FireAuthService, FirestoreService, FireStorageService, type FirebaseEmulatorConfig } from "@ourcodeng/fire";
import { browserPopupRedirectResolver, indexedDBLocalPersistence } from "firebase/auth";
import { environment } from "../environments/environment";

@Injectable({ providedIn: "root" })
export class FirebaseBootstrapService {
  private readonly firebase = inject(FirebaseService);
  private readonly auth = inject(FireAuthService);
  private readonly firestore = inject(FirestoreService);
  private readonly storage = inject(FireStorageService);

  async init(): Promise<void> {
    const emulatorConfig: FirebaseEmulatorConfig = {
      auth: { host: "127.0.0.1", port: 9099 },
      firestore: { host: "127.0.0.1", port: 8080 },
      storage: { host: "127.0.0.1", port: 9199 },
    };

    this.firebase.init(environment.firebase, environment.useFirebaseEmulators, emulatorConfig);

    await this.auth.init(indexedDBLocalPersistence, browserPopupRedirectResolver);
    this.firestore.init(["(default)"]);
    this.storage.init();
  }
}
```

Orden recomendado:

1. `firebaseService.init(firebaseOptions, enableEmulators?, emulatorConfig?)`
2. `await fireAuthService.init(persistence?, popupRedirectResolver?)`
3. `firestoreService.init(dbNames?)`
4. `fireStorageService.init()`

`enableEmulators` es el interruptor que activa los emuladores. El objeto
`emulatorConfig` solo define host y puerto; pasarlo no activa los emuladores por
si mismo.

## FirebaseService

Inicializa y expone la instancia base de Firebase.

```ts
firebaseService.init(firebaseOptions);
const app = firebaseService.getApp();
```

API:

- `init(options, enableEmulators?, emulatorConfig?): void`
- `getApp(): FirebaseApp`

Si llamas `init` mas de una vez, las siguientes llamadas no vuelven a crear la
app.

`getApp()` lanza `Firebase app is not initialized` si se llama antes de
`init(...)`.

## Auth

`FireAuthService` inicializa Firebase Auth, expone el estado de sesion y permite
obtener tokens. Desde la version 4.0, `init` acepta la persistencia y el
resolver de popup/redirect que quieras usar en tu app.

```ts
await fireAuthService.init();

fireAuthService.currentUser$.subscribe((user) => {
  console.log(user?.email);
});

fireAuthService.currentUserState$.subscribe((isSignedIn) => {
  console.log(isSignedIn);
});

const token = await fireAuthService.getIdToken();
const claims = await fireAuthService.getCustomClaims<{ role?: string }>();

await fireAuthService.signOut();
```

API:

- `init(persistence?: Persistence, popupRedirectResolver?: PopupRedirectResolver | undefined): Promise<void>`
- `getInstance(): Auth`
- `currentUser$: Observable<User | null>`
- `currentUserState$: Observable<boolean>`
- `signOut(): Promise<void>`
- `getIdToken(refresh?: boolean): Promise<string>`
- `getIdTokenResult(refresh?: boolean): Promise<IdTokenResult>`
- `getCustomClaims<T>(refresh?: boolean): Promise<T & ParsedToken>`

Las llamadas a tokens y custom claims requieren que exista un usuario
autenticado.

Defaults de `init`:

- `persistence`: `indexedDBLocalPersistence`
- `popupRedirectResolver`: `browserPopupRedirectResolver`

Puedes mantener los defaults llamando `await fireAuthService.init()`, o pasar
opciones del SDK de Firebase Auth cuando necesites mas control:

```ts
import {
  browserSessionPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";

// Persistencia solo durante la sesion del navegador.
await fireAuthService.init(browserSessionPersistence);

// Sesion en memoria, util cuando no quieres persistir credenciales localmente.
await fireAuthService.init(inMemoryPersistence);

// Mantener la persistencia default, pero deshabilitar soporte popup/redirect.
await fireAuthService.init(indexedDBLocalPersistence, undefined);
```

Configura `popupRedirectResolver` cuando uses proveedores con popup o redirect
en entornos donde necesites controlar el resolver. Los servicios de Google y
Facebook usan la instancia ya inicializada por `FireAuthService`, asi que la
decision se toma en `init`.

### Email y password

Usa `FireAuthEmailService` para crear cuentas, iniciar sesion con correo y
password, restablecer password y administrar credenciales sensibles.

```ts
await fireAuthEmailService.createUserWithEmailAndPassword(email, password);
await fireAuthEmailService.signInWithEmailAndPassword(email, password);
await fireAuthEmailService.sendPasswordResetEmail(email);

await fireAuthEmailService.updateEmail(newEmail, currentPassword);
await fireAuthEmailService.updatePassword(currentPassword, nextPassword);
```

API:

- `createUserWithEmailAndPassword(email, password): Promise<UserCredential>`
- `signInWithEmailAndPassword(email, password): Promise<UserCredential>`
- `sendPasswordResetEmail(email): Promise<void>`
- `updateEmail(newEmail, password): Promise<void>`
- `updatePassword(currentPassword, nextPassword): Promise<void>`

`updateEmail` reautentica al usuario con su password actual y envia una
verificacion al nuevo correo mediante `verifyBeforeUpdateEmail`; Firebase aplica
el cambio cuando el usuario completa esa verificacion. `updatePassword`
reautentica antes de cambiar el password.

### Google

`FireAuthGoogleService` permite iniciar sesion con popup o redirect.

```ts
const credential = await fireAuthGoogleService.signInWithPopup();

await fireAuthGoogleService.signInWithRedirect();
const redirectCredential = await fireAuthGoogleService.getRedirectResult();
```

API:

- `signInWithPopup(): Promise<UserCredential>`
- `signInWithRedirect(): Promise<void>`
- `getRedirectResult(): Promise<UserCredential | null>`

### Facebook

`FireAuthFacebookService` tiene la misma forma de uso que Google.

```ts
const credential = await fireAuthFacebookService.signInWithPopup();

await fireAuthFacebookService.signInWithRedirect();
const redirectCredential = await fireAuthFacebookService.getRedirectResult();
```

API:

- `signInWithPopup(): Promise<UserCredential>`
- `signInWithRedirect(): Promise<void>`
- `getRedirectResult(): Promise<UserCredential | null>`

## Firestore

`FirestoreService` crea una o varias instancias de Firestore y las recupera por
nombre de base de datos.

```ts
firestoreService.init(["(default)", "analytics"]);

const db = firestoreService.getDbInstance();
const analyticsDb = firestoreService.getDbInstance("analytics");
```

API:

- `init(dbNames?: string | string[] | null): void`
- `getDbInstance(dbName?: string): Firestore`

Notas:

- Si no pasas `dbNames`, se inicializa `'(default)'`.
- Si pides una base de datos que no fue inicializada, se lanza
  `Firestore instance not found for dbName: ...`.
- Define todos los nombres de bases de datos al arrancar la aplicacion.

Ejemplo con SDK de Firebase:

```ts
import { collection, getDocs } from "firebase/firestore";

const db = firestoreService.getDbInstance();
const snapshot = await getDocs(collection(db, "users"));
```

`FirestoreUpdateData` es un tipo util para updates donde los valores pueden ser
`FieldValue`, objetos parciales, `null` o `undefined`.

```ts
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import type { FirestoreUpdateData } from "@ourcodeng/fire";

const data: FirestoreUpdateData = {
  displayName: "Ada",
  updatedAt: serverTimestamp(),
};

await updateDoc(doc(db, "users", userId), data);
```

## Storage

`FireStorageService` inicializa Firebase Storage y expone la instancia para usar
la API oficial de Firebase.

```ts
fireStorageService.init();

const storage = fireStorageService.getInstance();
```

API:

- `init(): void`
- `getInstance(): FirebaseStorage`

`getInstance()` lanza `Firebase Storage is not initialized` si se llama antes de
`init()`.

Ejemplo:

```ts
import { ref, uploadBytes } from "firebase/storage";

const storage = fireStorageService.getInstance();
const fileRef = ref(storage, `avatars/${userId}.png`);

await uploadBytes(fileRef, file);
```

## Emuladores

Los puertos por defecto utilizados por la libreria son:

- Auth: `127.0.0.1:9099`
- Firestore: `127.0.0.1:8080`
- Storage: `127.0.0.1:9199`

Puedes sobrescribirlos al inicializar Firebase:

```ts
const emulatorConfig: FirebaseEmulatorConfig = {
  auth: { host: "127.0.0.1", port: 9099 },
  firestore: { host: "127.0.0.1", port: 8080 },
  storage: { host: "127.0.0.1", port: 9199 },
};

firebaseService.init(firebaseOptions, true, emulatorConfig);
```

Activa emuladores solo en entornos locales o de desarrollo.

## Errores comunes

- `Firebase app is not initialized`
  - Ejecuta `firebaseService.init(...)` antes de inicializar Auth, Firestore,
    Storage o pedir la app con `getApp()`.
- `Auth instance not initialized. Call init() first.`
  - Ejecuta `await fireAuthService.init()` antes de usar servicios de Auth.
- `Firestore instance not found for dbName: ...`
  - Incluye ese nombre en `firestoreService.init([...])`.
- `Firebase Storage is not initialized`
  - Ejecuta `fireStorageService.init()` antes de llamar
    `fireStorageService.getInstance()`.
- Tokens o claims fallan.
  - Verifica que el usuario este autenticado antes de llamar
    `getIdToken`, `getIdTokenResult` o `getCustomClaims`.
- Los emuladores no conectan.
  - Asegurate de pasar `true` como segundo argumento de
    `firebaseService.init(...)`; la configuracion de puertos no basta.
