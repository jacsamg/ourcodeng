import { Injectable, inject, NgZone } from "@angular/core";
import {
	type FirebaseApp,
	type FirebaseOptions,
	initializeApp,
} from "firebase/app";
import { LOGGER_TAG } from "../data/logger.data";

@Injectable({
	providedIn: "root",
})
export class FirebaseService {
	private readonly ngZone = inject(NgZone);
	private app!: FirebaseApp;

	public init(options: FirebaseOptions): void {
		if (this.app) return;

		console.info(LOGGER_TAG.STARTING, FirebaseService.name);
		this.app = this.ngZone.runOutsideAngular(() => initializeApp(options));
		console.info(LOGGER_TAG.STARTED, FirebaseService.name);
	}

	public getApp(): FirebaseApp {
		return this.app;
	}
}
