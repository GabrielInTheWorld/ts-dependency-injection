import { Container } from '../di/container';
import { Constructor } from './utils';

export function Injectable(key: any): any {
  return (target: Constructor<any>) => {
    Container.register(key, target);
    return Reflect.defineMetadata('design:paramtypes', key, target);
  };
}
