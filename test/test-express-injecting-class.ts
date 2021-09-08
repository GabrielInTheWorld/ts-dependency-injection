import { ExpressInjecting } from './test-decorator';

@ExpressInjecting()
export class TestExpressInjectingClass {
  public express: string;
}
