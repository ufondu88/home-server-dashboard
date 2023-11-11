import { LXCContainer } from "./container.interface";
import { NodeInfo } from "./node.interface";
import { VirtualMachine } from "./vm.interface";

export interface ProxmoxInfo {
  nodes: NodeInfo[],
  vms: VirtualMachine[],
  containers: LXCContainer[]
}