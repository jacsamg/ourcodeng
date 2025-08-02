export interface FirebaseEmulatorConfig {
	enable: boolean;
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
