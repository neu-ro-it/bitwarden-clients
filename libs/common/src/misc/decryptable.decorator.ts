const metadataKey = Symbol("decryptableList");

export function decryptable(prototype: any, propertyKey: string) {
  const decryptableList: string[] = Reflect.getMetadata(metadataKey, prototype);
  if (decryptableList == null) {
    Reflect.defineMetadata(metadataKey, [propertyKey], prototype);
  } else {
    decryptableList.push(propertyKey);
  }
}

export function getDecryptableList(target: any): string[] {
  return Reflect.getMetadata(metadataKey, target);
}
