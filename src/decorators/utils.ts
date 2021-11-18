export interface Constructor<T> {
  new (...args: any[]): T;
  prototype: any;
  name: string;
}
export interface InjectionValue<T> {
  name: string;
  useValue?: T;
  afterInit?: (provider: T) => void;
}

export type InjectionToken<T> = Constructor<T> | InjectionValue<T>;

export function isConstructable<T>(toCheck: any): toCheck is Constructor<T> {
  return !!toCheck && !!toCheck.prototype;
}

export function isInjectionValue<T>(toCheck: any): toCheck is InjectionValue<T> {
  return !isConstructable(toCheck);
}
