import { Container } from '../di/container';
import { InjectionToken, Type } from './utils';

export function Inject<T>(key: InjectionToken<T>, ...input: any[]): any {
  return (target: Type<T>, propertyKey: string | symbol): void => {
    console.log('Inject', key, target, key === target);
    Container.getInstance().registerDependencyAsService(target, { dependency: key, propertyKey, input });
  };
}
