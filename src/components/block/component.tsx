import { selectedBlock } from "../../store/select";
import { ComponentBlock } from "../../types/block";
import Block from "./block";

interface BlockComponentProps {
    component: ComponentBlock;
    handleAddBlock: (id: string) => void;
    addOpen: boolean;
    isRootBlock: boolean;
    handleDeleteBlock: (id: string) => void;
}

export default function BlockComponent(props: BlockComponentProps) {

    return (
        <Block 
            component={props.component}
            isSelected={props.component.id === selectedBlock()?.component.id}
            isRootBlock={props.isRootBlock}
            handleDeleteBlock={props.handleDeleteBlock}
        />
    );
}