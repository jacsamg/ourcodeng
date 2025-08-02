import { isDevMode } from "@angular/core";
import type { FirebaseEmulatorConfig } from "../types/firebase.types";

export const defaultEmulatorconfig: FirebaseEmulatorConfig = {
	enable: isDevMode(),
	auth: {
		host: "127.0.0.1",
		port: 9099,
	},
	firestore: {
		host: "127.0.0.1",
		port: 8080,
	},
	storage: {
		host: "127.0.0.1",
		port: 9199,
	},
};
