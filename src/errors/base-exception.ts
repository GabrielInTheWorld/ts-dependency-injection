export abstract class BaseException extends Error {
  public constructor(message: string) {
    super(message);
  }
}
