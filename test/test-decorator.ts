import { Type } from '../src/decorators/utils';
import { DiContainer } from '../src/di/di-container';
import { APPLICATION_TOKEN, APPLICATION_VALUE } from './test-utils';

export function LateInjecting(): any {
  return (target: Type<any>): void => {
    let appValue: string;
    try {
      appValue = DiContainer.get<string>(APPLICATION_TOKEN);
    } catch (e) {
      appValue = APPLICATION_VALUE;
      DiContainer.register({ name: APPLICATION_TOKEN, useValue: APPLICATION_VALUE });
    }
    target.prototype.app = appValue;
    DiContainer.register(target, target);
  };
}
