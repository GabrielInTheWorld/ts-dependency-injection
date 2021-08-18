import { Container } from '../di/container';
import { Type } from './utils';

export function Injectable<K>(key: any): any {
  return (target: Type<K>) => {
    const nextTarget = Container.getInstance().resolveDependencies(target);
    Container.getInstance().registerService(key, nextTarget);
    return Reflect.defineMetadata('design:paramtypes', key, target);
  };
}
