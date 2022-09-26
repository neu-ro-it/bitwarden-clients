import "reflect-metadata";

const metadataKey = Symbol("decryptableList");

export function decryptable(prototype: any, propertyKey: string) {
  const encStringList: string[] = Reflect.getMetadata(metadataKey, prototype);
  if (encStringList == null) {
    Reflect.defineMetadata(metadataKey, [propertyKey], prototype);
  } else {
    encStringList.push(propertyKey);
  }
}

export function getDecryptableList(target: any) {
  return Reflect.getMetadata(metadataKey, target);
}
