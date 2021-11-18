export type ClassDecorator<T> = (target: T) => void;

export function isConstructor<T>(toCheck: any): toCheck is Constructor<T> {
  return !!toCheck && !!toCheck.prototype;
}

export function isInjectionValue<T>(target: any): target is InjectionValue<T> {
  return !isConstructor(target);
}

export interface Constructor<T> {
  new (...args: any[]): T;
  prototype: any;
  name: string;
}

export interface InjectionValue<T> {
  name: string;
  useValue?: T;
  afterInit?: (provider: T) => void | string | string[];
}

export type InjectionToken<T> = Constructor<T> | InjectionValue<T>;
