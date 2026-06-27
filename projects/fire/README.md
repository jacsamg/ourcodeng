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
import { FirebaseService, FireAuthInitializerService, FireAuthUserService, FireAuthTokenService, FireAuthEmailService, FireAuthFacebookService, FireAuthGoogleService, FirestoreService, FireStorageService, type FirebaseEmulatorConfig, type FirestoreUpdateData } from "@ourcodeng/fire";
```

## Inicializacion

La inicializacion debe ocurrir una sola vez al arrancar la aplicacion, antes de
usar Auth, Firestore o Storage.

```ts
import { inject, Injectable } from "@angular/core";
import { FirebaseService, FireAuthInitializerService, FireAuthUserService, FirestoreService, FireStorageService, type FirebaseEmulatorConfig } from "@ourcodeng/fire";
import { browserPopupRedirectResolver, indexedDBLocalPersistence } from "firebase/auth";
import { environment } from "../environments/environment";

@Injectable({ providedIn: "root" })
export class FirebaseBootstrapService {
  private readonly firebase = inject(FirebaseService);
  private readonly authInitializer = inject(FireAuthInitializerService);
  private readonly authUser = inject(FireAuthUserService);
  private readonly firestore = inject(FirestoreService);
  private readonly storage = inject(FireStorageService);

  async init(): Promise<void> {
    const emulatorConfig: FirebaseEmulatorConfig = {
      auth: { host: "127.0.0.1", port: 9099 },
      firestore: { host: "127.0.0.1", port: 8080 },
      storage: { host: "127.0.0.1", port: 9199 },
    };

    this.firebase.init(environment.firebase, environment.useFirebaseEmulators, emulatorConfig);

    await this.authInitializer.init(indexedDBLocalPersistence, browserPopupRedirectResolver);
    await this.authUser.init();
    await this.firestore.init(["(default)"]);
    await this.storage.init();
  }
}
```

Orden recomendado:

1. `firebaseService.init(firebaseOptions, enableEmulators?, emulatorConfig?)`
2. `await fireAuthInitializerService.init(persistence?, popupRedirectResolver?)`
3. `await fireAuthUserService.init()`
4. `await firestoreService.init(dbNames?)`
5. `await fireStorageService.init()`

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

La API de Auth esta separada por responsabilidad:

- `FireAuthInitializerService` inicializa y expone la instancia de Firebase Auth.
- `FireAuthUserService` publica el estado reactivo del usuario.
- `FireAuthTokenService` obtiene tokens y custom claims.
- Los servicios de Email, Google y Facebook implementan los flujos de acceso.

`FireAuthInitializerService.init` acepta la persistencia y el resolver de
popup/redirect que quieras usar en tu app.

```ts
await fireAuthInitializerService.init();
await fireAuthUserService.init();

fireAuthUserService.currentUser$.subscribe((user) => {
  console.log(user?.email);
});

fireAuthUserService.currentUserState$.subscribe((isSignedIn) => {
  console.log(isSignedIn);
});

const token = await fireAuthTokenService.getIdToken();
const claims = await fireAuthTokenService.getCustomClaims<{ role?: string }>();
```

API:

- `FireAuthInitializerService.init(persistence?: Persistence, popupRedirectResolver?: PopupRedirectResolver | undefined): Promise<void>`
- `FireAuthInitializerService.getInstance(): Auth`
- `FireAuthUserService.init(): Promise<void>`
- `FireAuthUserService.getInstance(): Auth`
- `FireAuthUserService.currentUser$: Observable<User | null>`
- `FireAuthUserService.currentUserState$: Observable<boolean>`
- `FireAuthTokenService.getIdToken(refresh?: boolean): Promise<string>`
- `FireAuthTokenService.getIdTokenResult(refresh?: boolean): Promise<IdTokenResult>`
- `FireAuthTokenService.getCustomClaims<T>(refresh?: boolean): Promise<T & ParsedToken>`

Las llamadas a tokens y custom claims requieren que exista un usuario
autenticado.

Defaults de `FireAuthInitializerService.init`:

- `persistence`: `indexedDBLocalPersistence`
- `popupRedirectResolver`: `browserPopupRedirectResolver`

Puedes mantener los defaults llamando `await fireAuthInitializerService.init()`,
o pasar opciones del SDK de Firebase Auth cuando necesites mas control:

```ts
import {
  browserSessionPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";

// Persistencia solo durante la sesion del navegador.
await fireAuthInitializerService.init(browserSessionPersistence);

// Sesion en memoria, util cuando no quieres persistir credenciales localmente.
await fireAuthInitializerService.init(inMemoryPersistence);

// Mantener la persistencia default, pero deshabilitar soporte popup/redirect.
await fireAuthInitializerService.init(indexedDBLocalPersistence, undefined);
```

Configura `popupRedirectResolver` cuando uses proveedores con popup o redirect
en entornos donde necesites controlar el resolver. Los servicios de Google y
Facebook usan la instancia ya inicializada por `FireAuthInitializerService`, asi
que la decision se toma en `init`.

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
await firestoreService.init(["(default)", "analytics"]);

const db = await firestoreService.getDbInstance();
const analyticsDb = await firestoreService.getDbInstance("analytics");
```

API:

- `initDbNames(dbNames?: string | string[] | null): void`
- `init(dbNames?: string | string[] | null): Promise<void>`
- `getDbInstance(dbName?: string): Promise<Firestore>`

Notas:

- Si no pasas `dbNames`, se inicializa `'(default)'`.
- Si pides una base de datos que no fue inicializada, se lanza
  `Firestore instance not found for dbName: ...`.
- Define todos los nombres de bases de datos al arrancar la aplicacion. Puedes
  registrarlos con `initDbNames(...)` antes de llamar `init(...)`.
- `getDbInstance(...)` inicializa Firestore de forma lazy si todavia no se llamo
  `init(...)`.

Ejemplo con SDK de Firebase:

```ts
import { collection, getDocs } from "firebase/firestore";

const db = await firestoreService.getDbInstance();
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
await fireStorageService.init();

const storage = await fireStorageService.getInstance();
```

API:

- `init(): Promise<FirebaseStorage>`
- `getInstance(): Promise<FirebaseStorage>`

`getInstance()` inicializa Storage de forma lazy si todavia no se llamo
`init()`.

Ejemplo:

```ts
import { ref, uploadBytes } from "firebase/storage";

const storage = await fireStorageService.getInstance();
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
  - Ejecuta `await fireAuthInitializerService.init()` antes de usar servicios de
    Auth, y `await fireAuthUserService.init()` antes de consumir estado de
    usuario o tokens.
- `Firestore instance not found for dbName: ...`
  - Incluye ese nombre en `firestoreService.init([...])`.
- Tokens o claims fallan.
  - Verifica que el usuario este autenticado antes de llamar
    `getIdToken`, `getIdTokenResult` o `getCustomClaims`.
- Los emuladores no conectan.
  - Asegurate de pasar `true` como segundo argumento de
    `firebaseService.init(...)`; la configuracion de puertos no basta.
