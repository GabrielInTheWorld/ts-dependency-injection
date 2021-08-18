// export type ClassKey = string | number | symbol;

export type ClassDecorator<T> = (target: T) => void;

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
