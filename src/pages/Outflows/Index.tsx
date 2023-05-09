/*
 ** Change getStockFlow to the actual sel of your main data
 ** Change MainDataFill or delete it in case no use
 ** Change MultiData or delete it in case no use
 ** Change corpid from your dataset
 ** Change ViewColumns or delete it in case no use
 ** Change insCorp for your ins function
 */
/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import {
    getStockFlow,
    getDateCleaned,
    getValuesFromDomain,
    insCorp,
    getWareHouse,
    getCustomerList,
} from "common/helpers";
import { DateRangePicker, FieldSelect, TemplateIcons } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { execute, getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import Detail from "./Detail";
import { Range } from "react-date-range";
import { Button, makeStyles } from "@material-ui/core";
import { CalendarIcon, SearchIcon } from "icons";

const useStyles = makeStyles((theme) => ({
    container: {
        width: "100%",
    },
    containerDetail: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        background: "#fff",
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: "14px",
        textTransform: "initial",
    },
    containerHeader: {
        marginBottom: 0,
        display: "flex",
        width: "100%",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        [theme.breakpoints.up("sm")]: {
            display: "flex",
        },
        "& > div": {
            display: "flex",
            gap: 8,
        },
    },
    itemDate: {
        minHeight: 40,
        height: 40,
        border: "1px solid #bfbfc0",
        borderRadius: 4,
        color: "rgb(143, 146, 161)",
    },
    title: {
        fontSize: "22px",
        fontWeight: "bold",
        color: theme.palette.text.primary,
        padding: "10px 0 ",
    },
    filterComponent: {
        minWidth: "220px",
        maxWidth: "320px",
    },
}));

const initialRange = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    key: "selection",
};

