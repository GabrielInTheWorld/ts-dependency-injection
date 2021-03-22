import { Container } from '../di/container';
import { Type } from './utils';

export function Injectable(key: any): any {
  return (target: Type<any>) => {
    Container.getInstance().register(key, target);
    return Reflect.defineMetadata('design:paramtypes', key, target);
  };
}
