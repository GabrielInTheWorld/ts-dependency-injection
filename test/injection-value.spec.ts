import { Inject, Injectable } from '../src/decorators';
import { DiContainer } from '../src/di';

import { TestInterface } from './test-inteface';
import { TestContructedClass } from './test-constructed-class';

const INJECTION_TOKEN = 'any';
const INJECTION_VALUE = 'any_value';

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
  public modifiedValue: string;

  @Inject(TestContructedClass)
  public readonly testInterface: TestInterface;

  public constructor() {}

  public testFn = (provider: string): void => {
    console.log(`Hello ${provider}`);
    this.modifiedValue = 'modified';
  };
}

test('InjectionValue', () => {
  const test2 = DiContainer.get(TestClass);
  expect(test2.helloworld).toBe('world');
  expect(test2.testInterface).toBeTruthy();
  expect(test2.modifiedValue).toBe('modified');
});

test('Registering value', () => {
  const injectionToken = { name: INJECTION_TOKEN, useValue: INJECTION_VALUE };
  DiContainer.register(injectionToken);
  const test2 = DiContainer.get(INJECTION_TOKEN);
  expect(test2).toBe(INJECTION_VALUE);
});
