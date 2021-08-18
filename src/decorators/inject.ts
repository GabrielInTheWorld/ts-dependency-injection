import { Container } from '../di/container';
import { InjectionToken, Type } from './utils';

export function Inject<T>(key: InjectionToken<T>, ...input: any[]): any {
  return (target: Type<T>, propertyKey: string | symbol): void => {
    // const service = Container.getInstance().getService<T>(key, ...input);
    // Reflect.set(target, propertyKey, service);
    Container.getInstance().registerDependencyAsService(target, { dependency: key, propertyKey, input });
  };
}
