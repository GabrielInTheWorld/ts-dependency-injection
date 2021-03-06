import 'reflect-metadata';

import { InjectionToken, isType } from '../decorators/utils';
import { hasOnInit } from '../interfaces/oninit';
import { Type } from '../decorators';

interface DependencyValue {
  dependency: string | InjectionToken<any>;
  propertyKey: string | symbol;
  input: any[];
}

export class Container {
  private static instance: Container;

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
    const make = (ctorFn: any, args?: any) => {
      for (const arg of args) {
        ctorFn.prototype[arg.propertyKey] = arg.instance;
      }
      return new ctorFn();
    };
    const dependenciesToResolve = [];
    const functionsToResolve = [];

    if (this.rMap[target.name]) {
      for (const dependency of this.rMap[target.name]) {
        if (typeof dependency.dependency === 'string') {
          throw new Error('A string cannot be a provider');
        }
        const instance = this.get(dependency.dependency, ...dependency.input);
        dependenciesToResolve.push({ propertyKey: dependency.propertyKey, instance });
      }
      delete this.rMap[target.name];
    }
    if (this.rMapService[target.name]) {
      for (const dependency of this.rMapService[target.name]) {
        const { provider, fnNames } = this.resolveDependencyAsService(dependency.dependency, dependency.input);
        dependenciesToResolve.push({ propertyKey: dependency.propertyKey, instance: provider });
        functionsToResolve.push({ provider, fnNames });
      }
      delete this.rMapService[target.name];
    }
    const nextTarget = make(target, dependenciesToResolve);
    this.resolveAfterInit(functionsToResolve, nextTarget);
    return nextTarget;
  }

  public registerService<T>(dependency: string | InjectionToken<T>, provider: Type<T> | T): void {
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
  ): { provider: T; fnNames: string[] } {
    let provider =
      typeof dependency === 'string'
        ? this.serviceRegistry.get(dependency)
        : (this.serviceRegistry.get(dependency.name) as T);
    let fnNames: string | string[] = [];
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
        fnNames = dependency.afterInit(provider) || [];
      }
      this.serviceRegistry.set(dependency.name, provider);
    }
    if (hasOnInit(provider)) {
      provider.onInit();
    }
    if (!Array.isArray(fnNames)) {
      fnNames = [fnNames];
    }
    return { provider, fnNames };
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

  private resolveAfterInit<T>(functionsToResolve: { provider: T; fnNames: string[] }[], target: any): void {
    for (const entry of functionsToResolve) {
      this.onAfterInit(entry.provider, entry.fnNames, target);
    }
  }

  private onAfterInit<T>(useValue: T, classKeys: string | string[], target?: any): void {
    if (!target) {
      return;
    }
    if (!classKeys) {
      return;
    }
    const executeFn = (fn: unknown) => {
      if (typeof fn === 'function') {
        fn.call(target, useValue);
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
