import { BaseOperator, SchemaBasedTransformationOperation } from "./operation";
import { SBTOwner } from "./owner";
import { SchemaBasedTransformation } from "./sbt";
import { SchemaBasedTransformationState } from "./state";
import { SchemaBasedTransformationValue } from "./value";

export class SBTDiscardOldOperations<
    T extends SchemaBasedTransformationValue<T>, 
    U extends SchemaBasedTransformationOperation<T>,
    V extends SBTOwner,
> extends SchemaBasedTransformation<
    SBTDiscardOldOperations<T, U, V>,
    T,
    U,
    V
> {
    constructor(
        state: SchemaBasedTransformationState<T>,
        owner: V,
    ) {
        super(state, owner);
    }

    innerMerge(sbt: SBTDiscardOldOperations<T, U, V>): boolean {
        if (sbt.state.getVersion() > this.state.getVersion()) {
            const preValue = this.state.getValue().deepCopy();
            this.state.setValue(sbt.state.getValue().deepCopy());
            const preVersion = this.state.getVersion();
            const operation = BaseOperator.dooMerge(
                sbt.getOwner(),
                sbt.getOperations(),
            )
            this.addOperation(operation, preVersion, preValue);
            return true;
        }
        return false;
    }
}