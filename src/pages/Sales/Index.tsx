/* eslint-disable react-hooks/exhaustive-deps */
import { Button, makeStyles } from "@material-ui/core";
import { Dictionary } from "@types";
import {
    getCustomerList,
    getDateCleaned,
    getProductsWithStock,
    getSales,
    getValuesFromDomain,
    getWareHouse,
    insPurchase,
} from "common/helpers";
import { DateRangePicker, TemplateIcons } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { CalendarIcon } from "icons";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { Range } from "react-date-range";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { execute, exportReportPDF, getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import Detail from "./Detail";
import ReceiptIcon from '@material-ui/icons/Receipt';

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

const Sales: FC = () => {
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
    const executeResult = useSelector((state) => state.main.exportReportPDF);
    const [openDateRangeModal, setOpenDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialRange);

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                view: applications["/sales"][0],
                modify: applications["/sales"][1],
                insert: applications["/sales"][2],
                delete: applications["/sales"][3],
                download: applications["/sales"][4],
            });
        }
    }, [applications]);

    const fetchData = () =>
        dispatch(getCollection(getSales({ startdate: dateRange.startDate, finishdate: dateRange.endDate })));

    useEffect(() => {
        // fetchData();
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
                getProductsWithStock(),
                getCustomerList(),
                getWareHouse(),
                getValuesFromDomain("TIPOCOMPROBANTE", "DOMAIN-TIPOCOMPROBANTE"),
                getValuesFromDomain("METODOPAGO", "DOMAIN-METODOPAGO"),
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
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_SALE_ORDER_SEL") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                setWaitSave(false);
                window.open(executeResult.url, '_blank')
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
                accessor: "saleorderid",
                isComponent: true,
                minWidth: 60,
                width: "1%",
                Cell: (props: any) => {
                    const row = props.cell.row.original;

                    return <TemplateIcons
                        // deleteFunction={() => handleDelete(row)}
                        extraOption={"Descargar comprobante"}
                        ExtraICon={() => <ReceiptIcon width={18} style={{ fill: "#7721AD" }} />}
                        extraFunction={() => {
                            dispatch(exportReportPDF({
                                "method": "UFN_SALEORDER_INVOICE_SEL",
                                "parameters": {
                                    "saleorderid": row.saleorderid
                                },
                                "dataonparameters": false,
                                "template": "sale_order_invoice.html",
                                "reportname": "sale_order_invoice",
                                "key": "sale_order_invoice"
                            }))
                            setWaitSave(true)
                        }}
                    />;
                },
            },
            {
                Header: "N° Orden",
                accessor: "bill_number",
            },
            {
                Header: "Estado",
                accessor: "status",
            },
            {
                Header: "Cliente",
                accessor: "client_name",
            },
            {
                Header: "Almacen",
                accessor: "warehouse_name",
            },
            {
                Header: "Tipo comprobante",
                accessor: "document_type",
            },
            {
                Header: "N documento",
                accessor: "document_number",
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
        setViewSelected("view-2");
        setRowSelected(null);
    };

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected(row);
    };

    if (viewSelected === "view-1") {
        return (
            <div className={classes.container}>
                <TableZyx
                    columns={columns}
                    data={dataView}
                    titlemodule={"Ventas"}
                    download={!!pagePermissions.download}
                    onClickRow={handleEdit}
                    loading={mainResult.loading}
                    register={!!pagePermissions.insert}
                    filterGeneral={false}
                    handleRegister={handleRegister}
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
        return <Detail row={rowSelected} setViewSelected={setViewSelected} fetchData={fetchData} />;
    }
};

export default Sales;
