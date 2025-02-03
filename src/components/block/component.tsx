import Block from "./block";
import { ComponentBlock } from "./type";
import { Setter } from "solid-js";

interface BlockComponentProps {
    id: string;
    component: ComponentBlock;
    isSelected: boolean;
    setSelected: Setter<string>;
    handleAddBlock: (id: string) => void;
    addOpen: boolean;
    isRootBlock: boolean;
    handleDeleteBlock: (id: string) => void;
}

export default function BlockComponent(props: BlockComponentProps) {
    return (
        <Block 
            id={props.id}
            component={props.component}
            isSelected={props.isSelected}
            setSelected={props.setSelected}
            isRootBlock={props.isRootBlock}
            handleDeleteBlock={props.handleDeleteBlock}
        />
    );
}