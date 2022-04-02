import { AccountCircle, AssignmentInd, Event, GroupWork, HomeWork, People, Store, ShoppingCart, CompareArrows, AssignmentTurnedIn } from "@material-ui/icons";
import { RouteConfig } from "@types";
import paths from "common/constants/paths";
import {
    DashboardIcon, ReportsIcon, ExtrasIcon
} from 'icons';
import { langKeys } from "lang/keys";
import { Trans } from "react-i18next";

export const routes: RouteConfig[] = [
    {
        key: paths.DASHBOARD,
        description: <Trans i18nKey={langKeys.dashboard} />,
        tooltip: <Trans i18nKey={langKeys.dashboard} />,
        path: paths.DASHBOARD,
        icon: (className) => <DashboardIcon style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.REPORTS,
        description: <Trans i18nKey={langKeys.report} count={2} />, // prop:count for plural purposes
        tooltip: <Trans i18nKey={langKeys.report} count={2} />,
        path: paths.REPORTS,
        icon: (className) => <ReportsIcon style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.USERS,
        description: <Trans i18nKey={langKeys.user} />,
        tooltip: <Trans i18nKey={langKeys.user} />,
        path: paths.USERS,
        icon: (className) => <AccountCircle style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.PATIENT,
        description: "Paciente",
        tooltip: "Paciente",
        path: paths.PATIENT,
        icon: (className) => <AccountCircle style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.ROLES_PERMISSIONS,
        description: <Trans i18nKey={langKeys.roles_permissions} />,
        tooltip: <Trans i18nKey={langKeys.roles_permissions} />,
        path: paths.ROLES_PERMISSIONS,
        icon: (className) => <AssignmentInd style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.MARKET,
        description: <Trans i18nKey={langKeys.market_plural} />,
        tooltip: <Trans i18nKey={langKeys.market_plural} />,
        path: paths.MARKET,
        icon: (className) => <ShoppingCart style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.DISTRIBUTORS,
        description: <Trans i18nKey={langKeys.distributor} />,
        tooltip: <Trans i18nKey={langKeys.distributor} />,
        path: paths.DISTRIBUTORS,
        icon: (className) => <HomeWork style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.MERCHANDISE,
        description: <Trans i18nKey={langKeys.merchandises} />,
        tooltip: <Trans i18nKey={langKeys.merchandises} />,
        path: paths.MERCHANDISE,
        icon: (className) => <Store style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.PRODUCTS,
        description: <Trans i18nKey={langKeys.products} />,
        tooltip: <Trans i18nKey={langKeys.products} />,
        path: paths.PRODUCTS,
        icon: (className) => <GroupWork style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.VISITS_PLANNING,
        description: <Trans i18nKey={langKeys.visit_plannig} />,
        tooltip: <Trans i18nKey={langKeys.visit_plannig} />,
        path: paths.VISITS_PLANNING,
        icon: (className) => <Event style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.VISITS,
        description: <Trans i18nKey={langKeys.visits} />,
        tooltip: <Trans i18nKey={langKeys.visits} />,
        path: paths.VISITS,
        icon: (className) => <CompareArrows style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.ATTENDANCE_REPORT,
        description: <Trans i18nKey={langKeys.attendance_report} />,
        tooltip: <Trans i18nKey={langKeys.attendance_report} />,
        path: paths.ATTENDANCE_REPORT,
        icon: (className) => <AssignmentTurnedIn style={{ width: 22, height: 22 }} className={className} />,
    },

    {
        key: paths.SALES_REPORT,
        description: "Reporte de ventas",
        tooltip: "Reporte de ventas",
        path: paths.SALES_REPORT,
        icon: (className) => <AssignmentTurnedIn style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.STOCK_REPORT,
        description: "Reporte de stocks",
        tooltip: "Reporte de stocks",
        path: paths.STOCK_REPORT,
        icon: (className) => <AssignmentTurnedIn style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.COVERAGE_REPORT,
        description: "Reporte de cobertura",
        tooltip: "Reporte de cobertura",
        path: paths.COVERAGE_REPORT,
        icon: (className) => <AssignmentTurnedIn style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.PHOTO_REPORT,
        description: "Reporte fotográfico",
        tooltip: "Reporte fotográfico",
        path: paths.PHOTO_REPORT,
        icon: (className) => <AssignmentTurnedIn style={{ width: 22, height: 22 }} className={className} />,
    },


    {
        key: paths.PROPERTIES,
        description: <Trans i18nKey={langKeys.property} count={2} />,
        tooltip: <Trans i18nKey={langKeys.property} />,
        path: paths.PROPERTIES,
        icon: (className) => <ReportsIcon style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.DOMAINS,
        description: <Trans i18nKey={langKeys.domain_plural} count={2} />,
        tooltip: <Trans i18nKey={langKeys.domain_plural} />,
        path: paths.DOMAINS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },


  



    {
        key: paths.UPLOAD_DATA,
        description: <Trans i18nKey={langKeys.upload_data} count={2} />,
        tooltip: <Trans i18nKey={langKeys.upload_data} />,
        path: paths.UPLOAD_DATA,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.ROUTING,
        description: <Trans i18nKey={langKeys.routing} count={2} />,
        tooltip: <Trans i18nKey={langKeys.routing} />,
        path: paths.ROUTING,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.MANIFEST,
        description: <Trans i18nKey={langKeys.manifest} count={2} />,
        tooltip: <Trans i18nKey={langKeys.manifest} />,
        path: paths.MANIFEST,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.FLEET,
        description: <Trans i18nKey={langKeys.fleet} count={2} />,
        tooltip: <Trans i18nKey={langKeys.fleet} />,
        path: paths.FLEET,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    // {
    //     key: paths.CLIENTS,
    //     description: <Trans i18nKey={langKeys.client} count={2} />,
    //     tooltip: <Trans i18nKey={langKeys.client} />,
    //     path: paths.CLIENTS,
    //     icon: (color) => <People stroke={color} fill={color} />,
    // },
    {
        key: paths.KPIS,
        description: <Trans i18nKey={langKeys.kpis} count={2} />,
        tooltip: <Trans i18nKey={langKeys.kpis} />,
        path: paths.KPIS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.EVIDENCES,
        description: <Trans i18nKey={langKeys.evidences} count={2} />,
        tooltip: <Trans i18nKey={langKeys.evidences} />,
        path: paths.EVIDENCES,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.REPORT_DISTRIBUTION,
        description: <Trans i18nKey={langKeys.report_distribution} count={2} />,
        tooltip: <Trans i18nKey={langKeys.report_distribution} />,
        path: paths.REPORT_DISTRIBUTION,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.TRACKING,
        description: <Trans i18nKey={langKeys.tracking} count={2} />,
        tooltip: <Trans i18nKey={langKeys.tracking} />,
        path: paths.TRACKING,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.DOMAINS,
        description: <Trans i18nKey={langKeys.template} count={2} />,
        tooltip: <Trans i18nKey={langKeys.template} />,
        path: paths.DOMAINS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.REPORT_PROVIDER,
        description: "R. control proveedor",
        tooltip: <Trans i18nKey={langKeys.domain_plural} />,
        path: paths.REPORT_PROVIDER,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.REPORT_SKU,
        description: "R. control SKU",
        tooltip: <Trans i18nKey={langKeys.domain_plural} />,
        path: paths.REPORT_SKU,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    

];

