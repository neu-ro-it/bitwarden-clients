import "reflect-metadata"; // TODO: this can only be imported in one place, so shouldn't be here

const metadataKey = Symbol("encryptedPropertiesKey");

export function encrypted(prototype: any, propertyKey: string) {
  const encStringList: string[] = Reflect.getMetadata(metadataKey, prototype);
  if (encStringList == null) {
    Reflect.defineMetadata(metadataKey, [propertyKey], prototype);
  } else {
    encStringList.push(propertyKey);
  }
}

export function getEncryptedProperties(target: any): string[] {
  return Reflect.getMetadata(metadataKey, target);
}
