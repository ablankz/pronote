// export interface BOTHostManager {
//     generateHost(): string;
//     getHost(host: string): BOTHost;
//     getHosts(): BOTHost[];
// }

// export class BOTHost {
//     private maxOperationSize = 1000;
//     private maxDeletedOperationSize = 1000;

//     setMaxOperationSize(size: number): void {
//         this.maxOperationSize = size;
//         this.maxDeletedOperationSize = size;
//     }

//     protected state: BranchOperationalTransformationState<T>;
//     protected operations: {
//         op: BaseOperator,
//         preVersion: string,
//         preValue: T,
//     }[] = [];
//     protected deletedOperations: {
//         op: BaseOperator,
//         newVersion: string,
//         newValue: T,
//     }[] = [];

//     constructor(
//         state: BranchOperationalTransformationState<T>,
//         protected owner: V,
//     ) {
//         this.state = state.generateBranch();
//     }

//     protected addOperation(
//         op: BaseOperator,
//         preVersion: string,
//         preValue: T,
//     ): void {
//         if (this.operations.length > this.maxOperationSize - 1) {
//             this.operations.shift();
//         }
//         this.operations.push({
//             op,
//             preVersion,
//             preValue
//         });
//     }

//     protected addDeletedOperation(
//         op: BaseOperator,
//         newVersion: string,
//         newValue: T,
//     ): void {
//         if (this.deletedOperations.length > this.maxDeletedOperationSize - 1) {
//             this.deletedOperations.shift();
//         }
//         this.deletedOperations.push({
//             op,
//             newVersion,
//             newValue
//         });
//     }
// }