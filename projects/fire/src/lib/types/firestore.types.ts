import type { FieldValue } from 'firebase/firestore';

export type FirestoreUpdateData = {
  [x: string]: FieldValue | Partial<unknown> | null | undefined;
};
