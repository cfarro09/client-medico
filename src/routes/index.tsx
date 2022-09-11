/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC } from "react";
import Layout from 'components/layout/Layout';
import Popus from 'components/layout/Popus';
import {
	Users, SignIn, NotFound, Forbidden, InternalServererror, Domains,
	Shops, Customers, Purachases, Sales, Stock, Supplier, Corporation
} from 'pages';

import { BrowserRouter as Router, Switch, Route, RouteProps, useLocation } from 'react-router-dom';
import paths from "common/constants/paths";
import { makeStyles } from "@material-ui/core";
import { useSelector } from 'hooks';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getAccessToken } from 'common/helpers';
import { Redirect } from 'react-router-dom';
import { validateToken } from 'store/login/actions';
import { useDispatch } from 'react-redux';

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
			// dispatch(wsConnect({ userid, orgid, usertype: 'PLATFORM', automaticConnection }));
		}
	}, [resValidateToken])

	if (!existToken) {
		return <Redirect to={{ pathname: paths.SIGNIN }} />;
	} else if (resValidateToken.loading && !applications) {
		return (
			<Route {...rest}>
				<Backdrop style={{ zIndex: 999999999, color: '#fff', }} open={true}>
					<CircularProgress color="inherit" />
				</Backdrop>
			</Route>
		);
	} else if (resValidateToken.error) {
		return <Redirect to={{ pathname: paths.SIGNIN }} />;
	} else if (Component) {
		return <Route {...rest} render={props => <Component {...props} />} />;
	} else if (location.pathname === "/") {
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

				<ProtectRoute exact path={paths.USERS}>
					<Layout mainClasses={classes.main}><Users /></Layout>
				</ProtectRoute>

				<ProtectRoute exact path={paths.DOMAINS}>
					<Layout mainClasses={classes.main}><Domains /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.CORPORATIONS}>
					<Layout mainClasses={classes.main}><Corporation /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.SHOPS}>
					<Layout mainClasses={classes.main}><Shops /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.CUSTOMERS}>
					<Layout mainClasses={classes.main}><Customers /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.PURCHASES}>
					<Layout mainClasses={classes.main}><Purachases /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.SALES}>
					<Layout mainClasses={classes.main}><Sales /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.STOCK}>
					<Layout mainClasses={classes.main}><Stock /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.SUPPLIER}>
					<Layout mainClasses={classes.main}><Supplier /></Layout>
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