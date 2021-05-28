import 'reflect-metadata';
import { InjectionToken } from 'src/decorators/utils';

import { Type } from '../decorators';

function isType<T>(toCheck: InjectionToken<T>): toCheck is Type<T> {
  return !toCheck.hasOwnProperty('useValue')
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

  public getService<T>(dependency: InjectionToken<T>, ...input: any[]): T {
    let provider = this.serviceRegistry.get(dependency.name) as T;
    if (!provider) {
      if (isType(dependency)) {
        const injections = input.map(token => this.resolveInjections(token));
        provider = new dependency(...injections);
      } else {
        provider = dependency.useValue
      }
      this.serviceRegistry.set(dependency.name, provider);
    }
    return provider;
  }

  public get<T>(provider: InjectionToken<T>, ...input: any[]): T {
    if (isType(provider)) {
      const tokens = Reflect.getMetadataKeys(provider.prototype, 'property');
      const injections = tokens.map((token: any) => this.get(token));
      return new provider(...injections, ...input);
    }
    return provider.useValue
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
