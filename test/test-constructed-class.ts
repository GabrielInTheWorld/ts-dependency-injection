import { Injectable } from '../src/decorators';
import { TestInterface } from './test-interface';

@Injectable(TestInterface)
export class TestContructedClass extends TestInterface {}
