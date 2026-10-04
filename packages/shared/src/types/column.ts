export interface GridColumnDef {
    field: string;
    headerName: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    align?: 'left' | 'center' | 'right';
    pinned?: 'left' | 'right';
    sortable?: boolean;
    filterable?: boolean;
    renderer?: string;
    children?: GridColumnDef[];
}
