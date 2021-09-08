import { BaseException } from './base.exception';
export class NoProviderException extends BaseException {
  public constructor(dependency: string) {
    super(`No provider for dependency ${dependency} given!`);
  }
}
