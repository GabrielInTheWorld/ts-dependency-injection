import { Inject, Injectable } from '../src/decorators';
import { DiContainer } from '../src/di';

import { TestInterface } from './test-inteface';
import { TestContructedClass } from './test-constructed-class';

@Injectable(TestClass)
class TestClass {
  @Inject({
    name: 'hello',
    useValue: 'world',
    afterInit: (): keyof TestClass => {
      return 'testFn';
    }
  })
  public readonly helloworld: string;

  @Inject(TestContructedClass)
  public readonly testInterface: TestInterface;

  public constructor() {
    console.log('Called TestClass:constructor', this.helloworld);
  }

  public testFn(provider: string): void {
    console.log(`Hello ${provider}`);
  }
}

test('InjectionValue', () => {
  const test2 = DiContainer.get(TestClass);
  expect(test2.helloworld).toBe('world');
  expect(test2.testInterface).toBeTruthy();
});
