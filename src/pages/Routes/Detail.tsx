/* eslint-disable react-hooks/exhaustive-deps */
import { DetailModule, Dictionary } from "@types";
import {
    FieldEdit,
    FieldEditArray,
    FieldEditMulti,
    FieldMultiSelect,
    FieldSelect,
    TemplateBreadcrumbs,
    TitleDetail,
} from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute, getCollectionAux, resetMainAux } from "store/main/actions";
import { getDetailSale, insOrderSale, insSaleDetail, paymentIns, getPaymentByOrder, insRoute } from "common/helpers";
import {
    Button,
    makeStyles,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableFooter,
    AppBar,
    Tab,
    Box,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import Tabs from "@material-ui/core/Tabs";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import { ExpandMore } from "@material-ui/icons";
import TableZyx from "components/fields/table-simple";

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

const useStyles = makeStyles((theme) => ({
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
}));

type FormFields = {
    id: number;
    userid: number;
    warehouseid: number;
    assistants: string;
    route: string;
};

const DetailPurcharse: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    console.log('row',row)
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [tabIndex, setTabIndex] = useState("0");
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
    const dispatch = useDispatch();
    const { t } = useTranslation();

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
            assistants: '',
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
    }, [register]);

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `Ver Ruta - ${row?.unit}` : "Nueva ruta"} />
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
                                <Tab className={classes.tab} label={"Ventas"} value="1" />
                                <Tab className={classes.tab} label={"Gastos"} value="2" />
                            </Tabs>
                        </AppBar>
                        <TabPanel value="0" index={tabIndex}>
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
                                <div className={classes.title}>Inventario - GLP</div>
                                <div style={{ padding: "15px 0" }}>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Producto</TableCell>
                                                    <TableCell>Vacio</TableCell>
                                                    <TableCell>Llenos</TableCell>
                                                    <TableCell>Total</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody style={{ marginTop: 5 }}>
                                                <TableRow>
                                                    <TableCell>Carga 10KG</TableCell>
                                                    <TableCell>4</TableCell>
                                                    <TableCell>100</TableCell>
                                                    <TableCell>104</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Carga 40KG</TableCell>
                                                    <TableCell>4</TableCell>
                                                    <TableCell>40</TableCell>
                                                    <TableCell>40</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                                <div className={classes.title} style={{ padding: "10px 0" }}>
                                    {"Información de Caja"}
                                </div>
                                <div style={{ width: "100%", justifyContent: "space-between", display: "flex" }}>
                                    <div>Ingresos (Total):</div>
                                    <div>S/ 20.340,50</div>
                                    <div>Gastos:</div>
                                    <div>S/ 300,50</div>
                                    <div>Total Efe. por liquidar:</div>
                                    <div>S/ 20.340,50</div>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel value="1" index={tabIndex}>
                            <div className={classes.containerDetail}>
                                <div style={{ padding: "15px 20%" }}>
                                    <TableContainer style={{ minWidth: 450 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Producto</TableCell>
                                                    <TableCell>Cantidad</TableCell>
                                                    <TableCell>Subtotal</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody style={{ marginTop: 5 }}>
                                                <TableRow>
                                                    <TableCell>Carga 10KG</TableCell>
                                                    <TableCell>4</TableCell>
                                                    <TableCell>100</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Carga 40KG</TableCell>
                                                    <TableCell>0</TableCell>
                                                    <TableCell>40</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                                <div style={{ fontSize: "1.5em", fontWeight: "bold", textAlign: "end" }}>
                                    Total: S/ 20.430,50
                                </div>
                                <div className={classes.title} style={{ padding: "10px 0" }}>
                                    {"Información de Caja"}
                                </div>
                                <div style={{ padding: "15px 20%" }}>
                                    <TableContainer style={{ minWidth: 450 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Método de Pago</TableCell>
                                                    <TableCell>Cantidad</TableCell>
                                                    <TableCell>Total</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody style={{ marginTop: 5 }}>
                                                <TableRow>
                                                    <TableCell>Yape</TableCell>
                                                    <TableCell>4</TableCell>
                                                    <TableCell>S/ 100</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Yape</TableCell>
                                                    <TableCell>4</TableCell>
                                                    <TableCell>S/ 100</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Transferencia</TableCell>
                                                    <TableCell>0</TableCell>
                                                    <TableCell>S/ 40</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Efectivo</TableCell>
                                                    <TableCell>10</TableCell>
                                                    <TableCell>S/ 2.230,20</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Vale FISE</TableCell>
                                                    <TableCell>5</TableCell>
                                                    <TableCell>S/ 450,20</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                            </div>
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
                                    onChange={(value) => setValue(`assistants`, (value?.map((o: Dictionary) => o.userid) || []).join())}
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
