import { IDecryptable } from "../../src/interfaces/IDecryptable";
import { encrypted } from "../../src/misc/encrypted.decorator";
import { EncString } from "../../src/models/domain/encString";

export class SimpleEncryptedObjectView {
  id: number;
  username: string;
  password: string;
}

/**
 * An object with EncStrings and non-encrypted fields.
 */
export class SimpleEncryptedObject implements IDecryptable<SimpleEncryptedObjectView> {
  @encrypted username = new EncString("3.myUsername" + this.id + "_Encrypted");
  @encrypted password = new EncString("3.myPassword" + this.id + "_Encrypted");

  constructor(public id: number) {}

  toView(decryptedProperties: any) {
    return Object.assign(
      new SimpleEncryptedObjectView(),
      {
        // Manually copy over unencrypted values
        id: this.id,
      },
      decryptedProperties // Assign everything else from the decryptedProperties object
    );
  }
}

export class NestedEncryptedObjectView {}

/**
 * An object with nested encrypted objects (i.e. objects containing EncStrings)
 */
export class NestedEncryptedObject implements IDecryptable<NestedEncryptedObjectView> {
  @encrypted nestedLogin1 = new SimpleEncryptedObject(1);
  @encrypted nestedLogin2 = new SimpleEncryptedObject(2);
  collectionId = "myCollectionId";

  toView(decryptedProperties: any) {
    return Object.assign(
      new NestedEncryptedObjectView(),
      {
        // Manually copy over unencrypted values
        collectionId: this.collectionId,
      },
      decryptedProperties // Assign everything else from the decryptedProperties object
    );
  }
}

export class NestedArrayEncryptedObjectView {}

/**
 * An object with nested encrypted objects (i.e. objects containing EncStrings) in an array
 */
export class NestedArrayEncryptedObject implements IDecryptable<NestedArrayEncryptedObjectView> {
  @encrypted logins = [new SimpleEncryptedObject(1), new SimpleEncryptedObject(2)];
  collectionId = "myCollectionId";

  toView(decryptedProperties: any) {
    return Object.assign(
      new NestedArrayEncryptedObjectView(),
      {
        // Manually copy over unencrypted values
        collectionId: this.collectionId,
      },
      decryptedProperties // Assign everything else from the decryptedProperties object
    );
  }
}
