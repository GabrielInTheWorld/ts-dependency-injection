import { Factory, Inject, Injectable, Type } from '../src/decorators';
import { DiContainer } from '../src/di';

import { TestInterface } from './test-interface';
import { TestContructedClass } from './test-constructed-class';
import { APPLICATION_TOKEN, APPLICATION_VALUE } from './test-utils';
import { LateInjecting } from './test-decorator';
import { isType } from '../src/decorators/utils';

// const INJECTION_TOKEN = 'any';
// const INJECTION_VALUE = 'any_value';

// @Injectable(TestClass)
// class TestClass {
//   @Inject({
//     name: 'hello',
//     useValue: 'world',
//     afterInit: (): keyof TestClass => {
//       return 'testFn';
//     }
//   })
//   public readonly helloworld: string;
//   public modifiedValue: string;

//   @Inject(TestContructedClass)
//   public readonly testInterface: TestInterface;

//   public constructor() {
//     console.log('Constructor');
//   }

//   public testFn = (provider: string): void => {
//     console.log(`Hello ${provider}`);
//     this.modifiedValue = 'modified';
//   };
// }

@Injectable(Application)
class Application {
  @Inject({
    name: APPLICATION_TOKEN,
    useValue: APPLICATION_VALUE
  })
  public readonly token: string;

  public constructor(ctors: Type<any>[]) {
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

// test('InjectionValue', () => {
//   const test2 = DiContainer.get(TestClass);
//   expect(test2.helloworld).toBe('world');
//   expect(test2.testInterface).toBeTruthy();
//   expect(test2.modifiedValue).toBe('modified');
// });

// test('Registering value', () => {
//   const injectionToken = { name: INJECTION_TOKEN, useValue: INJECTION_VALUE };
//   DiContainer.register(injectionToken);
//   const test2 = DiContainer.get(INJECTION_TOKEN);
//   expect(test2).toBe(INJECTION_VALUE);
// });

test('Late dependency', () => {
  // const app = new Application([LaterDependency]);
  const app = DiContainer.get(Application, LaterDependency);
  console.log('app', app, app.token);
  console.log('isType', isType(Application), isType(app));
  // expect(app.token).toBe(APPLICATION_VALUE);
});
