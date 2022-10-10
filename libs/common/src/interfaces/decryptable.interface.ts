export interface Decryptable<T> {
  toView: (decryptedProperties: any) => T;
}
