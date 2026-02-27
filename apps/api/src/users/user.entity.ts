export class User {
  id!: string;
  firebaseUid!: string;
  phoneNumber!: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
