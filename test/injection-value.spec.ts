import { Inject } from '../src/decorators';
import { TestContructedClass } from './test-constructed-class';
import { TestInterface } from './test-interface';
import { Container } from '../src/di/container';
import { APPLICATION_TOKEN, APPLICATION_VALUE } from './test-utils';
import { Constructor, isConstructor } from '../src/decorators/utils';
import { LateInjecting } from './test-decorator';
import { Factory } from '../src/decorators/factory';

const INJECTION_TOKEN = 'any';
const INJECTION_VALUE = 'any_value';

class TestClass {
  @Inject({
    name: 'hello',
    useValue: 'world',
    afterInit: (): void => {
      console.log('called afterInit');
    }
  })
  public readonly helloworld: string;
  public modifiedValue: string;

  @Inject(TestContructedClass)
  public readonly testInterface: TestInterface;

  public constructor() {
    console.log('Constructor');
  }

  public testFn = (provider: string): void => {
    console.log(`Hello ${provider}`);
    this.modifiedValue = 'modified';
  };
}

class Application {
  @Inject({
    name: APPLICATION_TOKEN,
    useValue: APPLICATION_VALUE
  })
  public readonly token: string;

  public constructor(public ctors: Constructor<any>[]) {
    console.log('Application.ctor', ctors);
    console.log('Application.token', this.token);
  }
}

@LateInjecting()
class LaterDependency {
  @Inject(LaterDependency)
  public dep: LaterDependency;

  @Factory(LaterDependency)
  public dep2: LaterDependency;

  public constructor() {
    console.log('LaterDependency.ctor', this.dep, this.dep2, (this as any).app);
    // this.dep.call();
  }

  public call(): void {
    console.log('I was called');
  }
}

test('InjectionValue', () => {
  const test = new TestClass();
  expect(test.helloworld).toBe('world');
  expect(test.testInterface).toBeTruthy();
});

test('Registering value', () => {
  const injectionToken = { name: INJECTION_TOKEN, useValue: INJECTION_VALUE };
  Container.getInstance().register(TestClass, TestClass);
  const test2 = Container.getInstance().getService(TestClass);
  test2.testFn('world');
  expect(test2.modifiedValue).toBe('modified');
});

test('Late dependency', () => {
  // const app = new Application([LaterDependency]);
  const app = Container.getInstance().getService(Application, [LaterDependency]);
  console.log('app', app, app.token, app.ctors[0] === LaterDependency);
  console.log('isType', isConstructor(Application), isConstructor(app));
  expect(app.token).toBe(APPLICATION_VALUE);
  expect(app.ctors[0]).toBe(LaterDependency);
  const laterDependency = new app.ctors[0]() as LaterDependency;
  console.log('laterDependency', laterDependency.dep, laterDependency.dep2);
  laterDependency.call();
  const two = laterDependency.dep;
  two.call();
});
