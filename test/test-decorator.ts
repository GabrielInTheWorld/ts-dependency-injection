import { Constructor } from '../src/decorators/utils';
import { APPLICATION_TOKEN, APPLICATION_VALUE } from './test-utils';
import { Container } from '../src/di/container';

export function LateInjecting(): any {
  return (target: Constructor<any>): void => {
    let appValue: string;
    try {
      appValue = Container.getInstance().get<string>(APPLICATION_TOKEN);
      console.log('had found appValue', appValue);
    } catch (e) {
      console.log('could not find appValue', e);
      appValue = APPLICATION_VALUE;
      // Container.getInstance().register({ name: APPLICATION_TOKEN, useValue: APPLICATION_VALUE });
    }
    target.prototype.app = appValue;
    Container.getInstance().register(target, target);
  };
}
