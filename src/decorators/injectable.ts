import { Container } from '../di/container';
import { Constructable } from './utils';

export function Injectable(key: any): any {
  return (target: Constructable<any>) => {
    Container.register(key, target);
    return Reflect.defineMetadata('design:paramtypes', key, target);
  };
}
