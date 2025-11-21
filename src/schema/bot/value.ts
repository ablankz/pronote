import { BranchOperationalTransformationOperation } from "./operation";

export abstract class BranchOperationalTransformationValue<T extends BranchOperationalTransformationValue<T>> {
    abstract deepCopy(): T;
    abstract deepEquals(value: T): boolean;
    abstract toString(): string;
    abstract toJSON(): any;
    abstract operate(operation: BranchOperationalTransformationOperation<T>): T;
    abstract reverse(operation: BranchOperationalTransformationOperation<T>, preValue: T): T;
}