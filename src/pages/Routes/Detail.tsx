/* eslint-disable react-hooks/exhaustive-deps */
import { DetailModule, Dictionary } from "@types";
import { FieldMultiSelect, FieldSelect, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute, getMultiCollectionAux } from "store/main/actions";
import {
    insRoute,
    getRouteStockSel,
    getRouteCashSel,
    getRouteSalesLst,
    getRouteSalesPaymentsLst,
    getRouteSalesPaymentsDetail,
    formatMoney,
    setTitleCase,
    getRouteSettlementsDetail,
} from "common/helpers";
import {
    Button,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    AppBar,
    Tab,
    Box,
    CircularProgress,
    TablePagination,
    Avatar,
    Modal,
    Backdrop,
    Fade,
} from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import AddIcon from "@material-ui/icons/Add";
import { CheckCircle, Error } from "@material-ui/icons";
import SettlementDetailModal from "./Modals/SettlementDetailModal";

interface TabPanelProps {
    value: string;
    index: string;
}

const arrayBread = [
    { id: "view-1", name: "Ruta" },
    { id: "view-2", name: "Detalles de ruta" },
];

const TabPanel: FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`wrapped-tabpanel-${index}`}
            aria-labelledby={`wrapped-tab-${index}`}
            style={{ display: value === index ? "block" : "none" }}
        >
            <Box>{children}</Box>
        </div>
    );
};

