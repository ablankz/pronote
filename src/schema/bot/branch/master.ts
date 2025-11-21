import { generateUniqueID } from "../../../utils/generate";
import { BaseBatchOperateOperationType, BaseOperator, BOTBaseOperation, BOTBaseOperationTypes, BOTOperation, BranchOperationalTransformationOperation } from "../operation";
import { BOTOwner } from "../owner";
import { BranchOperationalTransformationState } from "../state";
import { BranchOperationalTransformationValue } from "../value";

export class BOTMaster<
    T extends BranchOperationalTransformationValue<T>, 
    U extends BranchOperationalTransformationOperation<T>,
    V extends BOTOwner,
> {
    private maxOperationSize = 1000;
    private maxDeletedOperationSize = 1000;

    setMaxOperationSize(size: number): void {
        this.maxOperationSize = size;
        this.maxDeletedOperationSize = size;
    }

    protected state: BranchOperationalTransformationState<T>;
    protected operations: {
        op: BaseOperator,
        preVersion: string,
        preValue: T,
    }[] = [];
    protected deletedOperations: {
        op: BaseOperator,
        newVersion: string,
        newValue: T,
    }[] = [];

    constructor(
        state: BranchOperationalTransformationState<T>,
        protected owner: V,
    ) {
        this.state = state.generateBranch();
    }

    protected addOperation(
        op: BaseOperator,
        preVersion: string,
        preValue: T,
    ): void {
        if (this.operations.length > this.maxOperationSize - 1) {
            this.operations.shift();
        }
        this.operations.push({
            op,
            preVersion,
            preValue
        });
    }

    protected addDeletedOperation(
        op: BaseOperator,
        newVersion: string,
        newValue: T,
    ): void {
        if (this.deletedOperations.length > this.maxDeletedOperationSize - 1) {
            this.deletedOperations.shift();
        }
        this.deletedOperations.push({
            op,
            newVersion,
            newValue
        });
    }

    operate(operation: U, version: string = ""): void {
        const preValue = this.state.getValue().deepCopy();
        this.state.setValue(this.state.getValue().operate(operation));
        const preVersion = this.state.getVersion()
        version ? this.state.setVersion(version) : this.state.addVersion();
        this.addOperation(operation, preVersion, preValue);
    }

    undo(number: number = 1): void {
        for (let i = 0; i < number; i++) {
            const operation = this.operations.pop();
            if (operation) {
                const currentVersion = this.state.getVersion();
                const currentVal = this.state.getValue().deepCopy();
                const {op, preVersion, preValue} = operation;
                if (op instanceof BOTBaseOperation) {
                    switch (op.getOperateType()) {
                        case BOTBaseOperationTypes.BATCH_OPERATE:
                            this.batchReverse(op.getBatchOperateOperation()!, preVersion, preValue);
                    }
                } else if (op instanceof BranchOperationalTransformationOperation) {
                    this.state.setValue(this.state.getValue().reverse(op, preValue));
                    this.state.setVersion(preVersion);
                }
                this.addDeletedOperation(op, currentVersion, currentVal);
            }
        }
    }

    redo(number: number = 1): void {
        for (let i = 0; i < number; i++) {
            const operation = this.deletedOperations.pop();
            if (operation) {
                const preVersion = this.state.getVersion();
                const preValue = this.state.getValue().deepCopy();
                const {op, newVersion, newValue} = operation;
                this.state.setValue(newValue);
                this.state.setVersion(newVersion);
                this.addOperation(op, preVersion, preValue);
            }
        }
    }

    batchReverse(op: BaseBatchOperateOperationType<T, U>, preVersion: string, _: T): void {
        let value = this.state.getValue().deepCopy();
        op.operations.reverse().forEach(op => {
            const {operation: operation, preState: preValue} = op;
            value = value.reverse(operation, preValue);
        });
        this.state.setValue(value);
        this.state.setVersion(preVersion);
    }

    batchOperate(operations: U[]): void {
        const preValue = this.state.getValue().deepCopy();
        let val = this.state.getValue().deepCopy();
        const preValues: T[] = [
            this.state.getValue().deepCopy()
        ];
        operations.forEach(operation => {
            val = val.operate(operation);
            preValues.push(val.deepCopy());
        });
        preValues.pop();
        this.state.setValue(val);
        const preVersion = this.state.getVersion();
        this.addOperation(
            BaseOperator.batchOperate(operations.map((operation, index) => ({
                operation,
                preState: preValues[index]
            })),
            ),
            preVersion,
            preValue
        );
        this.state.addVersion()
    }

    innerMerge(sbt: BOTMaster<T, U, V>): boolean {
        if (sbt.state.getVersion() > this.state.getVersion()) {
            const preValue = this.state.getValue().deepCopy();
            this.state.setValue(sbt.state.getValue().deepCopy());
            const preVersion = this.state.getVersion();
            const operation = BaseOperator.klsMerge(
                sbt.getOwner(),
                sbt.state.getValue(),
            )
            this.addOperation(operation, preVersion, preValue);
            return true;
        }
        return false;
    }

    merge(sbt: BOTMaster<T, U, V>): void {
        if (this.innerMerge(sbt)) {
            this.state.setVersion(sbt.state.getVersion());
        }
    }

    getOperations(): BOTOperation[] {
        return this.operations.map(({op}) => op);
    }

    toString(): string {
        return this.state.toString();
    }

    getOwner(): V {
        return this.owner;
    }

    valueOf(): string {
        return this.state.valueOf();
    }

    generateHostID(): string {
        return generateUniqueID();
    }
}