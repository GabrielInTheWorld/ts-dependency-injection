export type ClassDecorator<T> = (target: T) => void;

export function isType<T>(toCheck: any): toCheck is Type<T> {
  return !!toCheck && !!toCheck.prototype;
}

export function isInjectionValue<T>(target: any): target is InjectionValue<T> {
  return !isType(target);
}

export interface Type<T> {
  new (...args: any[]): T;
  prototype: any;
  name: string;
}

export interface InjectionValue<T> {
  name: string;
  useValue?: T;
  afterInit?: (provider: T) => void | string | string[];
}

export type InjectionToken<T> = Type<T> | InjectionValue<T>;
