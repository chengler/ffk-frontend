// Type definitions for ag-grid v4.0.6
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export interface IClipboardService {
    pasteFromClipboard(): void;
    copyToClipboard(): void;
    copySelectedRowsToClipboard(): void;
    copySelectedRangeToClipboard(): void;
    copyRangeDown(): void;
}
