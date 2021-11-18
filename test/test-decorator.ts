import { Constructor } from '../src/decorators/utils';
import { DiContainer } from '../src/di/di-container';
import { APPLICATION_TOKEN, APPLICATION_VALUE, EXPRESS_TOKEN, EXPRESS_VALUE } from './test-utils';

export function LateInjecting(): any {
  return (target: Constructor<any>): void => {
    let appValue: string;
    try {
      appValue = DiContainer.get<string>(APPLICATION_TOKEN);
      console.log('found appValue', appValue);
    } catch (e) {
      console.log('could not find appValue');
      appValue = APPLICATION_VALUE;
      DiContainer.register({ name: APPLICATION_TOKEN, useValue: APPLICATION_VALUE });
    }
    target.prototype.app = appValue;
    DiContainer.register(target, target);
  };
}

export function ExpressInjecting(): any {
  return (target: Constructor<any>): void => {
    let expressValue: string;
    try {
      expressValue = DiContainer.get(EXPRESS_TOKEN);
      console.log('found expressValue', expressValue);
    } catch (e) {
      console.log('could not find expressValue');
      expressValue = EXPRESS_VALUE;
      DiContainer.register(EXPRESS_TOKEN, EXPRESS_VALUE);
    }
    target.prototype.express = expressValue;
    DiContainer.register(target, target);
  };
}
