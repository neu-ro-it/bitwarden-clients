import { mock } from "jest-mock-extended";

import { IDecryptable } from "../../src/interfaces/IDecryptable";
import { encrypted } from "../../src/misc/encrypted.decorator";
import { EncString } from "../../src/models/domain/encString";

export class SimpleEncryptedObjectView {
  foo: string;
  bar: string;
  plainValue: number;
}

export class SimpleEncryptedObject implements IDecryptable<SimpleEncryptedObjectView> {
  @encrypted foo = new EncString("3.foo_Encrypted");
  @encrypted bar = new EncString("3.bar_Encrypted");
  plainValue = 9000;

  toView(decryptedProperties: any) {
    return Object.assign(
      new SimpleEncryptedObjectView(),
      {
        // Manually copy over unencrypted values
        plainValue: this.plainValue,
      },
      decryptedProperties // Assign everything else from the decryptedProperties object
    );
  }
}

export class SimpleEncryptedObjectArray implements IDecryptable<SimpleEncryptedObjectArrayView> {
  @encrypted baz: EncString[] = [
    new EncString("3.ArrayItem1_Encrypted", "3.ArrayItem2_Encrypted", "3.ArrayItem3_Encrypted"),
  ];

  toView(decryptedProperties: any) {
    return Object.assign(new SimpleEncryptedObjectArrayView(), decryptedProperties);
  }
}

export class SimpleEncryptedObjectArrayView extends SimpleEncryptedObjectView {
  baz: string[];
}

export class NestedEncryptedObject implements IDecryptable<any> {
  @encrypted username = mock<SimpleEncryptedObject>();
  @encrypted password = mock<SimpleEncryptedObject>();

  toView(decryptedProperties: any) {
    return;
  }
}
