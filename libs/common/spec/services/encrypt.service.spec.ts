import { mockReset, mock } from "jest-mock-extended";

import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { EncryptionType } from "@bitwarden/common/enums/encryptionType";
import { EncArrayBuffer } from "@bitwarden/common/models/domain/encArrayBuffer";
import { EncString } from "@bitwarden/common/models/domain/encString";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { EncryptService } from "@bitwarden/common/services/encrypt.service";

import { makeStaticByteArray } from "../utils";

import {
  NestedArrayEncryptedObject,
  NestedArrayEncryptedObjectView,
  NestedEncryptedObject,
  NestedEncryptedObjectView,
  SimpleEncryptedObject,
  SimpleEncryptedObjectView,
} from "./encryptedObject";

describe("EncryptService", () => {
  const cryptoFunctionService = mock<CryptoFunctionService>();
  const logService = mock<LogService>();

  let encryptService: EncryptService;

  beforeEach(() => {
    mockReset(cryptoFunctionService);
    mockReset(logService);

    encryptService = new EncryptService(cryptoFunctionService, logService, true);
  });

  describe("encryptToBytes", () => {
    const plainValue = makeStaticByteArray(16, 1);
    const iv = makeStaticByteArray(16, 30);
    const mac = makeStaticByteArray(32, 40);
    const encryptedData = makeStaticByteArray(20, 50);

    it("throws if no key is provided", () => {
      return expect(encryptService.encryptToBytes(plainValue, null)).rejects.toThrow(
        "No encryption key"
      );
    });

    describe("encrypts data", () => {
      beforeEach(() => {
        cryptoFunctionService.randomBytes.calledWith(16).mockResolvedValueOnce(iv.buffer);
        cryptoFunctionService.aesEncrypt.mockResolvedValue(encryptedData.buffer);
      });

      it("using a key which supports mac", async () => {
        const key = mock<SymmetricCryptoKey>();
        const encType = EncryptionType.AesCbc128_HmacSha256_B64;
        key.encType = encType;

        key.macKey = makeStaticByteArray(16, 20);

        cryptoFunctionService.hmac.mockResolvedValue(mac.buffer);

        const actual = await encryptService.encryptToBytes(plainValue, key);

        expect(actual.encryptionType).toEqual(encType);
        expect(actual.ivBytes).toEqualBuffer(iv);
        expect(actual.macBytes).toEqualBuffer(mac);
        expect(actual.dataBytes).toEqualBuffer(encryptedData);
        expect(actual.buffer.byteLength).toEqual(
          1 + iv.byteLength + mac.byteLength + encryptedData.byteLength
        );
      });

      it("using a key which doesn't support mac", async () => {
        const key = mock<SymmetricCryptoKey>();
        const encType = EncryptionType.AesCbc256_B64;
        key.encType = encType;

        key.macKey = null;

        const actual = await encryptService.encryptToBytes(plainValue, key);

        expect(cryptoFunctionService.hmac).not.toBeCalled();

        expect(actual.encryptionType).toEqual(encType);
        expect(actual.ivBytes).toEqualBuffer(iv);
        expect(actual.macBytes).toBeNull();
        expect(actual.dataBytes).toEqualBuffer(encryptedData);
        expect(actual.buffer.byteLength).toEqual(1 + iv.byteLength + encryptedData.byteLength);
      });
    });
  });

  describe("decryptToBytes", () => {
    const encType = EncryptionType.AesCbc256_HmacSha256_B64;
    const key = new SymmetricCryptoKey(makeStaticByteArray(64, 100), encType);
    const computedMac = new Uint8Array(1).buffer;
    const encBuffer = new EncArrayBuffer(makeStaticByteArray(60, encType));

    beforeEach(() => {
      cryptoFunctionService.hmac.mockResolvedValue(computedMac);
    });

    it("throws if no key is provided", () => {
      return expect(encryptService.decryptToBytes(encBuffer, null)).rejects.toThrow(
        "No encryption key"
      );
    });

    it("throws if no encrypted value is provided", () => {
      return expect(encryptService.decryptToBytes(null, key)).rejects.toThrow(
        "Nothing provided for decryption"
      );
    });

    it("decrypts data with provided key", async () => {
      const decryptedBytes = makeStaticByteArray(10, 200).buffer;

      cryptoFunctionService.hmac.mockResolvedValue(makeStaticByteArray(1).buffer);
      cryptoFunctionService.compare.mockResolvedValue(true);
      cryptoFunctionService.aesDecrypt.mockResolvedValueOnce(decryptedBytes);

      const actual = await encryptService.decryptToBytes(encBuffer, key);

      expect(cryptoFunctionService.aesDecrypt).toBeCalledWith(
        expect.toEqualBuffer(encBuffer.dataBytes),
        expect.toEqualBuffer(encBuffer.ivBytes),
        expect.toEqualBuffer(key.encKey)
      );

      expect(actual).toEqualBuffer(decryptedBytes);
    });

    it("compares macs using CryptoFunctionService", async () => {
      const expectedMacData = new Uint8Array(
        encBuffer.ivBytes.byteLength + encBuffer.dataBytes.byteLength
      );
      expectedMacData.set(new Uint8Array(encBuffer.ivBytes));
      expectedMacData.set(new Uint8Array(encBuffer.dataBytes), encBuffer.ivBytes.byteLength);

      await encryptService.decryptToBytes(encBuffer, key);

      expect(cryptoFunctionService.hmac).toBeCalledWith(
        expect.toEqualBuffer(expectedMacData),
        key.macKey,
        "sha256"
      );

      expect(cryptoFunctionService.compare).toBeCalledWith(
        expect.toEqualBuffer(encBuffer.macBytes),
        expect.toEqualBuffer(computedMac)
      );
    });

    it("returns null if macs don't match", async () => {
      cryptoFunctionService.compare.mockResolvedValue(false);

      const actual = await encryptService.decryptToBytes(encBuffer, key);
      expect(cryptoFunctionService.compare).toHaveBeenCalled();
      expect(cryptoFunctionService.aesDecrypt).not.toHaveBeenCalled();
      expect(actual).toBeNull();
    });

    it("returns null if encTypes don't match", async () => {
      key.encType = EncryptionType.AesCbc256_B64;
      cryptoFunctionService.compare.mockResolvedValue(true);

      const actual = await encryptService.decryptToBytes(encBuffer, key);

      expect(actual).toBeNull();
      expect(cryptoFunctionService.aesDecrypt).not.toHaveBeenCalled();
    });
  });

  describe("resolveLegacyKey", () => {
    it("creates a legacy key if required", async () => {
      const key = new SymmetricCryptoKey(makeStaticByteArray(32), EncryptionType.AesCbc256_B64);
      const encString = mock<EncString>();
      encString.encryptionType = EncryptionType.AesCbc128_HmacSha256_B64;

      const actual = encryptService.resolveLegacyKey(key, encString);

      const expected = new SymmetricCryptoKey(key.key, EncryptionType.AesCbc128_HmacSha256_B64);
      expect(actual).toEqual(expected);
    });

    it("does not create a legacy key if not required", async () => {
      const encType = EncryptionType.AesCbc256_HmacSha256_B64;
      const key = new SymmetricCryptoKey(makeStaticByteArray(64), encType);
      const encString = mock<EncString>();
      encString.encryptionType = encType;

      const actual = encryptService.resolveLegacyKey(key, encString);

      expect(actual).toEqual(key);
    });
  });

  describe("decryptItem", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("decrypts", () => {
      beforeEach(() => {
        jest
          .spyOn(encryptService, "decryptToUtf8")
          .mockImplementation((encString, key) =>
            Promise.resolve(encString.data.replace("_Encrypted", ""))
          );
      });

      it("encStrings", async () => {
        const target = new SimpleEncryptedObject(1);

        const result = await encryptService.decryptItem(target, mock<SymmetricCryptoKey>());

        expect(result).toMatchObject({
          id: 1,
          username: "myUsername1",
          password: "myPassword1",
        });
        expect(result).toBeInstanceOf(SimpleEncryptedObjectView);
      });

      it("nested IDecryptables", async () => {
        const target = new NestedEncryptedObject();

        const result = await encryptService.decryptItem(target, mock<SymmetricCryptoKey>());

        expect(result).toMatchObject({
          nestedLogin1: {
            id: 1,
            username: "myUsername1",
            password: "myPassword1",
          },
          nestedLogin2: {
            id: 2,
            username: "myUsername2",
            password: "myPassword2",
          },
          collectionId: "myCollectionId",
        });
        expect(result).toBeInstanceOf(NestedEncryptedObjectView);
        expect(result.nestedLogin1).toBeInstanceOf(SimpleEncryptedObjectView);
        expect(result.nestedLogin2).toBeInstanceOf(SimpleEncryptedObjectView);
      });

      it("an array of nested IDecryptables", async () => {
        const target = new NestedArrayEncryptedObject();

        const result = await encryptService.decryptItem(target, mock<SymmetricCryptoKey>());

        expect(result).toMatchObject({
          logins: [
            {
              id: 1,
              username: "myUsername1",
              password: "myPassword1",
            },
            {
              id: 2,
              username: "myUsername2",
              password: "myPassword2",
            },
          ],
          collectionId: "myCollectionId",
        });

        expect(result).toBeInstanceOf(NestedArrayEncryptedObjectView);
        expect(result.logins[0]).toBeInstanceOf(SimpleEncryptedObjectView);
        expect(result.logins[1]).toBeInstanceOf(SimpleEncryptedObjectView);
      });
    });

    it("handles decryption errors", async () => {
      const target = new SimpleEncryptedObject(1);
      jest.spyOn(encryptService, "decryptToUtf8").mockRejectedValue("some decryption error");

      const result = await encryptService.decryptItem(target, mock<SymmetricCryptoKey>());

      const decryptionError = "[error: cannot decrypt]";

      expect(result).toMatchObject({
        id: 1,
        username: decryptionError,
        password: decryptionError,
      });
      expect(result).toBeInstanceOf(SimpleEncryptedObjectView);
    });
  });
});