const Outflows: FC = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector((state) => state.main.mainData);
    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<Dictionary | null>(null);
    const [waitSave, setWaitSave] = useState(false);
    const [dataView, setDataView] = useState<Dictionary[]>([]);
    const applications = useSelector((state) => state.login?.validateToken?.user?.menu);
    const [pagePermissions, setPagePermissions] = useState<Dictionary>({});
    const executeResult = useSelector((state) => state.main.execute);
    const [openDateRangeModal, setOpenDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialRange);
    const multiData = useSelector((state) => state.main.multiData);
    const [filters, setFilters] = useState({
        customerid: 0,
        warehouseid: 0,
    });
    const [dataExtra, setDataExtra] = useState<{
        warehouses: Dictionary[];
        customers: Dictionary[];
    }>({ warehouses: [], customers: [] });

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                view: applications["/outflows"][0],
                modify: applications["/outflows"][1],
                insert: applications["/outflows"][2],
                delete: applications["/outflows"][3],
                download: applications["/outflows"][4],
            });
        }
    }, [applications]);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_delete) }));
                fetchData();
                dispatch(showBackdrop(false));
                setWaitSave(false);
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

    const fetchData = () =>
        dispatch(
            getCollection(
                getStockFlow({
                    startdate: dateRange.startDate,
                    finishdate: dateRange.endDate,
                    customerid: filters.customerid,
                    warehouseid: filters.warehouseid,
                    type: "in",
                })
            )
        );

    // MainDataFill
    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_STOCK_FLOW") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

    useEffect(() => {
        if (!multiData.loading && !multiData.error) {
            const warehouses = multiData.data.find((x) => x.key === "UFN_WAREHOUSE_LST");
            const customers = multiData.data.find((x) => x.key === "UFN_CUSTOMER_LST");

            if (warehouses && customers) {
                setDataExtra({
                    warehouses: warehouses.data,
                    customers: customers.data,
                });
            }
        }
    }, [multiData]);

    // MultiData
    useEffect(() => {
        fetchData();
        dispatch(getMultiCollection([getWareHouse(0, "", true), getCustomerList()]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    // ViewColumns
    const columns = React.useMemo(
        () => [
            // {
            //     accessor: "kardexid",
            //     isComponent: true,
            //     minWidth: 60,
            //     width: "1%",
            //     Cell: (props: any) => {
            //         const row = props.cell.row.original;
            //         return <TemplateIcons deleteFunction={() => handleDelete(row)} />;
            //     },
            // },
            {
                Header: "FECHA",
                accessor: "createdate",
                NoFilter: true,
            },
            {
                Header: "HORA",
                accessor: "rowhour",
                NoFilter: true,
            },
            {
                Header: "ATENDIDO POR",
                accessor: "user_name",
                NoFilter: true,
            },
            {
                Header: "ALMACEN",
                accessor: "warehouse",
                NoFilter: true,
            },
            {
                Header: "CONDICION",
                accessor: "doc_type",
                NoFilter: true,
            },
            {
                Header: "CLIENTE - REFERENCIA",
                accessor: "client_name",
                NoFilter: true,
            },
            {
                Header: "CANTIDAD",
                accessor: "quantity",
                NoFilter: true,
            },
            {
                Header: "PRODUCTO",
                accessor: "product_description",
                NoFilter: true,
            },
            {
                Header: "PRECIO UNI.",
                accessor: "price",
                NoFilter: true,
                Cell: (props: any) => {
                    const { price } = props.cell.row.original;
                    return "S/ " + parseFloat(price).toFixed(2);
                },
            },
            {
                Header: "TOTAL",
                accessor: "total",
                NoFilter: true,
                Cell: (props: any) => {
                    const { total } = props.cell.row.original;
                    return "S/ " + parseFloat(total).toFixed(2);
                },
            },
            {
                Header: "ESTADO",
                accessor: "status",
                NoFilter: true,
            },
        ],
        []
    );

    // HandlesFunctions
    const handleRegister = () => {
        setViewSelected("view-2");
        setRowSelected(null);
    };

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected(row);
    };

    const handleDelete = (row: Dictionary) => {
        const callback = () => {
            dispatch(execute(insCorp({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.corpid })));
            dispatch(showBackdrop(true));
            setWaitSave(true);
        };

        dispatch(
            manageConfirmation({
                visible: true,
                question: t(langKeys.confirmation_delete),
                callback,
            })
        );
    };

    if (viewSelected === "view-1") {
        return (
            <div className={classes.container}>
                <div className={classes.title}>{"Salidas"}</div>
                <TableZyx
                    columns={columns}
                    data={dataView}
                    titlemodule={``}
                    download={!!pagePermissions.download}
                    // onClickRow={handleEdit}
                    loading={mainResult.loading}
                    register={!!pagePermissions.insert}
                    handleRegister={handleRegister}
                    filterGeneral={false}
                    ButtonsElement={() => (
                        <div className={classes.containerHeader}>
                            <DateRangePicker
                                open={openDateRangeModal}
                                setOpen={setOpenDateRangeModal}
                                range={dateRange}
                                onSelect={setDateRange}
                            >
                                <Button
                                    className={classes.itemDate}
                                    startIcon={<CalendarIcon />}
                                    onClick={() => setOpenDateRangeModal(!openDateRangeModal)}
                                >
                                    {getDateCleaned(dateRange.startDate!) + " - " + getDateCleaned(dateRange.endDate!)}
                                </Button>
                            </DateRangePicker>
                            <FieldSelect
                                label={"Almacen"}
                                className={classes.filterComponent}
                                valueDefault={filters.warehouseid}
                                onChange={(value) => setFilters({ ...filters, warehouseid: value?.warehouseid || 0 })}
                                uset={true}
                                variant="outlined"
                                loading={multiData.loading}
                                data={dataExtra.warehouses}
                                optionDesc="description"
                                optionValue="warehouseid"
                            />
                            <FieldSelect
                                label={"Clientes"}
                                className={classes.filterComponent}
                                valueDefault={filters.customerid}
                                onChange={(value) => setFilters({ ...filters, customerid: value?.customerid || 0 })}
                                uset={true}
                                variant="outlined"
                                loading={multiData.loading}
                                data={dataExtra.customers}
                                optionDesc="description"
                                optionValue="customerid"
                            />
                            <Button
                                disabled={mainResult.loading}
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon style={{ color: "white" }} />}
                                style={{ width: 120, backgroundColor: "#55BD84" }}
                                onClick={() => fetchData()}
                            >
                                {t(langKeys.search)}
                            </Button>
                        </div>
                    )}
                />
            </div>
        );
    } else {
        return <Detail row={rowSelected} setViewSelected={setViewSelected} fetchData={fetchData} />;
    }
};
export default Outflows;
