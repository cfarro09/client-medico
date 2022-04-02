import { createReducer, initialListPaginatedState } from "common/helpers";
import * as caseFUnctions from './caseFunctions';
import actionTypes from "./actionTypes";
import { Dictionary, IListStatePaginated } from "@types";

export interface IState {
    selectedRoute: number;
    selectedGuide: number;
    loadingInitial: boolean;
    districts: IListStatePaginated<Dictionary>;
    driverList: IListStatePaginated<Dictionary>;
    guideList: IListStatePaginated<Dictionary>;
    guideListToShow: IListStatePaginated<Dictionary>;
    guidesConsulted: IListStatePaginated<Dictionary>;
    routeList: IListStatePaginated<Dictionary>;
    // chatblock: Dictionary | null;
}

export const initialState: IState = {
    selectedRoute: -1,
    selectedGuide: -1,
    districts: initialListPaginatedState,
    loadingInitial: false,
    driverList: initialListPaginatedState,
    guideList: initialListPaginatedState,
    guideListToShow: initialListPaginatedState,
    routeList: initialListPaginatedState,
    guidesConsulted: initialListPaginatedState,
};

export default createReducer<IState>(initialState, {
    [actionTypes.GET_DATA]: caseFUnctions.getData,
    [actionTypes.GET_DATA_SUCCESS]: caseFUnctions.getDataSuccess,
    [actionTypes.GET_DATA_FAILURE]: caseFUnctions.getDataFailure,
    [actionTypes.SEL_DISTRICT]: caseFUnctions.setDistrict,
    [actionTypes.ADD_ROUTE]: caseFUnctions.addRoute,
    [actionTypes.SELECT_ROUTE]: caseFUnctions.selectRoute,
    
    [actionTypes.ASSIGN_VEHICLE]: caseFUnctions.setDriverToRoute,
    [actionTypes.REMOVE_ROUTE]: caseFUnctions.removeRoute,
    [actionTypes.ADD_GUIDE_TO_ROUTE]: caseFUnctions.addGuideToRoute,
    [actionTypes.ADD_GUIDE_CONSULTED]: caseFUnctions.addGuideConsulted,
    [actionTypes.SELECT_GUIDE]: caseFUnctions.selectGuide,
    [actionTypes.CLEAN_ALL]: caseFUnctions.cleanAll,
    // [actionTypes.CHATBLOCK_RESET]: caseFUnctions.chatblock_reset
});