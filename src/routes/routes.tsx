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
        key: paths.CORPORATIONS,
        description: <Trans i18nKey={langKeys.corporation_plural} count={2} />,
        tooltip: <Trans i18nKey={langKeys.corporation_plural} />,
        path: paths.CORPORATIONS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
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
        key: paths.DOMAINS,
        description: <Trans i18nKey={langKeys.domain_plural} count={2} />,
        tooltip: <Trans i18nKey={langKeys.domain_plural} />,
        path: paths.DOMAINS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.SHOPS,
        description: "Shops",
        tooltip: "Shops",
        path: paths.SHOPS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.CUSTOMERS,
        description: <Trans i18nKey={langKeys.customer} count={2} />,
        tooltip: <Trans i18nKey={langKeys.customer} />,
        path: paths.CUSTOMERS,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.SUPPLIER,
        description: <Trans i18nKey={langKeys.supplier} count={2} />,
        tooltip: <Trans i18nKey={langKeys.supplier} />,
        path: paths.SUPPLIER,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.SALES,
        description: <Trans i18nKey={langKeys.salesperson} count={2} />,
        tooltip: <Trans i18nKey={langKeys.salesperson} />,
        path: paths.SALES,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.PURCHASES,
        description: "Purchases",
        tooltip: "Purchases",
        path: paths.PURCHASES,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.STOCK,
        description: "Stock",
        tooltip: "Stock",
        path: paths.STOCK,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },
    {
        key: paths.SIGNIN,
        description: <Trans i18nKey={langKeys.domain_plural} count={2} />,
        tooltip: <Trans i18nKey={langKeys.domain_plural} />,
        path: paths.SIGNIN,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },

];

