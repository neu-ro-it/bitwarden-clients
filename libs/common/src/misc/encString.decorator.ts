const metadataKey = Symbol("encStringList");

export function encString(prototype: any, propertyKey: string) {
  const encStringList: string[] = Reflect.getMetadata(metadataKey, prototype);
  if (encStringList == null) {
    Reflect.defineMetadata(metadataKey, [propertyKey], prototype);
  } else {
    encStringList.push(propertyKey);
  }
}

export function getEncStringList(target: any): string[] {
  return Reflect.getMetadata(metadataKey, target);
}
