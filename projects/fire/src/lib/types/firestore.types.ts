import type { FieldValue } from "firebase/firestore";

export type DbUpdateData = {
	[x: string]: FieldValue | Partial<unknown> | undefined;
};
