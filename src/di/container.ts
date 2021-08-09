import 'reflect-metadata';
import { InjectionToken } from 'src/decorators/utils';
import { hasOnInit } from 'src/interfaces/oninit';

import { Type } from '../decorators';

function isType<T>(toCheck: InjectionToken<T>): toCheck is Type<T> {
  return !toCheck.hasOwnProperty('useValue');
}

export class Container {
  private static instance: Container;

  private readonly registry = new Map<string, Type<any>>();
  private readonly serviceRegistry = new Map<string, any>();

  private constructor() {}

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public register<T>(dependency: InjectionToken<T>, provider: Type<T>): this {
    this.registry.set(dependency.name, provider);
    return this;
  }

  public getService<T>(dependency: string | InjectionToken<T>, ...input: any[]): T {
    let provider =
      typeof dependency === 'string'
        ? this.serviceRegistry.get(dependency)
        : (this.serviceRegistry.get(dependency.name) as T);
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
      this.serviceRegistry.set(dependency.name, provider);
    }
    if (hasOnInit(provider)) {
      provider.onInit();
    }
    return provider;
  }

  public get<T>(provider: InjectionToken<T>, ...input: any[]): T {
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
}
