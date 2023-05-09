/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, lazy } from "react";
import Layout from 'components/layout/Layout';
import Popus from 'components/layout/Popus';
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

const Users = lazy(() => import('pages/User/Index'));
const SignIn = lazy(() => import('pages/SignIn'));
const NotFound = lazy(() => import('pages/NotFound'));
const Forbidden = lazy(() => import('pages/Forbidden'));
const InternalServererror = lazy(() => import('pages/InternalServerError'));
const Shops = lazy(() => import('pages/Shop/Index'));
const Purachases = lazy(() => import('pages/Purchases/Index'));
const Sales = lazy(() => import('pages/Sales/Index'));
const Stock = lazy(() => import('pages/Stock/Index'));
const Supplier = lazy(() => import('pages/Supplier/Index'));
const Corporation = lazy(() => import('pages/Corporation/Index'));
const Products = lazy(() => import('pages/Product/Index'));
const Domains = lazy(() => import('pages/Domain/Index'));
const Customer = lazy(() => import('pages/Customer/Index'));
const Dashboard = lazy(() => import('pages/Dashboard/Index'));
const Routes = lazy(() => import('pages/Routes/Index'));
const Account = lazy(() => import('pages/Account/Index'));
const PaymentMethods = lazy(() => import('pages/PaymentMethods/Index'));
const Vehicle = lazy(() => import('pages/Vehicle/Index'));
const Driver = lazy(() => import('pages/Driver/Index'));
const Cashbox = lazy(() => import('pages/Cashbox/Index'));
const Biker = lazy(() => import('pages/Biker/Index'));
const Assistant = lazy(() => import('pages/Assistant/Index'));
const Warehouse = lazy(() => import('pages/Warehouse/Index'));
const Staff = lazy(() => import('pages/Staff/Index'));
const AccountReceivable = lazy(() => import('pages/AccountReceivable/Index'));
const Incomes = lazy(() => import('pages/Incomes/Index'));
const Outflows = lazy(() => import('pages/Outflows/Index'));

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
	// const resLogin = useSelector(state => state.login.login);

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
			// const automaticConnection = resLogin.user?.automaticConnection || false;
			// const { userid, orgid } = resValidateToken.user!!
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
			<React.Suspense fallback={(
				<Backdrop style={{ zIndex: 999999999, color: '#fff', }} open={true}>
					<CircularProgress color="inherit" />
				</Backdrop>
			)}>
				<Switch>
					<ProtectRoute exact path="/" />
					<Route exact path={paths.SIGNIN} component={SignIn} />

					<ProtectRoute exact path={paths.USER}>
						<Layout mainClasses={classes.main}><Users /></Layout>
					</ProtectRoute>

					<ProtectRoute exact path={paths.DASHBOARD}>
						<Layout mainClasses={classes.main}><Dashboard /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.CORPORATIONS}>
						<Layout mainClasses={classes.main}><Corporation /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.DOMAINS}>
						<Layout mainClasses={classes.main}><Domains /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.SHOPS}>
						<Layout mainClasses={classes.main}><Shops /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.CUSTOMERS}>
						<Layout mainClasses={classes.main}><Customer /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.PURCHASES}>
						<Layout mainClasses={classes.main}><Purachases /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.SALES}>
						<Layout mainClasses={classes.main}><Sales /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.ROUTE}>
						<Layout mainClasses={classes.main}><Routes /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.ACCOUNT}>
						<Layout mainClasses={classes.main}><Account /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.PAYMENT_METHODS}>
						<Layout mainClasses={classes.main}><PaymentMethods /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.STOCK}>
						<Layout mainClasses={classes.main}><Stock /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.SUPPLIER}>
						<Layout mainClasses={classes.main}><Supplier /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.PRODUCTS}>
						<Layout mainClasses={classes.main}><Products /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.VEHICLE}>
						<Layout mainClasses={classes.main}><Vehicle /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.DRIVER}>
						<Layout mainClasses={classes.main}><Driver /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.CASH_BOX}>
						<Layout mainClasses={classes.main}><Cashbox /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.BIKERS}>
						<Layout mainClasses={classes.main}><Biker /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.ASSISTANT}>
						<Layout mainClasses={classes.main}><Assistant /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.WAREHOUSE}>
						<Layout mainClasses={classes.main}><Warehouse /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.STAFF}>
						<Layout mainClasses={classes.main}><Staff /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.ACCOUNT_RECEIVABLE}>
						<Layout mainClasses={classes.main}><AccountReceivable /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.INCOMES}>
						<Layout mainClasses={classes.main}><Incomes /></Layout>
					</ProtectRoute>
					<ProtectRoute exact path={paths.OUTFLOWS}>
						<Layout mainClasses={classes.main}><Outflows /></Layout>
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
			</React.Suspense>
		</Router >
	);
};

export default RouterApp;