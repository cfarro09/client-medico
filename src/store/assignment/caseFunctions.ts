import { Dictionary, IAction } from "@types";
import { initialListState } from "common/helpers";

import { initialState, IState } from "./reducer";

export const getData = (state: IState): IState => ({
    ...state,
    loadingInitial: true
});

export const getDataSuccess = (state: IState, action: IAction): IState => {
    // district
    const districts = Array.from(new Set(action.payload.data[0].data.map((x: Dictionary) => x.district)))
    return {
        ...state,
        loadingInitial: false,
        driverList: {
            ...state.driverList,
            data: action.payload.data[1].data.map((x: Dictionary) => ({ ...x, description: `${x.fullname} ${x.plate_number} ${x.vehicle_type}` }))
        },
        districts: {
            ...state.districts,
            data: [{ district: 'TODOS' }, ...districts.map(district => ({ district }))]
        },
        guideList: {
            ...state.driverList,
            data: action.payload.data[0].data
        },
        routeList: {
            ...state.routeList,
            data: [{
                id: 0,
                guides: [],
                driverid: 0,
                description: ''
            }]
        },
        selectedRoute: 0
    }
};

export const getDataFailure = (state: IState, action: IAction): IState => ({
    ...state,
    driverList: initialState.driverList,
    guideList: initialState.guideList,
    loadingInitial: false,
});

export const setDistrict = (state: IState, action: IAction): IState => ({
    ...state,
    guideListToShow: {
        ...state.guideListToShow,
        data: action.payload
    },
    // SEL_DISTRICT
});

export const addRoute = (state: IState): IState => ({
    ...state,
    routeList: {
        ...state.routeList,
        data: [
            ...state.routeList.data,
            {
                id: state.routeList.data.length,
                guides: [],
                driverid: 0,
                vehicleid: 0,
            }]
    },
});

export const removeRoute = (state: IState,  action: IAction): IState => ({
    ...state,
    routeList: {
        ...state.routeList,
        data: state.routeList.data.filter(x => x.id !== action.payload)
    },
});

export const setDriverToRoute = (state: IState,  action: IAction): IState => ({
    ...state,
    routeList: {
        ...state.routeList,
        data: state.routeList.data.map(x => x.id === action.payload.id ? {
            ...x,
            driverid: action.payload.driverid,
            vehicleid: action.payload.vehicleid,
            plate_number: action.payload.plate_number,
            description: action.payload.description,
        } : x)
    },
});

export const addGuideToRoute = (state: IState,  action: IAction): IState => ({
    ...state,
    routeList: {
        ...state.routeList,
        data: state.routeList.data.map(x => x.id === action.payload.id ? {
            ...x,
            guides: [...x.guides, ...action.payload.guides]
        } : x)
    },
});

export const addGuideConsulted = (state: IState,  action: IAction): IState => ({
    ...state,
    guidesConsulted: {
        ...state.routeList,
        data: [...state.guidesConsulted.data, ...action.payload]
    },
});

export const selectRoute = (state: IState, action: IAction): IState => ({
    ...state,
    selectedRoute: action.payload
});

export const selectGuide = (state: IState, action: IAction): IState => ({
    ...state,
    selectedGuide: action.payload
});

export const cleanAll = (state: IState, action: IAction): IState => ({
    ...state,
    ...initialState
});

// export const getDataReset = (state: IState): IState => ({
//     ...state,
//     mainData: initialState.mainData,
// });
