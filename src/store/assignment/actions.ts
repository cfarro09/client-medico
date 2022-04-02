import { IActionCall, IRequestBody } from "@types";
import actionTypes from "./actionTypes";
import { initialState, IState } from "./reducer";
import { CommonService } from "network";
import { getGuides, getDrivers } from "../../common/helpers"

export const getDataInitial = (): IActionCall => ({
    callAPI: () => CommonService.multiMain([getGuides(), getDrivers()]),
    types: {
        loading: actionTypes.GET_DATA,
        success: actionTypes.GET_DATA_SUCCESS,
        failure: actionTypes.GET_DATA_FAILURE,
    },
    type: null,
});

export const setGuidesByDistrict = (payload: any): IActionCall => ({ type: actionTypes.SEL_DISTRICT, payload });

export const selectRoute = (payload: any): IActionCall => ({ type: actionTypes.SELECT_ROUTE, payload });

export const selectGuide = (payload: any): IActionCall => ({ type: actionTypes.SELECT_GUIDE, payload });

export const removeRoute = (payload: any): IActionCall => ({ type: actionTypes.REMOVE_ROUTE, payload });

export const setDriverToRoute = (payload: any): IActionCall => ({ type: actionTypes.ASSIGN_VEHICLE, payload });

export const addGuideToRoute = (payload: any): IActionCall => ({ type: actionTypes.ADD_GUIDE_TO_ROUTE, payload });

export const addGuideConsulted = (payload: any): IActionCall => ({ type: actionTypes.ADD_GUIDE_CONSULTED, payload });

export const addRoute = (): IActionCall => ({ type: actionTypes.ADD_ROUTE });

export const cleanAll = (): IActionCall => ({ type: actionTypes.CLEAN_ALL });