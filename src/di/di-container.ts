import { InjectionToken } from '../decorators/utils';
import { Container } from './container';

export class DiContainer {
  public static get<T>(token: string | InjectionToken<T>): T {
    return Container.getInstance().getService(token);
  }
}
