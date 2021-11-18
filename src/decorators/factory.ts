import { Container } from '../di/container';
import { InjectionToken, Constructor } from './utils';

/**
 * A decorator to instantiate a class by the dependency injection. This decorator will instantiate classes
 * in a factory-way. So, every instantiated class is a new instance.
 *
 * @param key A class, that will be instantiated.
 * @param input Additional data, that will be passed to the instantiated class'es constructor.
 *
 * @returns Nothing. The instantiated class is injected into a target object.
 */
export function Factory<T>(key: InjectionToken<T>, ...input: any[]): any {
  return (target: Constructor<T>, propertyKey: string | symbol, descriptor?: PropertyDescriptor): any => {
    const service = Container.factory<T>(key, ...input);
    Reflect.set(target, propertyKey, service);
  };
}
