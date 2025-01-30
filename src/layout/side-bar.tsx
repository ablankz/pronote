import { createSignal } from "solid-js";
import { ChevronsRight, ChevronsLeft, Home, Settings, User, CirclePlus } from "lucide-solid";
import Scrollable from "../components/scrollable";

interface SidebarProps {
    collapsedClass: string;
    nonCollapsedClass: string;
    onCollapseToggle?: (toCollapse: boolean) => void;
}

export default function Sidebar(props: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = createSignal(true);

  return (
    <div
      class={`bg-gray-700 text-white transition-all duration-300 px-1.5 py-2`}
      classList={{
        [props.collapsedClass]: isCollapsed(),
        [props.nonCollapsedClass]: !isCollapsed(),
    }}
    >
      <Scrollable>
      <button
        class="w-full py-3 flex justify-center hover:bg-gray-600 rounded-md cursor-pointer px-4"
        onClick={() => {
            setIsCollapsed(prev => !prev);
            props.onCollapseToggle && props.onCollapseToggle(!isCollapsed())
        }}
      >
        {isCollapsed() ? <ChevronsRight size={24} /> : 
          <div class="flex items-center w-full">
            <ChevronsLeft size={24} />
            <span class="w-full">Collapse</span>
          </div>
        }
      </button>

      <hr class="border-t border-gray-400 w-full my-2" />

      <div class="flex flex-col items-center mt-1 py-2">
        <NavItem icon={<CirclePlus size={24} />} label="Add Component" collapsed={isCollapsed()} />
        <NavItem icon={<User size={24} />} label="Profile" collapsed={isCollapsed()} />
        <NavItem icon={<Settings size={24} />} label="Settings" collapsed={isCollapsed()} />

        <NavItem icon={<Home size={24} />} label="Home" collapsed={isCollapsed()} />
        <NavItem icon={<User size={24} />} label="Profile" collapsed={isCollapsed()} />
        <NavItem icon={<Settings size={24} />} label="Settings" collapsed={isCollapsed()} />
        <NavItem icon={<Home size={24} />} label="Home" collapsed={isCollapsed()} />
        <NavItem icon={<User size={24} />} label="Profile" collapsed={isCollapsed()} />
        <NavItem icon={<Settings size={24} />} label="Settings" collapsed={isCollapsed()} />
        <NavItem icon={<Home size={24} />} label="Home" collapsed={isCollapsed()} />
        <NavItem icon={<User size={24} />} label="Profile" collapsed={isCollapsed()} />
        <NavItem icon={<Settings size={24} />} label="Settings" collapsed={isCollapsed()} />
        <NavItem icon={<Home size={24} />} label="Home" collapsed={isCollapsed()} />
        <NavItem icon={<User size={24} />} label="Profile" collapsed={isCollapsed()} />
        <NavItem icon={<Settings size={24} />} label="Settings" collapsed={isCollapsed()} />
        <NavItem icon={<Home size={24} />} label="Home" collapsed={isCollapsed()} />
        <NavItem icon={<User size={24} />} label="Profile" collapsed={isCollapsed()} />
        <NavItem icon={<Settings size={24} />} label="Settings" collapsed={isCollapsed()} />
      </div>
      </Scrollable>
    </div>
  );
}

interface NavItemProps {
    icon: any;
    label: string;
    collapsed: boolean;
}

function NavItem(props: NavItemProps) {

    return (
        <div class="w-full flex items-center p-2 hover:bg-gray-600 justify-center rounded-md cursor-pointer">
            {props.icon}
        {!props.collapsed && <span class="ml-3">{props.label}</span>}
        </div>
    );
}