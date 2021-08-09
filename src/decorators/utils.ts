export type ClassDecorator<T> = (target: T) => void;

export interface Type<T> {
  new (...args: any[]): T;
  prototype: any;
  name: string;
}

export interface InjectionValue<T> {
  name: string
  useValue?: T
}

export type InjectionToken<T> = Type<T> | InjectionValue<T>