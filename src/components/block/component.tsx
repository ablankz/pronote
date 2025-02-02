import Block from "./block";
import { ComponentBlock, ResizeBlockProps } from "./type";
import { Setter } from "solid-js";

interface BlockComponentProps {
    id: string;
    component: ComponentBlock;
    isSelected: boolean;
    setSelected: Setter<string>;
    isResizing: ResizeBlockProps;
    setIsResizing: Setter<ResizeBlockProps>;
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
            isResizing={props.isResizing} 
            setIsResizing={props.setIsResizing} 
            isSelected={props.isSelected}
            setSelected={props.setSelected}
            isRootBlock={props.isRootBlock}
            handleDeleteBlock={props.handleDeleteBlock}
        />
    );
}