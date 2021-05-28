import { Container } from '../di/container';
import { InjectionToken, Type } from './utils';

export function Inject<T>(key: InjectionToken<T>, ...input: any[]): any {
  return (target: Type<T>, propertyKey: string | symbol, descriptor?: PropertyDescriptor): any => {
    const service = Container.getInstance().getService<T>(key, ...input);
    Reflect.set(target, propertyKey, service);
  };
}
