import "reflect-metadata"; // TODO: this can only be imported in one place, so shouldn't be here

/**
 * Returns a decorator which will add the decorated property name to an array, which is stored under the metadataKey
 */
function listDecoratorFactory(metadataKey: symbol) {
  return function (prototype: any, propertyKey: string) {
    const encStringList: string[] = Reflect.getMetadata(metadataKey, prototype);
    if (encStringList == null) {
      Reflect.defineMetadata(metadataKey, [propertyKey], prototype);
    } else {
      encStringList.push(propertyKey);
    }
  };
}

/**
 * Returns a function which returns an array of property names stored with the list decorator under the metadataKey
 */
function getListFactory(metadataKey: symbol) {
  return function (target: any): string[] {
    return Reflect.getMetadata(metadataKey, target);
  };
}

const encStringListKey = Symbol("encStringList");
export const encString = listDecoratorFactory(encStringListKey);
export const getEncStringList = getListFactory(encStringListKey);

const decryptableListKey = Symbol("encStringList");
export const decryptable = listDecoratorFactory(decryptableListKey);
export const getDecryptableList = getListFactory(decryptableListKey);
