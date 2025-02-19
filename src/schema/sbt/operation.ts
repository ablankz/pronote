import { generateSortableUniqueID } from "../../utils/generate";
import { SBTOwner } from "./owner";
import { SchemaBasedTransformationValue } from "./value";

export interface SBTOperation {
    toString(): string;
}

export abstract class SchemaBasedTransformationOperation<T extends SchemaBasedTransformationValue<T>> {
    constructor(
        protected id: string = "",
        protected operatedAt: Date = new Date(),
    ) {
        if (!id) {
            this.id = generateSortableUniqueID();
        }
    }

    getId(): string {
        return this.id;
    }

    getOperatedAt(): Date {
        return this.operatedAt;
    }

    abstract toString(): string;

    setID(id: string): void {
        this.id = id;
    }

    valueOf(): string {
        return this.id;
    }

    equals(operation: SchemaBasedTransformationOperation<T>): boolean {
        return this.id === operation.id;
    }
}

export type BaseBatchOperateOperationType<
    S extends SchemaBasedTransformationValue<S>,
    T extends SBTOperation
> = {
    operations: {
        operation: T;
        preState: S;
    }[];
};

export type BaseKLSMergeOperationType<
    T extends SchemaBasedTransformationValue<T>,
    U extends SBTOwner,
> = {
    from: U;
    value: T;
};

export type BaseDOOMergeOperationType<
    T extends SchemaBasedTransformationValue<T>, 
    U extends SBTOperation,
    V extends SBTOwner,
> = {
    from: V;
    operations: U[];
};

export const SBTBaseOperationTypes = {
    BATCH_OPERATE: "BATCH_OPERATE",
    MERGE_KEEP_LATEST: "MERGE_KEEP_LATEST",
    MERGE_DISCARD_OLD: "MERGE_DISCARD_OLD",
} as const;
export type SBTBaseOperationType = typeof SBTBaseOperationTypes[keyof typeof SBTBaseOperationTypes];

export class SBTBaseOperation<
    T extends SchemaBasedTransformationValue<T>,
    U extends SBTOperation,
    V extends SBTOwner,
> extends SchemaBasedTransformationOperation<T> {
    private batchOperateOperation?: BaseBatchOperateOperationType<T, U>;
    private klsMergeOperation?: BaseKLSMergeOperationType<T, V>;
    private dooMergeOperation?: BaseDOOMergeOperationType<T, U, V>;

    constructor(
        private operateType: SBTBaseOperationType,
    ) {
        super();
    }

    setBatchOperateOperation(operation: BaseBatchOperateOperationType<T, U>): void {
        this.batchOperateOperation = operation;
    }

    getBatchOperateOperation(): BaseBatchOperateOperationType<T, U> | undefined {
        return this.batchOperateOperation;
    }

    setKLSMergeOperation(operation: BaseKLSMergeOperationType<T, V>): void {
        this.klsMergeOperation = operation;
    }

    getKLSMergeOperation(): BaseKLSMergeOperationType<T, V> | undefined {
        return this.klsMergeOperation;
    }

    setDOOMergeOperation(operation: BaseDOOMergeOperationType<T, U, V>): void {
        this.dooMergeOperation = operation;
    }

    getDOOMergeOperation(): BaseDOOMergeOperationType<T, U, V> | undefined {
        return this.dooMergeOperation;
    }

    toString(): string {
        switch (this.operateType) {
            case SBTBaseOperationTypes.BATCH_OPERATE:
                return `BATCH_OPERATE: ${JSON.stringify(this.batchOperateOperation)}`;
            case SBTBaseOperationTypes.MERGE_KEEP_LATEST:
                return `MERGE_KEEP_LATEST: ${JSON.stringify(this.klsMergeOperation)}`;
            case SBTBaseOperationTypes.MERGE_DISCARD_OLD:
                return `MERGE_DISCARD_OLD: ${JSON.stringify(this.dooMergeOperation)}`;
            default:
                return `UNKNOWN_OPERATION`;
        }
    }

    getOperateType(): SBTBaseOperationType{
        return this.operateType;
    }
}

export class BaseOperator {
    static batchOperate<
        T extends SchemaBasedTransformationValue<T>, 
        U extends SBTOperation,
    >(
        operations: {
            operation: U;
            preState: T;
        }[]
    ): SBTBaseOperation<T, U, SBTOwner> {
        const operation = new SBTBaseOperation<T, U, SBTOwner>(SBTBaseOperationTypes.BATCH_OPERATE);
        operation.setBatchOperateOperation({operations});
        return operation;
    }

    static klsMerge<
        T extends SchemaBasedTransformationValue<T>, 
        U extends SchemaBasedTransformationOperation<T>,
        V extends SBTOwner,
    >(
        from: V,
        value: T,
    ): SBTBaseOperation<T, U, V> {
        const operation = new SBTBaseOperation<T, U, V>(SBTBaseOperationTypes.MERGE_KEEP_LATEST);
        operation.setKLSMergeOperation({from, value});
        return operation;
    }

    static dooMerge<
        T extends SchemaBasedTransformationValue<T>, 
        U extends SBTOperation,
        V extends SBTOwner,
    >(
        from: V,
        operations: U[],
    ): SBTBaseOperation<T, U, V> {
        const operation = new SBTBaseOperation<T, U, V>(SBTBaseOperationTypes.MERGE_DISCARD_OLD);
        operation.setDOOMergeOperation({from, operations});
        return operation;
    }

}