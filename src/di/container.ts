import 'reflect-metadata';

import { InjectionToken } from '../decorators/utils';
import { hasOnInit } from '../interfaces/oninit';
import { Type } from '../decorators';

function isType<T>(toCheck: InjectionToken<T>): toCheck is Type<T> {
  return !toCheck.hasOwnProperty('useValue');
}

interface DependencyValue {
  dependency: string | InjectionToken<any>;
  propertyKey: string | symbol;
  input: any[];
}

export class Container {
  private static instance: Container;

  private readonly registry = new Map<string, Type<any>>();
  private readonly serviceRegistry = new Map<string, any>();

  private readonly rMapService: { [targetName: string]: DependencyValue[] } = {};
  private readonly rMap: { [targetName: string]: DependencyValue[] } = {};

  private constructor() {}

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public static get<T = any>(token: string | InjectionToken<T>): T {
    const container = Container.getInstance();
    return container.getService(token);
  }

  public registerDependencyAsService<T>(target: Type<T>, dependencyValue: DependencyValue): void {
    if (this.rMapService[target.constructor.name]) {
      this.rMapService[target.constructor.name].push(dependencyValue);
    } else {
      this.rMapService[target.constructor.name] = [dependencyValue];
    }
  }

  public registerDependency<T>(target: Type<T>, dependencyValue: DependencyValue): void {
    if (this.rMap[target.constructor.name]) {
      this.rMap[target.constructor.name].push(dependencyValue);
    } else {
      this.rMap[target.constructor.name] = [dependencyValue];
    }
  }

  public resolveDependencies<T>(target: Type<T>): any {
    const callPrototype = (ctorFun: any) => {
      if (Object.getPrototypeOf(ctorFun)) {
        console.log('Has prototype:', Object.getPrototypeOf(ctorFun));
        callPrototype(Object.getPrototypeOf(ctorFun));
      } else {
        console.log('Prototype is null:', ctorFun.prototype);
      }
    };

    // const SuperConstructor = (ctorFn: any) => {
    //   Object.getPrototypeOf(ctorFn).call(this);
    // };

    const make = (ctorFn: any, args?: any) => {
      // callPrototype(ctorFn);
      // console.log('make', ctorFn, ctorFn.prototype);
      // const newInstance = Object.create(ctorFn.prototype);
      // callPrototype(newInstance);
      // // SuperConstructor(newInstance);
      // // ctorFn.prototype.call(this);
      // ctorFn.apply(newInstance, args);
      // return newInstance;

      // ctorFn.prototype = Object.create(ctorFn.prototype);
      // ctorFn.prototype.constructor = ctorFn;
      for (const arg of args) {
        ctorFn.prototype[arg.propertyKey] = arg.instance;
      }
      return new ctorFn();
    };
    // const oldConstructor = target.constructor;
    // const oldPrototype = target.prototype;
    // (target as any) = function () {
    //   console.log('called new constructor');
    // };
    // const nextTarget = new target();
    // const nextTarget = make(target)
    const dependenciesToResolve = [];

    if (this.rMap[target.name]) {
      for (const dependency of this.rMap[target.name]) {
        if (typeof dependency.dependency === 'string') {
          throw new Error('A string cannot be a provider');
        }
        const instance = this.get(dependency.dependency, ...dependency.input);
        dependenciesToResolve.push({ propertyKey: dependency.propertyKey, instance });
        // Reflect.set(target, dependency.propertyKey, instance);
        // (nextTarget as any)[dependency.propertyKey] = instance;
      }
      delete this.rMap[target.name];
    }
    if (this.rMapService[target.name]) {
      for (const dependency of this.rMapService[target.name]) {
        const { provider, executes } = this.resolveDependencyAsService(dependency.dependency, dependency.input);
        dependenciesToResolve.push({ propertyKey: dependency.propertyKey, instance: provider });
        // Reflect.set(target, dependency.propertyKey, provider);
        // (nextTarget as any)[dependency.propertyKey] = provider;
        // this.onAfterInit(provider, executes, nextTarget);
      }
      delete this.rMapService[target.name];
    }
    const nextTarget = make(target, dependenciesToResolve);
    // const nextTarget = new target();
    return nextTarget;
    // return this.resolveDependencyAsService(target).provider;
    // return target;
  }

  public registerService<T>(dependency: string | InjectionToken<T>, provider: Type<T>): void {
    if (typeof dependency === 'string') {
      this.serviceRegistry.set(dependency, provider);
    } else {
      this.serviceRegistry.set(dependency.name, provider);
    }
  }

  public getService<T>(dependency: string | InjectionToken<T>): T {
    return this.resolveDependencyAsService(dependency).provider;
  }

  public get<T>(provider: InjectionToken<T>, ...input: any[]): T {
    return this.resolveDependencyAsFactory(provider, ...input);
  }

  private resolveDependencyAsService<T>(
    dependency: string | InjectionToken<T>,
    input: any[] = []
  ): { provider: T; executes: any | any[] } {
    let provider =
      typeof dependency === 'string'
        ? this.serviceRegistry.get(dependency)
        : (this.serviceRegistry.get(dependency.name) as T);
    console.log('resolveDependencyAsService', dependency);
    let executes: any | any[];
    if (!provider) {
      if (typeof dependency === 'string') {
        throw new Error(`No provider for key ${dependency}`);
      }
      if (isType(dependency)) {
        const injections = input.map(token => this.resolveInjections(token));
        provider = new dependency(...injections);
      } else if (dependency.useValue) {
        provider = dependency.useValue;
      } else {
        throw new Error(`No provider for key ${dependency.name}`);
      }
      if (!isType(dependency) && dependency.afterInit) {
        executes = dependency.afterInit(provider) || [];
      }
      this.serviceRegistry.set(dependency.name, provider);
    }
    if (hasOnInit(provider)) {
      provider.onInit();
    }
    return { provider, executes };
  }

  private resolveDependencyAsFactory<T>(provider: InjectionToken<T>, ...input: any[]): T {
    if (isType(provider)) {
      const tokens = Reflect.getMetadataKeys(provider.prototype, 'property');
      const injections = tokens.map((token: any) => this.get(token));
      const instance = new provider(...injections, ...input);
      if (hasOnInit(instance)) {
        instance.onInit();
      }
      return instance;
    }
    if (provider.useValue) {
      return provider.useValue;
    }
    throw new Error(`No provider for key ${provider.name}`);
  }

  private resolveInjections(token: any): any {
    if (typeof token === 'function') {
      try {
        return this.getService(token);
      } catch (e) {
        console.log('Something went wrong:', e);
        return token;
      }
    }
    return token;
  }

  private onAfterInit<T, K>(useValue: T, classKeys: string | string[], target?: any): void {
    if (!target) {
      return;
    }
    if (!classKeys) {
      return;
    }
    const executeFn = (fn: unknown) => {
      if (typeof fn === 'function') {
        fn(useValue);
      } else {
        throw new Error(`${fn} is not a function`);
      }
    };
    if (Array.isArray(classKeys)) {
      for (const key of classKeys) {
        executeFn(target[key]);
      }
    } else {
      executeFn(target[classKeys]);
    }
  }
}
