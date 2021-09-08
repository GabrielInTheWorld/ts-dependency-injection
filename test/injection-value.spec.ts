import { Constructor, Container, Factory, Inject, OnInit, NoProviderException } from '../src';

import { TestContructedClass } from './test-constructed-class';
import { TestInterface } from './test-interface';
import {
  APPLICATION_TOKEN,
  APPLICATION_VALUE,
  INJECTION_VALUE,
  INJECTION_TOKEN,
  INJECTION_PROVIDER
} from './test-utils';
import { InjectExpress, LateInjecting } from './test-decorator';
import { throwGetError, throwRegisterError, throwFactoryError } from './test-throw-errors';
import { EXPRESS_TOKEN, EXPRESS_VALUE } from './test-utils';

afterEach(() => {
  return Container.clear();
});

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

class FactoryClass {
  public static id = 0;

  public constructor() {
    ++FactoryClass.id;
  }
}

class OnInitClass implements OnInit {
  public capitalA = '';

  public onInit(): void {
    this.capitalA = 'A';
  }
}

class ToInject {}

class CtorInjecting {
  public constructor(public ctor: ToInject) {}
}

class TestInjectionClass {
  @Inject({ name: EXPRESS_TOKEN, useValue: EXPRESS_VALUE })
  public express: string;

  public constructor(ctors: Constructor<any>[]) {}
}

@InjectExpress()
class TestExpressClass {}

test('InjectionValue', () => {
  console.log('------------------ InjectionValue ------------------');
  const test = new TestClass();
  expect(test.helloworld).toBe('world');
  expect(test.testInterface).toBeTruthy();
});

test('After init', () => {
  console.log('------------------ After init ------------------');
  expect(Application.afterInitValue).toBe(APPLICATION_VALUE);
});

test('Registering class', () => {
  console.log('------------------ Registering value ------------------');
  const WORLD_TOKEN = 'world';
  Container.register(TestClass, TestClass);
  const test2 = Container.get(TestClass);
  test2.testFn(WORLD_TOKEN);
  expect(test2.modifiedValue).toBe(WORLD_TOKEN);
});

test('Registering value', () => {
  const injectionToken = { name: INJECTION_TOKEN, useValue: INJECTION_VALUE };
  Container.register(injectionToken);
  const injectionValue = Container.get(injectionToken);
  expect(injectionValue).toBe(INJECTION_VALUE);
});

test('Late dependency', () => {
  console.log('------------------ Late dependency ------------------');
  const app = Container.get(Application, [LaterDependency]);
  expect(app.token).toBe(APPLICATION_VALUE);
  expect(app.ctors[0]).toBe(LaterDependency);
  const laterDependency = new app.ctors[0]() as LaterDependency;
  expect(laterDependency.dep instanceof LaterDependency).toBeTruthy();
  expect(laterDependency.dep2 instanceof LaterDependency).toBeTruthy();
});

test('Deep dependency', () => {
  console.log('------------------ Deep dependency ------------------');
  const app3 = Container.get(App3);
  expect(app3.app2).toBeTruthy();
  expect(app3.app2.application).toBeTruthy();
  expect(app3.app2.application.getWorld()).toBe('world');
});

test('Clear registry', () => {
  console.log('------------------ Clear registry ------------------');
  Container.clear();
  expect(Container.getAllServices().length).toBe(0);
});

test('NoProviderExceptions', () => {
  console.log('------------------ NoProviderExceptions ------------------');
  expect(throwGetError).toThrowError(NoProviderException);
  expect(throwRegisterError).toThrowError(NoProviderException);
  expect(throwFactoryError).toThrowError(NoProviderException);
});

test('Factory', () => {
  console.log('------------------ Factory ------------------');
  Container.factory(FactoryClass);
  Container.factory(FactoryClass);
  expect(FactoryClass.id).toBe(2);
});

test('Register provider', () => {
  console.log('------------------ Register provider ------------------');
  const PROVIDER_TOKEN = 'provider';
  Container.register(PROVIDER_TOKEN, TestClass);
  const testClass = Container.get(PROVIDER_TOKEN);
  expect(testClass instanceof TestClass).toBeTruthy();
});

test('Register instance', () => {
  console.log('------------------ Register instance ------------------');
  const PROVIDER_TOKEN = 'provider';
  Container.register(PROVIDER_TOKEN, new TestClass());
  const testClass = Container.get(PROVIDER_TOKEN);
  expect(testClass instanceof TestClass).toBeTruthy();
});

test('Call OnInit service', () => {
  console.log('------------------ Call OnInit service ------------------');
  Container.register(OnInitClass);
  const instance = Container.get(OnInitClass);
  expect(instance.capitalA).toBe('A');
});

test('Call OnInit factory', () => {
  console.log('------------------ Call OnInit factory ------------------');
  const instance = Container.factory(OnInitClass);
  expect(instance.capitalA).toBe('A');
});

test('Factory using useValue', () => {
  console.log('------------------ Factory using useValue ------------------');
  const injectionValue = Container.factory(INJECTION_PROVIDER);
  expect(injectionValue).toBe(INJECTION_VALUE);
});

test('Resolving injections', () => {
  console.log('------------------ Resolving injections ------------------');
  const instance = Container.get(CtorInjecting, ToInject);
  expect(instance.ctor instanceof ToInject).toBeTruthy();
});

test('Resolving injections throws errors', () => {
  console.log('------------------ Factory ------------------');
  expect(() => Container.get(CtorInjecting, () => ToInject)).not.toThrowError();
});

test('Inject express value', () => {
  const instance = Container.get(TestInjectionClass, [TestExpressClass]);
  expect(instance.express).toBe(EXPRESS_VALUE);
});

test('Create express', () => {
  const instance = new TestInjectionClass([TestExpressClass]);
  expect(instance.express).toBe(EXPRESS_VALUE);
});
