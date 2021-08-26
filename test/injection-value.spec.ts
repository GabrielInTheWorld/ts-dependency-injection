import { Inject } from '../src/decorators';
import { TestContructedClass } from './test-constructed-class';
import { TestInterface } from './test-interface';
import { APPLICATION_TOKEN, APPLICATION_VALUE } from './test-utils';
import { Constructor } from '../src/decorators/utils';
import { LateInjecting } from './test-decorator';
import { Factory } from '../src/decorators/factory';
import { Container } from '../src/di/container';

afterEach(() => {
  return Container.getInstance().clear();
});

const INJECTION_TOKEN = 'any';
const INJECTION_VALUE = 'any_value';

class TestClass {
  @Inject({
    name: 'hello',
    useValue: 'world'
  })
  public readonly helloworld: string;
  public modifiedValue: string;

  @Inject(TestContructedClass)
  public readonly testInterface: TestInterface;

  public constructor() {}

  public testFn = (provider: string): void => {
    this.modifiedValue = provider;
  };
}

class Application {
  @Inject({
    name: APPLICATION_TOKEN,
    useValue: APPLICATION_VALUE,
    afterInit: value => {
      Application.afterInitValue = value;
    }
  })
  public readonly token: string;

  public static afterInitValue: string | null = null;

  public constructor(public ctors: Constructor<any>[]) {}

  public getWorld(): string {
    return 'world';
  }
}

class App2 {
  @Inject(Application)
  public application: Application;
}

class App3 {
  @Inject(App2)
  public app2: App2;
}

@LateInjecting()
class LaterDependency {
  @Inject(LaterDependency)
  public dep: LaterDependency;

  @Factory(LaterDependency)
  public dep2: LaterDependency;

  public constructor() {}

  public call(): void {}
}

test('InjectionValue', () => {
  console.log('------------------ InjectionValue ------------------');
  const test = new TestClass();
  expect(test.helloworld).toBe('world');
  expect(test.testInterface).toBeTruthy();
});

test('After init', () => {
  console.log('------------------ After init ------------------');
  Container.getInstance().get(Application);
  expect(Application.afterInitValue).toBe(APPLICATION_VALUE);
});

test('Registering class', () => {
  console.log('------------------ Registering value ------------------');
  const WORLD_TOKEN = 'world';
  Container.getInstance().register(TestClass, TestClass);
  const test2 = Container.getInstance().get(TestClass);
  test2.testFn(WORLD_TOKEN);
  expect(test2.modifiedValue).toBe(WORLD_TOKEN);
});

test('Registering value', () => {
  const injectionToken = { name: INJECTION_TOKEN, useValue: INJECTION_VALUE };
  Container.getInstance().register(injectionToken);
  const injectionValue = Container.getInstance().get(injectionToken);
  expect(injectionValue).toBe(INJECTION_VALUE);
});

test('Late dependency', () => {
  console.log('------------------ Late dependency ------------------');
  const app = Container.getInstance().get(Application, [LaterDependency]);
  expect(app.token).toBe(APPLICATION_VALUE);
  expect(app.ctors[0]).toBe(LaterDependency);
  const laterDependency = new app.ctors[0]() as LaterDependency;
  expect(laterDependency.dep instanceof LaterDependency).toBeTruthy();
  expect(laterDependency.dep2 instanceof LaterDependency).toBeTruthy();
});

test('Deep dependency', () => {
  console.log('------------------ Deep dependency ------------------');
  const app3 = Container.getInstance().get(App3);
  expect(app3.app2).toBeTruthy();
  expect(app3.app2.application).toBeTruthy();
  expect(app3.app2.application.getWorld()).toBe('world');
});
