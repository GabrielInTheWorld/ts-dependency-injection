import { Container } from '../src/di/container';
import { INJECTION_TOKEN } from './test-utils';

export function throwGetError(): any {
  Container.get(INJECTION_TOKEN);
}

export function throwRegisterError(): any {
  Container.register(INJECTION_TOKEN);
}

export function throwFactoryError(): any {
  Container.factory(INJECTION_TOKEN as any);
}
