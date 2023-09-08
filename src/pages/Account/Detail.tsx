/*
 ** Change insCorp for insert function of your new module
 ** Change defaultValues
 ** Change REGISTER_VALUES
 ** Change FORM_TITTLE
 */

/* eslint-disable react-hooks/exhaustive-deps */
import { Button, CircularProgress, Paper, makeStyles } from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { DateRangePicker, FieldEdit, FieldSelect, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute, getCollectionAux } from "store/main/actions";
import { getDateCleaned, getDetailPurchase, getAccountInfoSel, insCorp, formatMoney } from "common/helpers";
import { CalendarIcon } from "icons";
import TableZyx from "components/fields/table-simple";
import { Range } from "react-date-range";

const arrayBread = [
    { id: "view-1", name: "Cuentas" },
    { id: "view-2", name: "Detalle Cuenta" },
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

const Detail: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const detailRes = useSelector((state) => state.main.mainAux);
    const multiData = useSelector((state) => state.main.multiData);
    const [openDateRangeModal, setOpenDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialRange);
    const [dataExtra, setDataExtra] = useState<{ status: Dictionary[]; type: Dictionary[] }>({ status: [], type: [] });
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [dataDetail, setDataDetail] = useState<Dictionary[]>([]);
    const [dataDetailToShow, setDataDetailToShow] = useState<Dictionary[]>([]);

    const search = () => {
        dispatch(
            getCollectionAux(
                getAccountInfoSel({
                    accountid: row?.accountid,
                    startdate: dateRange.startDate,
                    finishdate: dateRange.endDate,
                })
            )
        );
    };

    useEffect(() => {
        console.log({ row });
        search();
    }, [row]);

    useEffect(() => {
        if (!detailRes.loading && !detailRes.error && detailRes.key === "UFN_ACCOUNT_TRANSFER_SEL") {
            setDataDetail(detailRes.data);
            setDataDetailToShow(detailRes.data);
        }
    }, [detailRes]);

    useEffect(() => {
        if (!openDateRangeModal) search();
    }, [openDateRangeModal]);

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

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: row?.corpid || 0,
            operation: row ? "UPDATE" : "INSERT",
            status: row?.status || "ACTIVO",
            type: row?.type || "NINGUNO",
            description: row?.description || "",
            contact_name: row?.contact_name || "",
            contact_email: row?.contact_email || "",
            contact_phone: row?.contact_phone || "",
            address: row?.address || "",
        },
    });

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insCorp(data)));
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

    // REGISTER_VALUES
    React.useEffect(() => {
        register("description", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("status", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("id", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("contact_name");
        register("contact_email");
        register("contact_phone");
        register("address");
    }, [register]);

    const columns = React.useMemo(
        () => [
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
                Header: "TIPO",
                accessor: "doc_type",
                NoFilter: true,
            },
            {
                Header: "PROCEDENCIA",
                accessor: "description",
                NoFilter: true,
            },
            {
                Header: "FORMA PAGO",
                accessor: "payment_method",
                NoFilter: true,
            },
            {
                Header: "MONTO",
                accessor: "ammount",
                NoFilter: true,
                Cell: (props: any) => {
                    const {amount} = props.cell.row.original;
                    return 'S/ ' + formatMoney(amount);
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

    return (
        <div style={{ width: "100%" }}>
            <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                <TitleDetail title={row ? `${row.description}` : ""} />
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

export default Detail;