const useStyles: any = makeStyles((theme) => ({
    containerDetail: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        background: "#fff",
        width: "100%",
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: "14px",
        textTransform: "initial",
    },
    title: {
        fontSize: "22px",
        color: theme.palette.text.primary,
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: "33.33%",
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    tabs: {
        color: theme.palette.primary.main,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        width: "inherit",
    },
    tab: {
        // width: 130,
        height: 45,
        maxWidth: "unset",
        flexGrow: 1,
    },
    taCenter: {
        textAlign: "center",
    },
    taRight: {
        textAlign: "right",
    },
    customModal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: "2px solid #000",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

type FormFields = {
    id: number;
    userid: number;
    warehouseid: number;
    assistants: string;
    route: string;
    zone: string;
};

const DetailPurcharse: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const multiDataAux = useSelector((state) => state.main.multiDataAux);
    const [tabIndex, setTabIndex] = useState("0");
    const [loading, setLoading] = useState<Boolean>(false);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [dataExtra, setDataExtra] = useState<{
        driver: Dictionary[];
        routes: Dictionary[];
        vehicle: Dictionary[];
        assistans: Dictionary[];
    }>({
        driver: [],
        routes: [],
        vehicle: [],
        assistans: [],
    });
    const [dataAux, setDataAux] = useState<{
        stock: Dictionary[];
        cash: Dictionary[];
        sales: Dictionary[];
        cash_info: Dictionary[];
        payments_detail: Dictionary[];
        settlement_detail: Dictionary[];
    }>({
        settlement_detail: [],
        payments_detail: [],
        cash_info: [],
        cash: [],
        sales: [],
        stock: [],
    });
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Dictionary | null>(null);

    const [expanded, setExpanded] = React.useState<string | false>("panel1");

    const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const {
        register,
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
        trigger,
    } = useForm<FormFields>({
        defaultValues: {
            id: row?.id || 0,
            userid: row?.userid || 0,
            warehouseid: row?.warehouseid || 0,
            route: row?.route || "",
            zone: row?.zone || "",
            assistants: "",
        },
    });

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const driver = multiData.data.find((x) => x.key === "UFN_DRIVER_USERS_SEL");
            const routes = multiData.data.find((x) => x.key === "DOMAIN-RUTAS");
            const vehicle = multiData.data.find((x) => x.key === "UFN_AVAILABLE_VEHICLE_LST");
            const assistans = multiData.data.find((x) => x.key === "UFN_ASSISTANTS_SEL");

            setDataExtra({
                routes: routes?.data || [],
                driver: driver?.data || [],
                vehicle: vehicle?.data || [],
                assistans: assistans?.data || [],
            });
        }
    }, [multiData]);

    useEffect(() => {
        if (!multiDataAux.error && !multiDataAux.loading) {
            const stock = multiDataAux.data.find((x) => x.key === "UFN_ROUTE_STOCK_SEL");
            const cash = multiDataAux.data.find((x) => x.key === "UFN_ROUTE_CASH_SEL");
            const sales = multiDataAux.data.find((x) => x.key === "UFN_ROUTE_SALE_LST");
            const cash_info = multiDataAux.data.find((x) => x.key === "UFN_ROUTE_SALE_PAYMENTS_LST");
            const payments_detail = multiDataAux.data.find((x) => x.key === "UFN_ROUTE_SALE_PAYMENTS_DETAIL");
            const settlement_detail = multiDataAux.data.find((x) => x.key === "UFN_ROUTE_SETTLEMENTS_DETAIL");

            setDataAux({
                stock: stock?.data || [],
                cash: cash?.data || [],
                sales: sales?.data || [],
                cash_info: cash_info?.data || [],
                payments_detail: payments_detail?.data || [],
                settlement_detail: settlement_detail?.data || [],
            });
            setLoading(false);
        }
    }, [multiDataAux]);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(
                    showSnackbar({
                        show: true,
                        success: true,
                        message: t(row ? langKeys.successful_edit : langKeys.successful_register),
                    })
                );
                fetchData && fetchData();
                dispatch(showBackdrop(false));
                setViewSelected("view-1");
            } else if (executeResult.error) {
                const errormessage = t(executeResult.code || "error_unexpected_error", {
                    module: t(langKeys.corporation_plural).toLocaleLowerCase(),
                });
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }));
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeResult, waitSave]);

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(
                execute(
                    insRoute({
                        ...data,
                        operation: data.id ? "UPDATE" : "INSERT",
                        status: "ACTIVO",
                    })
                )
            );
            setWaitSave(true);
        };

        dispatch(
            manageConfirmation({
                visible: true,
                question: t(langKeys.confirmation_save),
                callback,
            })
        );
    });

    React.useEffect(() => {
        register("route", { validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required) });
        register("userid", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("warehouseid", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        if (!!row) {
            setLoading(true);
            dispatch(
                getMultiCollectionAux([
                    getRouteStockSel(row?.warehouseid),
                    getRouteCashSel(row?.routeid),
                    getRouteSalesLst(row?.routeid),
                    getRouteSalesPaymentsLst(row?.routeid),
                    getRouteSalesPaymentsDetail(row?.routeid),
                    getRouteSettlementsDetail(row?.routeid),
                ])
            );
        }
    }, [register]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleAvatarClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, url_evidence: string) => {
        event.stopPropagation();
        if (!url_evidence) return;
        setOpen(true);
        setSelectedImage(url_evidence);
    };

    const updateRow = (updatedRow: Dictionary) => {
        const updatedData = { ...dataAux };
        const index = updatedData.settlement_detail.findIndex(x => x.settlementdetailid === updatedRow.settlementdetailid)
        
        if (index !== -1) {
            updatedData.settlement_detail[index].status = updatedRow.new_status;
            setDataAux(updatedData);
        }
    };

    const handleRowClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, row: Dictionary) => {
        setIsModalOpen(true);
        setSelectedRow(row);
    };

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row?.full_name} - ${row?.warehouse}` : "Nueva ruta"} />
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <Button
                            variant="contained"
                            type="button"
                            color="primary"
                            startIcon={<ClearIcon color="secondary" />}
                            style={{ backgroundColor: "#FB5F5F" }}
                            onClick={() => setViewSelected("view-1")}
                        >
                            {t(langKeys.back)}
                        </Button>
                        {!row && (
                            <Button
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                type="submit"
                                startIcon={<SaveIcon color="secondary" />}
                                onClick={() => {
                                    console.log(errors);
                                }}
                                style={{ backgroundColor: "#55BD84" }}
                            >
                                {t(langKeys.save)}
                            </Button>
                        )}
                        {!!row && (
                            <Button
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                type="submit"
                                startIcon={<SaveIcon color="secondary" />}
                                style={{ backgroundColor: "#55BD84" }}
                            >
                                Cerrar ruta
                            </Button>
                        )}
                    </div>
                </div>

                {!!row && (
                    <>
                        <AppBar position="static" elevation={0}>
                            <Tabs
                                value={tabIndex}
                                className={classes.tabs}
                                onChange={(_, i: string) => setTabIndex(i)}
                                indicatorColor="primary"
                            >
                                <Tab className={classes.tab} label={"Información General"} value="0" />
                                <Tab className={classes.tab} label={"Información de Caja"} value="1" />
                                <Tab className={classes.tab} label={"Gastos"} value="2" />
                                <Tab className={classes.tab} label={"Liquidacion"} value="3" />
                            </Tabs>
                        </AppBar>
                        <TabPanel value="0" index={tabIndex}>
                            <div>
                                <div className={classes.containerDetail}>
                                    <div className="row-zyx">
                                        <FieldSelect
                                            loading={multiData.loading}
                                            label={"Unidad"}
                                            className="col-6"
                                            valueDefault={getValues("warehouseid")}
                                            data={dataExtra.vehicle}
                                            disabled={true}
                                            optionDesc="plate_number"
                                            optionValue="warehouseid"
                                        />
                                        <FieldSelect
                                            loading={multiData.loading}
                                            label={`Rutas`}
                                            className="col-6"
                                            valueDefault={getValues("route")}
                                            data={dataExtra.routes}
                                            optionDesc="domaindesc"
                                            disabled={true}
                                            optionValue="domainvalue"
                                        />
                                    </div>
                                    <div className="row-zyx">
                                        <FieldSelect
                                            loading={multiData.loading}
                                            label={t(langKeys.driver)}
                                            className="col-6"
                                            valueDefault={getValues("userid")}
                                            data={dataExtra.driver}
                                            disabled={true}
                                            optionDesc="full_name"
                                            optionValue="userid"
                                        />
                                        <FieldSelect
                                            loading={multiData.loading}
                                            label={t(langKeys.helpers)}
                                            className="col-6"
                                            //valueDefault={getValues('customerid')}
                                            data={[]}
                                            optionDesc="description"
                                            disabled={true}
                                            optionValue="customerid"
                                        />
                                    </div>
                                </div>
                                {loading && (
                                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                                        <CircularProgress />
                                    </div>
                                )}
                                {!loading && (
                                    <>
                                        <div className={classes.containerDetail} style={{ marginTop: "8px" }}>
                                            <div className={classes.title}>Inventario - GLP</div>
                                            <div style={{ padding: "15px 0" }}>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>PRODUCTO</TableCell>
                                                                <TableCell>LLENOS</TableCell>
                                                                <TableCell>VACIOS</TableCell>
                                                                <TableCell>TOTAL</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody style={{ marginTop: 5 }}>
                                                            {dataAux.stock.map((x) => (
                                                                <TableRow key={x.productid}>
                                                                    <TableCell>{x.product_name}</TableCell>
                                                                    <TableCell>{x.carga}</TableCell>
                                                                    <TableCell>{x.envase - x.carga}</TableCell>
                                                                    <TableCell>{x.envase}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </div>
                                        </div>
                                        <div className={classes.containerDetail} style={{ marginTop: "8px" }}>
                                            <div className={classes.title} style={{ padding: "10px 0" }}>
                                                {"Productos Vendidos"}
                                            </div>
                                            <div style={{ padding: "15px 0" }}>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>PRODUCTO</TableCell>
                                                                <TableCell style={{ textAlign: "center" }}>
                                                                    CANTIDAD
                                                                </TableCell>
                                                                <TableCell style={{ textAlign: "center" }}>
                                                                    SUBTOTAL
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {dataAux.sales.map((x) => (
                                                                <TableRow key={x.producto}>
                                                                    <TableCell>{x.producto}</TableCell>
                                                                    <TableCell style={{ textAlign: "center" }}>
                                                                        {x.cantidad}
                                                                    </TableCell>
                                                                    <TableCell style={{ textAlign: "right" }}>
                                                                        S/ {formatMoney(x.total)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                            <TableRow>
                                                                <TableCell rowSpan={2} style={{ border: 0 }} />
                                                                <TableCell
                                                                    style={{
                                                                        textAlign: "right",
                                                                        paddingTop: "20px",
                                                                        border: 0,
                                                                    }}
                                                                    colSpan={1}
                                                                >
                                                                    <b>TOTAL</b>
                                                                </TableCell>
                                                                <TableCell
                                                                    style={{
                                                                        textAlign: "right",
                                                                        paddingTop: "20px",
                                                                        border: 0,
                                                                    }}
                                                                >
                                                                    <strong>
                                                                        S/{" "}
                                                                        {formatMoney(
                                                                            dataAux.sales.reduce(
                                                                                (acc, curr) =>
                                                                                    acc + parseFloat(curr.total),
                                                                                0
                                                                            )
                                                                        )}
                                                                    </strong>
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </div>
                                        </div>
                                        <div className={classes.containerDetail} style={{ marginTop: "8px" }}>
                                            <div className={classes.title} style={{ padding: "10px 0" }}>
                                                {"Información de Caja"}
                                            </div>
                                            <div
                                                style={{
                                                    width: "100%",
                                                    justifyContent: "space-between",
                                                    display: "flex",
                                                    marginTop: "10px",
                                                }}
                                            >
                                                <div>
                                                    <b>Ingresos (Total):</b>
                                                </div>
                                                <div>S/ {dataAux.cash[0]?.amount || 0}</div>
                                                <div>
                                                    <b>Gastos:</b>
                                                </div>
                                                <div>S/ 300,50</div>
                                                <div>
                                                    <b>Total Efe. por liquidar:</b>
                                                </div>
                                                <div>S/ {dataAux.cash[0]?.settled_amount || 0}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabPanel>
                        <TabPanel value="1" index={tabIndex}>
                            <>
                                <div className={classes.containerDetail}>
                                    <div className={classes.title}>Información de Caja</div>
                                    <div style={{ padding: "15px 0" }}>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell className={classes.taCenter}>
                                                            METODO DE PAGO
                                                        </TableCell>
                                                        <TableCell className={classes.taCenter}>CAJA</TableCell>
                                                        <TableCell className={classes.taCenter}>MONTO</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody style={{ marginTop: 5 }}>
                                                    {dataAux.cash_info.map((x) => (
                                                        <TableRow key={x.paymentmethodid}>
                                                            <TableCell className={classes.taCenter}>
                                                                {x.payment}
                                                            </TableCell>
                                                            <TableCell className={classes.taCenter}>
                                                                {x.account}
                                                            </TableCell>
                                                            <TableCell className={classes.taRight}>
                                                                S/ {formatMoney(x.total)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow>
                                                        <TableCell rowSpan={1} style={{ border: 0 }} />
                                                        <TableCell
                                                            style={{
                                                                textAlign: "right",
                                                                paddingTop: "20px",
                                                                border: 0,
                                                            }}
                                                            colSpan={1}
                                                        >
                                                            <b>TOTAL</b>
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                textAlign: "right",
                                                                paddingTop: "20px",
                                                                border: 0,
                                                            }}
                                                        >
                                                            <strong>
                                                                S/{" "}
                                                                {formatMoney(
                                                                    dataAux.cash_info.reduce(
                                                                        (ac, cur) => ac + parseFloat(cur.total),
                                                                        0
                                                                    )
                                                                )}
                                                            </strong>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>
                                </div>
                                <div className={classes.containerDetail} style={{ marginTop: "8px", overflow: "auto" }}>
                                    <div className={classes.title}>Detalle de Pagos</div>
                                    <div style={{ padding: "15px 0" }}>
                                        <TableContainer style={{ minWidth: 450 }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell className={classes.taCenter}>CLIENTES</TableCell>
                                                        <TableCell className={classes.taCenter}>
                                                            FORMA DE PAGO
                                                        </TableCell>
                                                        <TableCell className={classes.taCenter}>MONTO</TableCell>
                                                        <TableCell className={classes.taCenter}>FOTO</TableCell>
                                                        <TableCell className={classes.taCenter}>CONFIRMADO</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody style={{ marginTop: 5 }}>
                                                    {dataAux.payments_detail
                                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                        .map((row) => (
                                                            <TableRow key={row.saleorderpaymentid}>
                                                                <TableCell>{setTitleCase(row.client_name)}</TableCell>
                                                                <TableCell className={classes.taCenter}>
                                                                    {row.payment}
                                                                </TableCell>
                                                                <TableCell className={classes.taRight}>
                                                                    S/ {formatMoney(row.amount)}
                                                                </TableCell>
                                                                <TableCell className={classes.taCenter}>
                                                                    <div
                                                                        style={{
                                                                            display: "flex",
                                                                            justifyContent: "center",
                                                                            cursor: "pointer",
                                                                        }}
                                                                        onClick={(event) => {
                                                                            handleAvatarClick(event, row.evidence_url);
                                                                        }}
                                                                    >
                                                                        <Avatar
                                                                            src={row.evidence_url}
                                                                            style={{ width: "25px", height: "25px" }}
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {!row.confirmed && (
                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                justifyContent: "center",
                                                                                alignItems: "center",
                                                                                gap: "8px",
                                                                            }}
                                                                        >
                                                                            <CheckCircle style={{ color: "#45DB63" }} />
                                                                            {"Confirmado"}
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <TablePagination
                                            rowsPerPageOptions={[10, 25, 100]}
                                            component="div"
                                            count={dataAux.payments_detail.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                        />
                                        <Modal
                                            open={open}
                                            onClose={() => setOpen(false)}
                                            className={classes.customModal}
                                        >
                                            <img src={selectedImage} alt="Imagen" style={{ maxWidth: 800 }} />
                                        </Modal>
                                    </div>
                                </div>
                            </>
                        </TabPanel>
                        <TabPanel value="2" index={tabIndex}>
                            <div className={classes.containerDetail}>
                                <Button
                                    className={classes.button}
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    startIcon={<AddIcon color="secondary" />}
                                    style={{ backgroundColor: "primary" }}
                                >
                                    Registrar Gasto
                                </Button>
                                <div style={{ padding: "15px 20%" }}>
                                    <TableContainer style={{ minWidth: 450 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Detalle</TableCell>
                                                    <TableCell>Monto</TableCell>
                                                    <TableCell>Creado por</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody style={{ marginTop: 5 }}>
                                                <TableRow>
                                                    <TableCell>Combustible</TableCell>
                                                    <TableCell>S/ 203,00</TableCell>
                                                    <TableCell>admin</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Adelanto</TableCell>
                                                    <TableCell>S/ 500,00</TableCell>
                                                    <TableCell>nsuarez</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel value="3" index={tabIndex}>
                            <>
                                <div className={classes.containerDetail}>
                                    <div className={classes.title}>Liquidacion</div>
                                    <div style={{ padding: "15px 0" }}>
                                        <TableContainer style={{ minWidth: 450 }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell className={classes.taCenter}>PROCEDENCIA</TableCell>
                                                        <TableCell className={classes.taCenter}>
                                                            FORMA DE PAGO
                                                        </TableCell>
                                                        <TableCell className={classes.taCenter}>DESTINO</TableCell>
                                                        <TableCell className={classes.taCenter}>MONTO</TableCell>
                                                        <TableCell className={classes.taCenter}>FOTO</TableCell>
                                                        <TableCell className={classes.taCenter}>CONFIRMADO</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody style={{ marginTop: 5 }}>
                                                    {dataAux.settlement_detail
                                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                        .map((row) => (
                                                            <TableRow
                                                                key={row.settlementdetailid}
                                                                onClick={(event) => handleRowClick(event, row)} // Agregar evento onClick
                                                            >
                                                                <TableCell>{setTitleCase(row.origin)}</TableCell>
                                                                <TableCell className={classes.taCenter}>
                                                                    {row.payment_method}
                                                                </TableCell>
                                                                <TableCell className={classes.taCenter}>
                                                                    {row.cash_box ? row.cash_box : row.account}
                                                                </TableCell>
                                                                <TableCell className={classes.taRight}>
                                                                    S/ {formatMoney(row.amount)}
                                                                </TableCell>
                                                                <TableCell className={classes.taCenter}>
                                                                    <div
                                                                        style={{
                                                                            display: "flex",
                                                                            justifyContent: "center",
                                                                            cursor: "pointer",
                                                                        }}
                                                                        onClick={(event) => {
                                                                            handleAvatarClick(event, row.evidence_url);
                                                                        }}
                                                                    >
                                                                        <Avatar
                                                                            src={row.evidence_url}
                                                                            style={{ width: "25px", height: "25px" }}
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div
                                                                        style={{
                                                                            display: "flex",
                                                                            justifyContent: "center",
                                                                            alignItems: "center",
                                                                            gap: "8px",
                                                                        }}
                                                                    >
                                                                        <CheckCircle
                                                                            style={{
                                                                                color: "#45DB63",
                                                                                display:
                                                                                    row.status === "CONFIRMADO"
                                                                                        ? "block"
                                                                                        : "none",
                                                                            }}
                                                                        />
                                                                        <Error
                                                                            style={{
                                                                                color: "#ff6c6c",
                                                                                display:
                                                                                    row.status === "RECHAZADO"
                                                                                        ? "block"
                                                                                        : "none",
                                                                            }}
                                                                        />
                                                                        {row.status === 'ACTIVO' ? 'PENDIENTE' : row.status}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        <SettlementDetailModal
                                            openModal={isModalOpen}
                                            setOpenModal={setIsModalOpen}
                                            row={selectedRow}
                                            updateRow={updateRow}
                                        />
                                    </div>
                                </div>
                            </>
                        </TabPanel>
                    </>
                )}
                {!row && (
                    <div className={classes.containerDetail}>
                        <div className={classes.containerDetail}>
                            <div className="row-zyx">
                                <FieldSelect
                                    loading={multiData.loading}
                                    label={"Unidad"}
                                    className="col-6"
                                    valueDefault={getValues("warehouseid")}
                                    onChange={(value) => setValue("warehouseid", value?.warehouseid || 0)}
                                    error={errors?.warehouseid?.message}
                                    data={dataExtra.vehicle}
                                    optionDesc="plate_number"
                                    optionValue="warehouseid"
                                />
                                <FieldSelect
                                    loading={multiData.loading}
                                    label={`Rutas`}
                                    className="col-6"
                                    valueDefault={getValues("route")}
                                    onChange={(value) => setValue("route", value ? value.domainvalue : "")}
                                    error={errors?.route?.message}
                                    data={dataExtra.routes}
                                    optionDesc="domaindesc"
                                    optionValue="domainvalue"
                                />
                            </div>
                            <div className="row-zyx">
                                <FieldSelect
                                    loading={multiData.loading}
                                    label={t(langKeys.driver)}
                                    className="col-6"
                                    valueDefault={getValues("userid")}
                                    onChange={(value) => setValue("userid", value?.userid || 0)}
                                    error={errors?.userid?.message}
                                    data={dataExtra.driver}
                                    optionDesc="full_name"
                                    optionValue="userid"
                                />
                                <FieldMultiSelect
                                    loading={multiData.loading}
                                    label={"AYUDANTES"}
                                    className="col-6"
                                    // variant="outlined"
                                    onChange={(value) =>
                                        setValue(`assistants`, (value?.map((o: Dictionary) => o.userid) || []).join())
                                    }
                                    data={dataExtra.assistans}
                                    optionDesc="full_name"
                                    optionValue="userid"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default DetailPurcharse;
