import { Inject } from '../src/decorators';

class TestClass {
  @Inject({
    name: 'hello',
    useValue: 'world'
  })
  public readonly helloworld: string;
}

test('InjectionValue', () => {
  const test = new TestClass();
  expect(test.helloworld).toBe('world');
});
