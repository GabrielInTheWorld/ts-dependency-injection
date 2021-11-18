import { Factory, Inject, Injectable, Constructor, isConstructor } from '../src/decorators';
import { DiContainer } from '../src/di';

import { TestInterface } from './test-interface';
import { TestContructedClass } from './test-constructed-class';
import { APPLICATION_TOKEN, APPLICATION_VALUE, EXPRESS_VALUE } from './test-utils';
import { LateInjecting } from './test-decorator';
import { TestExpressInjectingClass } from './test-express-injecting-class';
import { TestAppClass } from './test-app-class';

const INJECTION_TOKEN = 'any';
const INJECTION_VALUE = 'any_value';

@Injectable(TestClass)
class TestClass {
  @Inject({
    name: 'hello',
    useValue: 'world',
    afterInit: (): (keyof TestClass)[] => {
      console.log('afterInit called inside afterInit');
      return ['testFn', 'test2Fn'];
    }
  })
  public readonly helloworld: string;
  public modifiedValue: string = 'post';

  @Inject(TestContructedClass)
  public readonly testInterface: TestInterface;

  public constructor() {
    console.log('Constructor TestClass');
  }

  public test2Fn(provider: string): void {
    console.log('test2Fn', provider, this);
    this.modifiedValue = 'modi';
  }

  public testFn = (provider: string): void => {
    console.log('testFn', this);
    console.log(`Hello ${provider}`);
    this.modifiedValue = 'modified';
  };
}

@Injectable(Application)
class Application {
  @Inject({
    name: APPLICATION_TOKEN,
    useValue: APPLICATION_VALUE
  })
  public readonly token: string;

  public constructor(ctors: Constructor<any>[]) {
    console.log('Application.ctor', ctors);
    console.log('Application.token', this.token);
  }
}

@LateInjecting()
@Injectable()
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
  const test2 = DiContainer.get(TestClass);
  console.log('InjectionValue is tested', test2);
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

test('Late dependency', () => {
  // const app = new Application([LaterDependency]);
  const app = DiContainer.get(Application, LaterDependency);
  console.log('app', app, app.token);
  console.log('isType', isConstructor(Application), isConstructor(app));
  expect(app.token).toBe(APPLICATION_VALUE);
});

test('Express injecting', () => {
  const app = DiContainer.get(TestAppClass, [TestExpressInjectingClass]);
  console.log('app:', app, app.express);
  console.log('app.ctors', app.ctors);
  expect(app.express).toBe(EXPRESS_VALUE);
});
