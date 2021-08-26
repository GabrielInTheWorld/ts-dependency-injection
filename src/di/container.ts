import 'reflect-metadata';

import { InjectionToken, isConstructable, isInjectionValue } from '../decorators/utils';
import { hasOnInit } from '../interfaces/oninit';
import { Constructor } from '../decorators';

export class Container {
  private static instance: Container;

  private readonly registry = new Map<string, any>();

  private constructor() {}

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Registers a token as service.
   *
   * @param dependency Required. Must be either a string or a token, that is constructable or usable (has `useValue`).
   * @param provider Optional. Must be provided if dependency is a string or not a constructable or usable item.
   */
  public register<T>(dependency: string | InjectionToken<T>, provider?: Constructor<T> | T, ...input: any[]): void {
    const key = typeof dependency === 'string' ? dependency : dependency.name;
    let token = null;
    if (typeof dependency === 'string') {
      if (isConstructable(provider)) {
        token = this.resolveDependencies(provider, input);
      } else if (provider) {
        token = provider;
      } else {
        throw new Error(`No provider for dependency ${dependency} given!`);
      }
    } else {
      token = this.resolveDependencies(dependency, input);
    }
    this.registry.set(key, token);
  }

  /**
   * Resolves a service for a given token. If only a string is provided, the registry is searched for a suitable value.
   * If not an `InjectionToken` must be provided, otherwise an error is thrown.
   *
   * @param dependency A string or an InjectionToken
   * @param input Optional. Any input to a possibly new created value.
   *
   * @returns The service
   */
  public get<T>(dependency: string | InjectionToken<T>, ...input: any[]): T {
    let provider =
      typeof dependency === 'string' ? this.registry.get(dependency) : (this.registry.get(dependency.name) as T);
    if (!provider) {
      if (typeof dependency === 'string') {
        throw new Error(`No provider for key ${dependency}`);
      }
      provider = this.resolveDependencies(dependency, input);
      this.registry.set(dependency.name, provider);
    }
    if (hasOnInit(provider)) {
      provider.onInit();
    }
    return provider;
  }

  /**
   * A function to create a new value. If a value is provided (by `useValue`) it is returned.
   *
   * @param provider A token to provide a constructable or usable value
   * @param input Optional input for a new constructed value
   * @returns A generic value
   */
  public factory<T>(provider: InjectionToken<T>, ...input: any[]): T {
    if (isConstructable(provider)) {
      const tokens = Reflect.getMetadataKeys(provider.prototype, 'property');
      const injections = tokens.map((token: any) => this.factory(token));
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

  /**
   * Clears the whole registry for services
   */
  public clear(): void {
    this.registry.clear();
  }

  private resolveDependencies<T>(dependency: InjectionToken<T>, input: any[]): T {
    let provider: T;
    if (isConstructable(dependency)) {
      const injections = input.map(token => this.resolveInjections(token));
      provider = new dependency(...injections);
    } else if (dependency.useValue) {
      provider = dependency.useValue;
    } else {
      throw new Error(`No provider for key ${dependency.name}`);
    }
    if (isInjectionValue(dependency) && dependency.afterInit) {
      dependency.afterInit(provider);
    }
    return provider;
  }

  private resolveInjections(token: any): any {
    if (typeof token === 'function') {
      try {
        return this.get(token);
      } catch (e) {
        console.log('Something went wrong:', e);
        return token;
      }
    }
    return token;
  }
}
