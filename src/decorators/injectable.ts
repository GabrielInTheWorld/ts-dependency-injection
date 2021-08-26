import { Container } from '../di/container';
import { Type } from './utils';

export function Injectable<K>(key?: any): any {
  return (target: Type<K>) => {
    console.log('Injectable', key, target, key ?? target.name);
    const nextTarget = Container.getInstance().resolveDependencies(target);
    Container.getInstance().registerService(key ?? target.name, nextTarget);
    return Reflect.defineMetadata('design:paramtypes', key ?? target.name, target);
  };
}
