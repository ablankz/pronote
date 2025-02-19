import { SchemaBasedTransformationOperation } from "./operation";

export abstract class SchemaBasedTransformationValue<T extends SchemaBasedTransformationValue<T>> {
    abstract deepCopy(): T;
    abstract deepEquals(value: T): boolean;
    abstract toString(): string;
    abstract toJSON(): any;
    abstract operate(operation: SchemaBasedTransformationOperation<T>): T;
    abstract reverse(operation: SchemaBasedTransformationOperation<T>, preValue: T): T;
}