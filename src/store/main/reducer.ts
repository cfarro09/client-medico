import { IListStatePaginated, MultiData } from "@types";
import { Dictionary, ITemplate } from "@types";
import { createReducer, initialListPaginatedState, initialCommon } from "common/helpers";
import * as caseFunctions from './caseFunctions';
import actionTypes from "./actionTypes";

export interface itemMulti {
    data: Dictionary[];
    success: boolean;
    key?: string;
}

export interface IUpload extends ITemplate {
    url?: string;
}

export interface IBaseState2 {
    loading: boolean;
    data: Dictionary;
    code?: string;
    error: boolean;
    /** Error message */
    message?: string;
}

export interface IState {
    mainData: IListStatePaginated<Dictionary> & { key?: string; };
    mainDynamic: IListStatePaginated<Dictionary>;
    multiData: IListStatePaginated<MultiData>;
    multiDataAux: IListStatePaginated<itemMulti>;
    execute: IListStatePaginated<Dictionary> & { success: boolean | undefined | null };
    uploadData: IBaseState2;
    processData: IBaseState2;
    mainAux: IListStatePaginated<Dictionary>;
    mainAux2: IListStatePaginated<Dictionary>;
    mainPaginated: IListStatePaginated<Dictionary>;
    uploadFile: IUpload;
    exportData: IUpload;
    exportDynamicData: IUpload;
}

export const initialState: IState = {
    mainData: initialListPaginatedState,
    mainDynamic: initialListPaginatedState,
    multiData: initialListPaginatedState,
    multiDataAux: initialListPaginatedState,
    execute: { success: undefined, ...initialListPaginatedState },
    uploadData: { ...initialListPaginatedState, data: {} },
    processData: { ...initialListPaginatedState, data: {} },
    mainAux: initialListPaginatedState,
    mainAux2: initialListPaginatedState,
    mainPaginated: initialListPaginatedState,
    uploadFile: { ...initialCommon },
    exportData: { ...initialCommon },
    exportDynamicData: { ...initialCommon },
};

export default createReducer<IState>(initialState, {
    [actionTypes.MAIN]: caseFunctions.main,
    [actionTypes.MAIN_SUCCESS]: caseFunctions.mainSuccess,
    [actionTypes.MAIN_FAILURE]: caseFunctions.mainFailure,
    [actionTypes.MAIN_RESET]: caseFunctions.mainReset,

    [actionTypes.MULTI_MAIN]: caseFunctions.multiMain,
    [actionTypes.MULTI_MAIN_SUCCESS]: caseFunctions.multiMainSuccess,
    [actionTypes.MULTI_MAIN_FAILURE]: caseFunctions.multiMainFailure,
    [actionTypes.MULTI_MAIN_RESET]: caseFunctions.multiMainReset,

    [actionTypes.EXECUTE_MAIN]: caseFunctions.execute,
    [actionTypes.EXECUTE_MAIN_SUCCESS]: caseFunctions.executeSuccess,
    [actionTypes.EXECUTE_MAIN_FAILURE]: caseFunctions.executeFailure,
    [actionTypes.EXECUTE_MAIN_RESET]: caseFunctions.executeReset,


    [actionTypes.UPLOAD_DATA]: caseFunctions.uploadData,
    [actionTypes.UPLOAD_DATA_SUCCESS]: caseFunctions.uploadDataSuccess,
    [actionTypes.UPLOAD_DATA_FAILURE]: caseFunctions.uploadDataFailure,
    [actionTypes.UPLOAD_DATA_RESET]: caseFunctions.uploadDataReset,

    [actionTypes.PROCESS_DATA]: caseFunctions.processData,
    [actionTypes.PROCESS_DATA_SUCCESS]: caseFunctions.processDataSuccess,
    [actionTypes.PROCESS_DATA_FAILURE]: caseFunctions.processDataFailure,
    [actionTypes.PROCESS_DATA_RESET]: caseFunctions.processDataReset,


    [actionTypes.AUX_MAIN]: caseFunctions.mainAux,
    [actionTypes.AUX_MAIN_SUCCESS]: caseFunctions.mainAuxSuccess,
    [actionTypes.AUX_MAIN_FAILURE]: caseFunctions.mainAuxFailure,
    [actionTypes.AUX_MAIN_RESET]: caseFunctions.mainAuxReset,

    [actionTypes.AUX_MULTI_MAIN]: caseFunctions.auxMultiMain,
    [actionTypes.AUX_MULTI_MAIN_SUCCESS]: caseFunctions.auxMultiMainSuccess,
    [actionTypes.AUX_MULTI_MAIN_FAILURE]: caseFunctions.auxMultiMainFailure,
    [actionTypes.AUX_MULTI_MAIN_RESET]: caseFunctions.auxMultiMainReset,

    [actionTypes.PAGINATED_MAIN]: caseFunctions.mainPaginated,
    [actionTypes.PAGINATED_MAIN_SUCCESS]: caseFunctions.mainPaginatedSuccess,
    [actionTypes.PAGINATED_MAIN_FAILURE]: caseFunctions.mainPaginatedFailure,
    [actionTypes.PAGINATED_MAIN_RESET]: caseFunctions.mainPaginatedReset,


    [actionTypes.UPLOAD_FILE]: caseFunctions.uploadFile,
    [actionTypes.UPLOAD_FILE_SUCCESS]: caseFunctions.uploadFileSuccess,
    [actionTypes.UPLOAD_FILE_FAILURE]: caseFunctions.uploadFileFailure,
    [actionTypes.UPLOAD_FILE_RESET]: caseFunctions.uploadFileReset,

    [actionTypes.EXPORT_DATA]: caseFunctions.exportData,
    [actionTypes.EXPORT_DATA_SUCCESS]: caseFunctions.exportDataSuccess,
    [actionTypes.EXPORT_DATA_FAILURE]: caseFunctions.exportDataFailure,
    [actionTypes.EXPORT_DATA_RESET]: caseFunctions.exportDataReset,

    [actionTypes.DATA_DYNAMIC]: caseFunctions.mainDynamic,
    [actionTypes.DATA_DYNAMIC_SUCCESS]: caseFunctions.mainDynamicSuccess,
    [actionTypes.DATA_DYNAMIC_FAILURE]: caseFunctions.mainDynamicFailure,
    [actionTypes.DATA_DYNAMIC_RESET]: caseFunctions.mainDynamicReset,

    [actionTypes.DATA_EXPORT_DYNAMIC]: caseFunctions.exportDataDynamic,
    [actionTypes.DATA_EXPORT_DYNAMIC_SUCCESS]: caseFunctions.exportDataDynamicSuccess,
    [actionTypes.DATA_EXPORT_DYNAMIC_FAILURE]: caseFunctions.exportDataDynamicFailure,
    [actionTypes.DATA_EXPORT_DYNAMIC_RESET]: caseFunctions.exportDataDynamicReset,
    [actionTypes.RESET_ALL]: caseFunctions.resetAll,
});
