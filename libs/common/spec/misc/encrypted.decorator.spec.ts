import { encrypted, getEncryptedProperties } from "@bitwarden/common/misc/encrypted.decorator";

class TestClass {
  @encrypted
  encryptedString: string;
  @encrypted
  anotherEncryptedString: string;

  someOtherProperty: Date;
}

describe("encString decorator", () => {
  it("adds property name to list", () => {
    const testClass = new TestClass();
    const result = getEncryptedProperties(testClass);
    expect(result).toEqual(["encryptedString", "anotherEncryptedString"]);
  });
});
