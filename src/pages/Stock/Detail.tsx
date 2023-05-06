/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Chip, makeStyles, Paper, Typography } from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { DateRangePicker, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { showBackdrop, showSnackbar } from "store/popus/actions";
import { getCollectionAux } from "store/main/actions";
import { getDateCleaned, getKardexSel } from "common/helpers";
import TableZyx from "components/fields/table-simple";
import { Range } from "react-date-range";
import { CalendarIcon } from "icons";
import ClearIcon from "@material-ui/icons/Clear";

const arrayBread = [
    { id: "view-1", name: "Stock" },
    { id: "view-2", name: "Kardex" },
];

const useStyles = makeStyles((theme) => ({
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
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    key: "selection",
};

const DetailStock: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const detailRes = useSelector((state) => state.main.mainAux);
    const [openDateRangeModal, setOpenDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialRange);
    const [dataDetail, setDataDetail] = useState<Dictionary[]>([]);
    const [dataDetailToShow, setDataDetailToShow] = useState<Dictionary[]>([]);
    const [dataExtra, setDataExtra] = useState<{ status: Dictionary[]; type: Dictionary[] }>({ status: [], type: [] });
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataTypes = multiData.data.find((x) => x.key === "DOMAIN-TIPOCORP");
            if (dataStatus && dataTypes) {
                setDataExtra({
                    status: dataStatus.data,
                    type: dataTypes.data,
                });
            }
        }
    }, [multiData]);

    const search = () => {
        dispatch(
            getCollectionAux(
                getKardexSel({
                    stockid: row?.stockid,
                    startdate: dateRange.startDate,
                    finishdate: dateRange.endDate,
                })
            )
        );
    };

    useEffect(() => {
        if (!detailRes.loading && !detailRes.error) {
            setDataDetail(detailRes.data);
            setDataDetailToShow(detailRes.data);
        }
    }, [detailRes]);

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

    useEffect(() => {
        if (!openDateRangeModal) search();
    }, [openDateRangeModal]);

    const columns = React.useMemo(
        () => [
            {
                Header: "FECHA",
                accessor: "createdate",
                NoFilter: true,
            },
            {
                Header: "ALMACEN",
                accessor: "warehouse",
                NoFilter: true,
            },
            {
                Header: "CHOFER",
                accessor: "user_name",
                NoFilter: true,
            },
            {
                Header: "PRODUCTO",
                accessor: "product_description",
                NoFilter: true,
            },
            {
                Header: "STOCK INICIAL",
                accessor: "initial_stock",
                NoFilter: true,
            },
            {
                Header: "INGRESOS",
                accessor: "ingresos",
                NoFilter: true,
                Cell: (props: any) => {
                    const data = props.cell.row.original;
                    return (data?.in_out === 'in') ? data?.quantity : 0;
                },
            },
            {
                Header: "SALIDAS",
                accessor: "salidas",
                NoFilter: true,
                Cell: (props: any) => {
                    const data = props.cell.row.original;
                    return (data?.in_out === 'out') ? data?.quantity : 0;
                },
            },
            {
                Header: "STOCK FINAL",
                accessor: "final_stock",
                NoFilter: true,
            },
        ],
        []
    );

    return (
        <div style={{ width: "100%" }}>
            <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                <TitleDetail title={row ? `${row.warehouse_description} - ${row.product_description}` : ""} />
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
                </div>
            </div>
            <div className={classes.containerDetail}>
                <Paper elevation={0}>
                    <div className="row-zyx" style={{ justifyContent: "space-between" }}>
                        <div className="col-12" style={{ marginRight: "20px" }}>
                            {/* <Typography style={{ fontSize: "20px", marginBottom: "22px" }}>Kardex</Typography> */}
                            <TableZyx
                                columns={columns}
                                data={dataDetailToShow}
                                download={true}
                                loading={detailRes.loading}
                                titlemodule="Kardex"
                                filterGeneral={false}
                                register={false}
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
                                                {getDateCleaned(dateRange.startDate!) +
                                                    " - " +
                                                    getDateCleaned(dateRange.endDate!)}
                                            </Button>
                                        </DateRangePicker>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </Paper>
            </div>
        </div>
    );
};

export default DetailStock;
