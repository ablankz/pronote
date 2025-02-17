import { ConditionValue } from "./types";

export function evaluateConditionBranch<T>(branch: ConditionValue<T>): T {
    for (const subBranch of branch.branches) {
        switch (subBranch.type) {
            case 'and':
                if (subBranch.conditions.every(condition => condition())) {
                    return evaluateConditionBranch(subBranch);
                }
                break;
            case 'or':
                if (subBranch.conditions.some(condition => condition())) {
                    return evaluateConditionBranch(subBranch);
                }
                break;
        }
    }

    return branch.default;
}