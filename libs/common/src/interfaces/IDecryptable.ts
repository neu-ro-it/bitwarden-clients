export interface IDecryptable<T> {
  toView: (decryptedProperties: any) => T;
}
