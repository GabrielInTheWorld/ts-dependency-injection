import { Injectable } from '../src/decorators';
import { TestInterface } from './test-inteface';

@Injectable(TestInterface)
export class TestContructedClass extends TestInterface {}
