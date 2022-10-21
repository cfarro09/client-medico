/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import {
    getDateCleaned,
    getProductList,
    getPurchases,
    getSupplierList,
    getValuesFromDomain,
    getWareHouse,
    insPurchase,
} from "common/helpers";
import { DateRangePicker, TemplateIcons } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { execute, getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import Detail from "./Detail";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";
import { Button, makeStyles, Typography } from "@material-ui/core";
import { Range } from "react-date-range";
import { CalendarIcon } from "icons";

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
}));

const initialRange = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    key: "selection",
};

const Purchase: FC = () => {
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
    const [merchantEntry, setMerchantEntry] = useState(false);
    const [openDateRangeModal, setOpenDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialRange);

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                view: applications["/purchases"][0],
                modify: applications["/purchases"][1],
                insert: applications["/purchases"][2],
                delete: applications["/purchases"][3],
                download: applications["/purchases"][4],
            });
        }
    }, [applications]);

    const fetchData = () => dispatch(getCollection(getPurchases({ startdate: dateRange.startDate, finishdate: dateRange.endDate })));

    useEffect(() => {
        // fetchData();
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
                getProductList(),
                getSupplierList(),
                getWareHouse(),
            ])
        );
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!openDateRangeModal) fetchData();
    }, [openDateRangeModal]);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UNF_PURCHASE_ORDER_SEL") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

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

    const columns = React.useMemo(
        () => [
            {
                accessor: "purchaseorderid",
                isComponent: true,
                minWidth: 60,
                width: "1%",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    if (row.status === "ENTREGADO") {
                        return null;
                    }
                    return (
                        <TemplateIcons
                            deleteFunction={() => handleDelete(row)}
                            extraOption={"Entrada de mercaderia"}
                            ExtraICon={() => <SystemUpdateAltIcon width={18} style={{ fill: "#7721AD" }} />}
                            extraFunction={() => {
                                setMerchantEntry(true);
                                setViewSelected("view-2");
                                setRowSelected(row);
                            }}
                        />
                    );
                },
            },
            {
                Header: "N° Orden",
                accessor: "purchase_order_number",
            },
            {
                Header: "Estado",
                accessor: "status",
            },
            {
                Header: "Proveedor",
                accessor: "supplier_name",
            },
            {
                Header: "Almacen",
                accessor: "warehouse_name",
            },
            {
                Header: "Productos",
                accessor: "num_records",
                type: "number",
            },
            {
                Header: "Total",
                type: "number",
                accessor: "total",
                Cell: (props: any) => {
                    const { total } = props.cell.row.original;
                    return parseFloat(total).toFixed(2);
                },
            },
        ],
        []
    );

    const handleRegister = () => {
        setMerchantEntry(false);
        setViewSelected("view-2");
        setRowSelected(null);
    };

    const handleEdit = (row: Dictionary) => {
        setMerchantEntry(false);
        setViewSelected("view-2");
        setRowSelected(row);
    };

    const handleDelete = (row: Dictionary) => {
        const callback = () => {
            dispatch(
                execute(
                    insPurchase({ ...row, operation: "DELETE", status: "ELIMINADO", purchaseid: row.purchaseorderid })
                )
            );
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
                {/* <div style={{ height: 10 }}></div>
                <div>
                    <Typography variant="h5" component="div">
                    Ordenes de compra
                    </Typography>
                </div>
                <br /> */}
                <TableZyx
                    columns={columns}
                    data={dataView}
                    titlemodule={"Ordenes de compra"}
                    download={!!pagePermissions.download}
                    onClickRow={handleEdit}
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
                        </div>
                    )}
                />
            </div>
        );
    } else {
        return (
            <Detail
                row={rowSelected}
                setViewSelected={setViewSelected}
                fetchData={fetchData}
                merchantEntry={merchantEntry}
            />
        );
    }
};

export default Purchase;
