import { generateSortableUniqueID } from "../../utils/generate";
import { BOTOwner } from "./owner";
import { BranchOperationalTransformationValue } from "./value";

export interface BOTOperation {
    toString(): string;
}

export abstract class BranchOperationalTransformationOperation<T extends BranchOperationalTransformationValue<T>> {
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

    equals(operation: BranchOperationalTransformationOperation<T>): boolean {
        return this.id === operation.id;
    }
}

export type BaseBatchOperateOperationType<
    S extends BranchOperationalTransformationValue<S>,
    T extends BOTOperation
> = {
    operations: {
        operation: T;
        preState: S;
    }[];
};

export type BaseKLSMergeOperationType<
    T extends BranchOperationalTransformationValue<T>,
    U extends BOTOwner,
> = {
    from: U;
    value: T;
};

export type BaseDOOMergeOperationType<
    T extends BranchOperationalTransformationValue<T>, 
    U extends BOTOperation,
    V extends BOTOwner,
> = {
    from: V;
    operations: U[];
};

export const BOTBaseOperationTypes = {
    BATCH_OPERATE: "BATCH_OPERATE",
    MERGE_KEEP_LATEST: "MERGE_KEEP_LATEST",
    MERGE_DISCARD_OLD: "MERGE_DISCARD_OLD",
} as const;
export type BOTBaseOperationType = typeof BOTBaseOperationTypes[keyof typeof BOTBaseOperationTypes];

export class BOTBaseOperation<
    T extends BranchOperationalTransformationValue<T>,
    U extends BOTOperation,
    V extends BOTOwner,
> extends BranchOperationalTransformationOperation<T> {
    private batchOperateOperation?: BaseBatchOperateOperationType<T, U>;
    private klsMergeOperation?: BaseKLSMergeOperationType<T, V>;
    private dooMergeOperation?: BaseDOOMergeOperationType<T, U, V>;

    constructor(
        private operateType: BOTBaseOperationType,
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
            case BOTBaseOperationTypes.BATCH_OPERATE:
                return `BATCH_OPERATE: ${JSON.stringify(this.batchOperateOperation)}`;
            case BOTBaseOperationTypes.MERGE_KEEP_LATEST:
                return `MERGE_KEEP_LATEST: ${JSON.stringify(this.klsMergeOperation)}`;
            case BOTBaseOperationTypes.MERGE_DISCARD_OLD:
                return `MERGE_DISCARD_OLD: ${JSON.stringify(this.dooMergeOperation)}`;
            default:
                return `UNKNOWN_OPERATION`;
        }
    }

    getOperateType(): BOTBaseOperationType{
        return this.operateType;
    }
}

export class BaseOperator {
    static batchOperate<
        T extends BranchOperationalTransformationValue<T>, 
        U extends BOTOperation,
    >(
        operations: {
            operation: U;
            preState: T;
        }[]
    ): BOTBaseOperation<T, U, BOTOwner> {
        const operation = new BOTBaseOperation<T, U, BOTOwner>(BOTBaseOperationTypes.BATCH_OPERATE);
        operation.setBatchOperateOperation({operations});
        return operation;
    }

    static klsMerge<
        T extends BranchOperationalTransformationValue<T>, 
        U extends BranchOperationalTransformationOperation<T>,
        V extends BOTOwner,
    >(
        from: V,
        value: T,
    ): BOTBaseOperation<T, U, V> {
        const operation = new BOTBaseOperation<T, U, V>(BOTBaseOperationTypes.MERGE_KEEP_LATEST);
        operation.setKLSMergeOperation({from, value});
        return operation;
    }

    static dooMerge<
        T extends BranchOperationalTransformationValue<T>, 
        U extends BOTOperation,
        V extends BOTOwner,
    >(
        from: V,
        operations: U[],
    ): BOTBaseOperation<T, U, V> {
        const operation = new BOTBaseOperation<T, U, V>(BOTBaseOperationTypes.MERGE_DISCARD_OLD);
        operation.setDOOMergeOperation({from, operations});
        return operation;
    }

}