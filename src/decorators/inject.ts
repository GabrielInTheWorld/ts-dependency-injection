import { Container } from '../di/container';
import { InjectionToken, Constructor } from './utils';

export function Inject<T>(key: InjectionToken<T>, ...input: any[]): any {
  return (target: Constructor<T>, propertyKey: string | symbol): any => {
    const service = Container.get<T>(key, ...input);
    Reflect.set(target, propertyKey, service);
  };
}
