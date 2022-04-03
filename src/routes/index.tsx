/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC } from "react";
import Layout from 'components/layout/Layout';
import Popus from 'components/layout/Popus';
import {
	Users, SignIn, Properties, NotFound, Forbidden, InternalServererror,
	Reports, Corporations, Organizations, MassiveLoad, Routing, Tracking, Manifest,
	ReportProvider, ReportSKU, Vehicles, Patient
} from 'pages';

import { BrowserRouter as Router, Switch, Route, RouteProps, useLocation } from 'react-router-dom';
import paths from "common/constants/paths";
import { makeStyles } from "@material-ui/core";
import { useSelector } from 'hooks';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { wsConnect } from "store/inbox/actions";
import { getAccessToken } from 'common/helpers';
import { Redirect } from 'react-router-dom';
import { validateToken } from 'store/login/actions';
import { useDispatch } from 'react-redux';
import Roles from "pages/Roles";
const useStyles = makeStyles((theme) => ({
	main: {
		padding: theme.spacing(2),
		paddingTop: theme.spacing(1),
		width: '100%'
	},
}));

interface PrivateRouteProps extends Omit<RouteProps, "component"> {
	component?: React.ElementType;
}

// view: 0
// modify: 1
// insert: 2
// delete: 3

const ProtectRoute: FC<PrivateRouteProps> = ({ children, component: Component, ...rest }) => {
	const resValidateToken = useSelector(state => state.login.validateToken);
	const resLogin = useSelector(state => state.login.login);

	const applications = resValidateToken?.user?.menu;
	const location = useLocation();

	const dispatch = useDispatch();
	const existToken = getAccessToken();

	React.useEffect(() => {
		if (existToken)
			dispatch(validateToken());
	}, [])

	React.useEffect(() => {
		if (!resValidateToken.error && !resValidateToken.loading) {
			const automaticConnection = resLogin.user?.automaticConnection || false;
			const { userid, orgid } = resValidateToken.user!!
			dispatch(wsConnect({ userid, orgid, usertype: 'PLATFORM', automaticConnection }));
		}
	}, [resValidateToken])
	
	if (!existToken) {
		console.log('11', location.pathname)
		return <Redirect to={{ pathname: paths.SIGNIN }} />;
	} else if (resValidateToken.loading && !applications) {
		console.log('22', location.pathname)
		return (
			<Route {...rest}>
				<Backdrop style={{ zIndex: 999999999, color: '#fff', }} open={true}>
					<CircularProgress color="inherit" />
				</Backdrop>
			</Route>
		);
	} else if (resValidateToken.error) {
		console.log('333', location.pathname)
		return <Redirect to={{ pathname: paths.SIGNIN }} />;
	} else if (Component) {
		console.log('4444', location.pathname)
		return <Route {...rest} render={props => <Component {...props} />} />;
	} else if (location.pathname === "/") {
		console.log('entro')
		return <Redirect to={{ pathname: resValidateToken.user?.redirect }} />
	}
	return <Route {...rest}>{children}</Route>;
}

const RouterApp: FC = () => {
	const classes = useStyles();

	return (
		<Router basename={process.env.PUBLIC_URL}>
			<Switch>
				<ProtectRoute exact path="/" />
				<Route exact path={paths.SIGNIN} component={SignIn} />

				<ProtectRoute exact path={paths.PROPERTIES}>
					<Layout mainClasses={classes.main}><Properties /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.USERS}>
					<Layout mainClasses={classes.main}><Users /></Layout>
				</ProtectRoute>


				<ProtectRoute exact path={paths.PATIENT}>
					<Layout mainClasses={classes.main}><Patient /></Layout>
				</ProtectRoute>


				<ProtectRoute exact path={paths.ROLES_PERMISSIONS}>
					<Layout mainClasses={classes.main}><Roles /></Layout>
				</ProtectRoute>


				<Route exact path="/403">
					<Forbidden />
				</Route>
				<Route exact path="/500">
					<InternalServererror />
				</Route>
				<Route>
					<NotFound />
				</Route>
				<Popus />
			</Switch >
		</Router >
	);
};

export default RouterApp;