import { Inject } from '../src/decorators/inject';
import { EXPRESS_TOKEN, EXPRESS_VALUE } from './test-utils';
import { Constructor } from '../src/decorators/utils';
export class TestAppClass {
  @Inject({
    name: EXPRESS_TOKEN,
    useValue: EXPRESS_VALUE
  })
  public readonly express: string;

  public constructor(public readonly ctors: Constructor<any>[]) {}
}
