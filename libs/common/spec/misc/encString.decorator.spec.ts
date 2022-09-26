import { encString, getEncStringList } from "@bitwarden/common/misc/encString.decorator";

class TestClass {
  @encString
  encryptedString: string;
  @encString
  anotherEncryptedString: string;

  someOtherProperty: Date;
}

describe("encString decorator", () => {
  it("adds property name to list", () => {
    const testClass = new TestClass();
    const result = getEncStringList(testClass);
    expect(result).toEqual(["encryptedString", "anotherEncryptedString"]);
  });
});
