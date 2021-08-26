import { Constructor } from '../src/decorators/utils';
import { APPLICATION_TOKEN } from './test-utils';
import { Container } from '../src/di/container';

export function LateInjecting(): any {
  return (target: Constructor<any>): void => {
    const appValue: string = Container.get(APPLICATION_TOKEN);
    target.prototype.app = appValue;
    Container.register(target, target);
  };
}
