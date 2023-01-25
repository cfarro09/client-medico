import { AccountBalance, AccountBalanceWallet, AccountCircle, AllInbox, Apartment, AssignmentInd, Domain, LocalMall, LocalShipping, Loyalty, Receipt, Store } from "@material-ui/icons";
import { RouteConfig } from "@types";
import paths from "common/constants/paths";
import {
    DashboardIcon, ReportsIcon, ExtrasIcon
} from 'icons';
import { langKeys } from "lang/keys";
import { Trans } from "react-i18next";

export const routes: RouteConfig[] = [
    // {
    //     key: paths.DASHBOARD,
    //     description: <Trans i18nKey={langKeys.dashboard} />,
    //     tooltip: <Trans i18nKey={langKeys.dashboard} />,
    //     path: paths.DASHBOARD,
    //     icon: (className) => <DashboardIcon style={{ width: 22, height: 22 }} className={className} />,
    // },
    // {
    //     key: paths.CORPORATIONS,
    //     description: <Trans i18nKey={langKeys.corporation_plural} count={2} />,
    //     tooltip: <Trans i18nKey={langKeys.corporation_plural} />,
    //     path: paths.CORPORATIONS,
    //     icon: (color) => <Apartment stroke={color} fill={color} />,
    // },
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
        key: paths.DRIVER,
        description: 'Conductores',
        tooltip: 'Conductores',
        path: paths.DRIVER,
        icon: (className) => <AccountCircle style={{ width: 22, height: 22 }} className={className} />,
    },
    {
        key: paths.DOMAINS,
        description: <Trans i18nKey={langKeys.domain_plural} count={2} />,
        tooltip: <Trans i18nKey={langKeys.domain_plural} />,
        path: paths.DOMAINS,
        icon: (color) => <Domain stroke={color} fill={color} />,
    },
    // {
    //     key: paths.SHOPS,
    //     description: "Shops",
    //     tooltip: "Shops",
    //     path: paths.SHOPS,
    //     icon: (color) => <Store stroke={color} fill={color} />,
    // },
    {
        key: paths.CUSTOMERS,
        description: 'Clientes',
        tooltip: 'Clientes',
        path: paths.CUSTOMERS,
        icon: (color) => <AssignmentInd stroke={color} fill={color} />,
    },
    {
        key: paths.SUPPLIER,
        description: <Trans i18nKey={langKeys.supplier} count={2} />,
        tooltip: <Trans i18nKey={langKeys.supplier} />,
        path: paths.SUPPLIER,
        icon: (color) => <Store stroke={color} fill={color} />,
    },
    {
        key: paths.VEHICLE,
        description: 'Vehiculos',
        tooltip: 'Vehiculos',
        path: paths.VEHICLE,
        icon: (color) => <LocalShipping stroke={color} fill={color} />,
    },
    {
        key: paths.SALES,
        description: <Trans i18nKey={langKeys.sales} count={2} />,
        tooltip: <Trans i18nKey={langKeys.sales} />,
        path: paths.SALES,
        icon: (color) => <Loyalty stroke={color} fill={color} />,
    },
    {
        key: paths.FORWARD,
        description: <Trans i18nKey={langKeys.routes} count={2} />,
        tooltip: <Trans i18nKey={langKeys.routes} />,
        path: paths.FORWARD,
        icon: (color) => <Loyalty stroke={color} fill={color} />,
    },
    {
        key: paths.ACCOUNT,
        description: 'Cuentas',
        tooltip: 'Cuentas',
        path: paths.ACCOUNT,
        icon: (color) => <AccountBalance stroke={color} fill={color} />,
    },
    {
        key: paths.PAYMENT_METHODS,
        description: 'Metodos de Pago',
        tooltip: 'Metodos de Pago',
        path: paths.PAYMENT_METHODS,
        icon: (color) => <AccountBalanceWallet stroke={color} fill={color} />,
    },
    {
        key: paths.PURCHASES,
        description: "Compras",
        tooltip: "Compras",
        path: paths.PURCHASES,
        icon: (color) => <Receipt stroke={color} fill={color} />,
    },
    {
        key: paths.STOCK,
        description: "Inventario",
        tooltip: "Inventario",
        path: paths.STOCK,
        icon: (color) => <AllInbox stroke={color} fill={color} />,
    },
    {
        key: paths.PRODUCTS,
        description: "Productos",
        tooltip: "Productos",
        path: paths.PRODUCTS,
        icon: (color) => <LocalMall stroke={color} fill={color} />,
    },
    {
        key: paths.SIGNIN,
        description: <Trans i18nKey={langKeys.domain_plural} count={2} />,
        tooltip: <Trans i18nKey={langKeys.domain_plural} />,
        path: paths.SIGNIN,
        icon: (color) => <ExtrasIcon stroke={color} fill={color} />,
    },

];

