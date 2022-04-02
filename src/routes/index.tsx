/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC } from "react";
import Layout from 'components/layout/Layout';
import Popus from 'components/layout/Popus';
import {
	Users, SignIn, Properties, NotFound, Forbidden, InternalServererror,
	Reports, Corporations, Organizations, MassiveLoad, Routing, Tracking, Manifest,
	ReportProvider, ReportSKU, Vehicles
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
import Clients from "pages/Clients";
import Roles from "pages/Roles";
import Distributors from "pages/Distributors";
import Merchandise from "pages/Merchandise";
import Products from "pages/Products";
import VisitPlanning from "pages/VisitPlanning";
import Markets from "pages/Markets";
import Visits from "pages/Visits";
import AttendanceReport from "pages/AttendanceReport";
import SalesReport from "pages/SalesReport";
import StockReport from "pages/StockReport";
import ReportCoverage from "pages/ReportCoverage";
import ReportPhoto from "pages/ReportPhoto";

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
			dispatch(wsConnect({ userid, orgid, usertype: 'PLATFORM', automaticConnection  }));
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
	} else if (location.pathname === "/") { //borrar esto, solo es por mientras no tenemos ruta raiz
		return <Redirect to={{ pathname: paths.VISITS }} />;
	} else if (!applications?.[location.pathname]?.[0] && !location.pathname.includes('channels') && !location.pathname.includes('person') && !location.pathname.includes('crm') && !location.pathname.includes('dashboard')) {
		return <Redirect to={{ pathname: "/403" }} />;
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
				
				<ProtectRoute exact path={paths.UPLOAD_DATA}>
					<Layout mainClasses={classes.main}>
						<MassiveLoad />
					</Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.ROUTING}>
					<Layout mainClasses={classes.main}>
						<Routing />
					</Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.TRACKING}>
					<Layout mainClasses={classes.main}>
						<Tracking />
					</Layout>
				</ProtectRoute>

				<ProtectRoute exact path={paths.REPORTS}>
					<Layout mainClasses={classes.main}>
						<Reports />
					</Layout>
				</ProtectRoute>
			
				<ProtectRoute exact path={paths.CORPORATIONS}>
					<Layout mainClasses={classes.main}>
						<Corporations />
					</Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.ORGANIZATIONS}>
					<Layout mainClasses={classes.main}>
						<Organizations />
					</Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.MANIFEST}>
					<Layout mainClasses={classes.main}>
						<Manifest />
					</Layout>
				</ProtectRoute>
				
				<ProtectRoute exact path={paths.PROPERTIES}>
					<Layout mainClasses={classes.main}><Properties /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.USERS}>
					<Layout mainClasses={classes.main}><Users /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.ROLES_PERMISSIONS}>
					<Layout mainClasses={classes.main}><Roles /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.MARKET}>
					<Layout mainClasses={classes.main}><Markets /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.DISTRIBUTORS}>
					<Layout mainClasses={classes.main}><Distributors /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.MERCHANDISE}>
					<Layout mainClasses={classes.main}><Merchandise /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.PRODUCTS}>
					<Layout mainClasses={classes.main}><Products /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.CLIENTS}>
					<Layout mainClasses={classes.main}><Clients /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.VISITS_PLANNING}>
					<Layout mainClasses={classes.main}><VisitPlanning /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.VISITS}>
					<Layout mainClasses={classes.main}><Visits /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.ATTENDANCE_REPORT}>
					<Layout mainClasses={classes.main}><AttendanceReport /></Layout>
				</ProtectRoute>

				<ProtectRoute exact path={paths.SALES_REPORT}>
					<Layout mainClasses={classes.main}><SalesReport /></Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.STOCK_REPORT}>
					<Layout mainClasses={classes.main}><StockReport /></Layout>
				</ProtectRoute>

				<ProtectRoute exact path={paths.FLEET}>
					<Layout mainClasses={classes.main}><Vehicles /></Layout>
				</ProtectRoute>



				<ProtectRoute exact path={paths.REPORT_PROVIDER}>
					<Layout mainClasses={classes.main}>
						<ReportProvider />
					</Layout>
				</ProtectRoute>
				<ProtectRoute exact path={paths.REPORT_SKU}>
					<Layout mainClasses={classes.main}>
						<ReportSKU />
					</Layout>
				</ProtectRoute>

				<ProtectRoute exact path={paths.COVERAGE_REPORT}>
					<Layout mainClasses={classes.main}>
						<ReportCoverage />
					</Layout>
				</ProtectRoute>

				<ProtectRoute exact path={paths.PHOTO_REPORT}>
					<Layout mainClasses={classes.main}>
						<ReportPhoto />
					</Layout>
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