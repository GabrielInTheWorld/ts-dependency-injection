import { InjectionToken, Constructor, isConstructor, isInjectionValue } from '../decorators/utils';
import { Container } from './container';

export class DiContainer {
  public static get<T>(token: string | InjectionToken<T>, ...input: any[]): T {
    console.log('DiContainer:get', token);
    return Container.getInstance().getService(token, input);
  }

  public static register<T>(dependency: string | InjectionToken<T>, provider?: Constructor<T> | T): void {
    if (typeof dependency === 'string') {
      if (!provider) {
        throw new Error(`No provider for dependency ${dependency} given!`);
      }
      Container.getInstance().registerService(dependency, provider);
    } else if (isConstructor(dependency)) {
      Container.getInstance().registerService(dependency, dependency);
    } else if (isInjectionValue(dependency)) {
      if (dependency.useValue) {
        Container.getInstance().registerService(dependency.name, dependency.useValue);
      } else if (provider) {
        Container.getInstance().registerService(dependency.name, provider);
      }
    } else {
      throw new Error('No suitable dependency and provider are given!');
    }
  }
}
