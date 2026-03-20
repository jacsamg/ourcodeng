export interface FirebaseEmulatorConfig {
	auth: {
		host: string;
		port: number;
	};
	firestore: {
		host: string;
		port: number;
	};
	storage: {
		host: string;
		port: number;
	};
}
