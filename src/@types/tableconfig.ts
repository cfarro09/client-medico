import { ReactElement } from "react";

export interface Dictionary {
    [key: string]: any
}
export interface MultiData {
    data: Dictionary[];
    success: boolean;
    key?: string;
}

export interface DetailModule {
    row: Dictionary | null;
    setViewSelected: (view: string) => void;
    multiData: MultiData[];
    fetchData: () => void;
}

export interface TableConfig {
    columns: any;
    data: Dictionary[];
    filterrange?: boolean;
    filterRangeDate?: string;
    totalrow?: number;
    fetchData?(param?: any | undefined): void;
    pageCount?: number;
    titlemodule?: string;
    methodexport?: string;
    importCSV?: (param?: any) => void
    exportPersonalized?(param?: any): void;
    handleTemplate?: (param?: any) => void
    download?: boolean;
    register?: boolean;
    handleRegister?(param: any): void;
    calculate?: boolean;
    handleCalculate?(param: any): void;
    HeadComponent?: () => JSX.Element | null;
    ButtonsElement?: () => JSX.Element | null;
    FiltersElement?: ReactElement;
    pageSizeDefault?: number;
    filterGeneral?: boolean;
    hoverShadow?: boolean;
    loading?: boolean;
    updateCell?(index: number, id: any, value: any): void;
    updateColumn?(index: number[], id: any, value: any): void;
    skipAutoReset?: boolean;
    useSelection?: boolean;
    selectionKey?: string;
    selectionFilter?: { key: string, value: string };
    initialSelectedRows?: any;
    setSelectedRows?: (param?: any) => void;
    setDataFiltered?: (param?: any) => void;
    allRowsSelected?: boolean;
    setAllRowsSelected?: (value: boolean) => void;
    autotrigger?: boolean;
    toolsFooter?: boolean;
    autoRefresh?: { value: boolean, callback: (value: boolean) => void };
    // onClickRow?: (param?: any) => void
    // autoRefresh?: {value: boolean, callback: (value: boolean) => void};
    onClickRow?: (param?: any, columnid?: any) => void;
    /**cualquier filtro */
    onFilterChange?: (filter: ITablePaginatedFilter) => void;
    helperText?:string;
    initialStateFilter?: {
        id: string,
        value: {
            value: any,
            type: string,
            operator: string
        }
    }[];
    initialPageIndex?: number;
    initialStartDate?: number | null;
    initialEndDate?: number | null;
    initialFilters?: {
        [key: string]: IFilters;
    };
    registertext?: string;
    useFooter?: boolean;
}

export interface Pagination {
    sorts: Dictionary,
    filters: Dictionary,
    pageIndex: number,
    trigger?: boolean
}

export interface IFetchData {
    sorts: Dictionary;
    filters: Dictionary;
    pageIndex: number;
    pageSize: number;
    daterange: any;
}

export interface IMarket {
    marketid: number;
    market_name: string;
    address?: string;
    status: string;
    type: string;
    createdate: string;
    createby: string;
    changedate: string;
    changeby: string;
    district?: string;
    province?: string;
    department?: string;
}

export interface IDistributor {
    distributorid: number;
    distributor_name?: string;
    status: string;
    type: string;
    createdate: string;
    createby: string;
    changedate: string;
    changeby: string;
    code?: string;
    area?: string;
}

export interface IUserVisits {
    visitid: number;
    customerid: string;
    customer_name: string;
    userid: string;
    user_name: string;
    visit_date: string;
    hour_start: string;
    hour_finish: string;
    image_before?: string;
    image_after?: string;
    date_image_before?: string;
    date_image_after?: string;
    photo_selfie?: string;
    latitude?: string;
    longitude?: string;
    start_date_visit?: string;
    finish_date_visit?: string;
    replace_stock?: string;
    uniform?: string;
    speech_evaluation?: string;
    description?: string;
    status: string;
    type: string;
    observations?: string;
    service?: string;
    tactical?: string;
    attended_by?: string;
    management?: string;
    username?: string;
    user_fullname?: string;
}

export interface IAssistanceReport {
    customerid?: number;
    customer_name?: string;
    code?: number;
    user_name?: string;
    docnum?: string;
    supervisor_name?: string;
    docnum_supervisor?: string;
    visit_date?: string;
    hour_start?: string;
    hour_finish?: string;
    start_hour_visit?: string;
    marketid?: number;
    market?: string;
    stand?: string;
    finish_hour_visit?: string;
    description?: string;
    observations?: string;
    service?: string;
    management?: string;
    assistance?: string;
    hour_entry?: string;
}


export interface IMarket {
    marketid: number;
    market_name: string;
    address?: string;
    type: string;
    status: string;
    district?: string;
    province?: string;
    department?: string;
    ubigeoid?: string;
}

export interface IMerchandise {
    merchandisingid: number;
    brand: string;
    minimum_quantity?: number;
    description?: string;
    status: string;
}

export interface IProduct {
    productid: number;
    description?: string;
    brand?: string;
    sku?: string;
    price: number;
    status: string;
    type: string;
    competence?: string;
}

export interface IUserSelType {
    userid: number;
    roleid: number;
    role_name: string;
    usr: string;
    doctype?: string;
    docnum?: string;
    description?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    type: string;
    status: string;
    pwdchangefirstlogin?: boolean;
    twofactorauthentication?: boolean;
    lastlogin?: string;
    lasttokenorigin?: string;
    lasttokenstatus?: string;
    area?: string;
    location?: string;
    management?: string;
    phone?: string;
    image?: string;
}

interface IFilters { value: any, operator: string, type?: string | null; }

export interface ITablePaginatedFilter {
    /**timestamp */
    startDate: number | null;
    /**timestamp */
    endDate: number | null;
    page: number;
    filters: {
        [key: string]: IFilters;
    };
}