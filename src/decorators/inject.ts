import { Container } from '../di/container';
import { InjectionToken, Constructor } from './utils';

export function Inject<T>(key: InjectionToken<T>, ...input: any[]): any {
  return (target: Constructor<T>, propertyKey: string | symbol, descriptor?: PropertyDescriptor): any => {
    const service = Container.getInstance().get<T>(key, ...input);
    Reflect.set(target, propertyKey, service);
  };
}
