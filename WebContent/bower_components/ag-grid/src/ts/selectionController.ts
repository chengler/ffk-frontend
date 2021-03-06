import {Utils as _} from './utils';
import {RowNode} from "./entities/rowNode";
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";
import {Logger} from "./logger";
import {LoggerFactory} from "./logger";
import {EventService} from "./eventService";
import {Events} from "./events";
import {Autowired} from "./context/context";
import {IRowModel} from "./interfaces/iRowModel";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {PostConstruct} from "./context/context";

@Bean('selectionController')
export class SelectionController {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private selectedNodes: {[key: string]: RowNode};
    private logger: Logger;

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('SelectionController');
        this.reset();

        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.eventService.addEventListener(Events.EVENT_ROW_DATA_CHANGED, this.reset.bind(this));
        } else {
            this.logger.log('dont know what to do here');
        }

    }

    @PostConstruct
    public init(): void {
        this.eventService.addEventListener(Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    }

    public getSelectedNodes() {
        var selectedNodes: RowNode[] = [];
        _.iterateObject(this.selectedNodes, (key: string, rowNode: RowNode) => {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    }

    public getSelectedRows() {
        var selectedRows: any[] = [];
        _.iterateObject(this.selectedNodes, (key: string, rowNode: RowNode) => {
            if (rowNode) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    }

    public removeGroupsFromSelection(): void {
        _.iterateObject(this.selectedNodes, (key: string, rowNode: RowNode) => {
            if (rowNode) {
                this.selectedNodes[rowNode.id] = undefined;
            }
        });
    }

    // should only be called if groupSelectsChildren=true
    public updateGroupsFromChildrenSelections(): void {
        this.rowModel.getTopLevelNodes().forEach( (rowNode: RowNode) => {
            rowNode.deptFirstSearch( (rowNode)=> {
                if (rowNode.group) {
                    rowNode.calculateSelectedFromChildren();
                }
            });
        });
    }

    public getNodeForIdIfSelected(id: number): RowNode {
        return this.selectedNodes[id];
    }

    public clearOtherNodes(rowNodeToKeepSelected: RowNode): void {
        _.iterateObject(this.selectedNodes, (key: string, otherRowNode: RowNode)=> {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                this.selectedNodes[otherRowNode.id].setSelected(false, false, true);
            }
        });
    }

    private onRowSelected(event: any): void {
        var rowNode = event.node;
        if (rowNode.isSelected()) {
            this.selectedNodes[rowNode.id] = rowNode;
        } else {
            this.selectedNodes[rowNode.id] = undefined;
        }
    }

    public syncInRowNode(rowNode: RowNode): void {
        if (this.selectedNodes[rowNode.id] !== undefined) {
            rowNode.setSelectedInitialValue(true);
            this.selectedNodes[rowNode.id] = rowNode;
        }
    }

    public reset(): void {
        this.logger.log('reset');
        this.selectedNodes = {};
    }

    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    public getBestCostNodeSelection() {

        var topLevelNodes = this.rowModel.getTopLevelNodes();

        if (topLevelNodes===null) {
            console.warn('selectAll not available doing rowModel=virtual');
            return;
        }

        var result: any = [];

        // recursive function, to find the selected nodes
        function traverse(nodes: any) {
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (node.isSelected()) {
                    result.push(node);
                } else {
                    // if not selected, then if it's a group, and the group
                    // has children, continue to search for selections
                    if (node.group && node.children) {
                        traverse(node.children);
                    }
                }
            }
        }

        traverse(topLevelNodes);

        return result;
    }

    public setRowModel(rowModel: any) {
        this.rowModel = rowModel;
    }

    public isEmpty(): boolean {
        var count = 0;
        _.iterateObject(this.selectedNodes, (nodeId: string, rowNode: RowNode) => {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    }

    public deselectAllRowNodes() {
        _.iterateObject(this.selectedNodes, (nodeId: string, rowNode: RowNode) => {
            if (rowNode) {
                rowNode.selectThisNode(false);
            }
        });
        // we should not have to do this, as deselecting the nodes fires events
        // that we pick up, however it's good to clean it down, as we are still
        // left with entries pointing to 'undefined'
        this.selectedNodes = {};
    }

    public selectAllRowNodes() {
        if (this.rowModel.getTopLevelNodes() === null) {
            throw 'selectAll not available when doing virtual pagination';
        }
        this.rowModel.forEachNode( (rowNode: RowNode) => {
            rowNode.setSelected(true, false, true);
        });
        // because we passed in 'false' as third parameter above, the
        // eventSelectionChanged event was not fired.
        this.eventService.dispatchEvent(Events.EVENT_SELECTION_CHANGED)
    }

    // Deprecated method
    public selectNode(rowNode: RowNode, tryMulti: boolean, suppressEvents?: boolean) {
        rowNode.setSelected(true, !tryMulti, suppressEvents);
    }

    // Deprecated method
    public deselectIndex(rowIndex: number, suppressEvents: boolean = false) {
        var node = this.rowModel.getRow(rowIndex);
        this.deselectNode(node, suppressEvents);
    }

    // Deprecated method
    public deselectNode(rowNode: RowNode, suppressEvents: boolean = false) {
        rowNode.setSelected(false, false, suppressEvents);
    }

    // Deprecated method
    public selectIndex(index: any, tryMulti: boolean, suppressEvents: boolean = false) {
        var node = this.rowModel.getRow(index);
        this.selectNode(node, tryMulti, suppressEvents);
    }

}