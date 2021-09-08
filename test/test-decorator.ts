import { Constructor } from '../src/decorators/utils';
import { APPLICATION_TOKEN, EXPRESS_TOKEN } from './test-utils';
import { Container } from '../src/di/container';

export function LateInjecting(): any {
  return (target: Constructor<any>): void => {
    const appValue: string = Container.get(APPLICATION_TOKEN);
    target.prototype.app = appValue;
    Container.register(target, target);
  };
}

export function InjectExpress(): any {
  return (target: Constructor<any>) => {
    const expressValue: string = Container.get(EXPRESS_TOKEN);
    console.log('expressValue', expressValue);
    target.prototype.express = expressValue;
    Container.register(target);
  };
}
