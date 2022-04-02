import callAPIMiddleware from 'middlewares/apiMiddleware';
import { applyMiddleware, compose, createStore, combineReducers, Middleware } from 'redux';
import thunk from 'redux-thunk';
import ticketReducer, { IState as ITicketState } from './ticket/reducer';
import channelReducer, { IState as IChannelState } from './channel/reducer';
import loginReducer, { IState as ILogin } from './login/reducer';
import mainReducer, { IState as IMain } from './main/reducer';
import popusReducer, { IState as IPopus } from './popus/reducer';
import inboxReducer, { IState as IInbox } from './inbox/reducer';
import integrationManagerReducer, { IState as IIntegrationManager } from './integrationmanager/reducer';
import assignmentReducer, { IState as IAsignment } from './assignment/reducer';
import signupReducer, { IState as ISignUp} from './signup/reducer';
import personReducer, { IState as IPerson } from './person/reducer';
import settingReducer, { IState as ISetting } from './setting/reducer';
import activationUserReducer, { IState as IActivationUser } from './activationuser/reducer';
import leadReducer, { IState as ILead } from './lead/reducer';
import culqiReducer, { IState as ICulqi } from './culqi/reducer';
import dashboardReducer, { IState as IDashboard } from './dashboard/reducer';

export interface IRootState {
    login: ILogin,
    popus: IPopus;
    main: IMain;
    // ticket: ITicketState;
    inbox: IInbox;
    // channel: IChannelState;
    // integrationmanager: IIntegrationManager;
    assignment: IAsignment;
    // signup: ISignUp;
    // person: IPerson;
    // setting: ISetting;
    // activationuser: IActivationUser;
    // lead: ILead;
    // culqi: ICulqi;
    // dashboard: IDashboard;
}

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}   

const rootReducer = combineReducers<IRootState>({
    login: loginReducer,
    main: mainReducer,
    popus: popusReducer,
    assignment: assignmentReducer,
    // ticket: ticketReducer,
    inbox: inboxReducer,
    // integrationmanager: integrationManagerReducer,
    // channel: channelReducer,
    // botdesigner: botdesignerReducer,
    // signup: signupReducer,
    // person: personReducer,
    // setting: settingReducer,
    // activationuser: activationUserReducer,
    // lead: leadReducer,
    // culqi: culqiReducer,
    // dashboard: dashboardReducer,
});

export default function configureStore(preloadedState?: IRootState) {
    const middleware: Middleware[] = [callAPIMiddleware];

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const middlewareEnhancer = composeEnhancers(applyMiddleware(thunk, ...middleware));

    return createStore(rootReducer, preloadedState, middlewareEnhancer);
}
