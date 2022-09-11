/* eslint-disable react-hooks/exhaustive-deps */
import { Accordion, AccordionDetails, AccordionSummary, Button, makeStyles, Typography } from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TemplateIcons, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute, getCollectionAux, resetMainAux } from "store/main/actions";
import { getWarehouseSel, insShop } from "common/helpers";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import TableZyx from "components/fields/table-simple";

const arrayBread = [
    { id: "view-1", name: "Shops" },
    { id: "view-2", name: "Shop detail" },
];

const useStyles = makeStyles((theme) => ({
    containerDetail: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        background: "#fff",
        width: "100%",
        boxShadow:
            "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
    },
    containerDetail2: {
        marginTop: theme.spacing(2),
        width: "100%",
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: "14px",
        textTransform: "initial",
    },
}));

const Detail: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const dispatch = useDispatch();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [dataExtra, setDataExtra] = useState<{ status: Dictionary[]; type: Dictionary[] }>({ status: [], type: [] });
    const detailRes = useSelector((state) => state.main.mainAux);
    const [dataWarehouse, setDataWarehouse] = useState<Dictionary[]>([]);

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
            id: row?.shopid || 0,
            description: row?.description || "",
            type: row?.type || "NINGUNO",
            status: row?.status || "ACTIVO",
            operation: row ? "UPDATE" : "INSERT",
        },
    });

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insShop(data)));
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
        register("description", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("type", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("status", { validate: (value) => (value && value.length) || t(langKeys.field_required) });

        dispatch(resetMainAux());
        row && dispatch(getCollectionAux(getWarehouseSel({ shopid: row?.shopid, id: 0 })));
    }, [register]);

    useEffect(() => {
        if (!detailRes.loading && !detailRes.error) {
            setDataWarehouse(detailRes.data);
        }
    }, [detailRes]);

    const handleRegister = () => {
        console.log("aca");
        // setOpenDialogDomain(true)
        // setRowSelected({ row, domainname, edit: false });
    };

    const handleEdit = (row: Dictionary) => {
        console.log("edit");
        // setViewSelected("view-2");
        // setRowSelected(row);
    };

    const handleDelete = (row: Dictionary) => {
        console.log("delete");
        // const callback = () => {
        //     dispatch(execute(insShop({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.shopid })));
        //     dispatch(showBackdrop(true));
        //     setWaitSave(true);
        // };

        // dispatch(
        //     manageConfirmation({
        //         visible: true,
        //         question: t(langKeys.confirmation_delete),
        //         callback,
        //     })
        // );
    };

    const columns = React.useMemo(
        () => [
            {
                accessor: "warehouseid",
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: "1%",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <TemplateIcons
                            viewFunction={() => handleEdit(row)}
                            deleteFunction={() => handleDelete(row)}
                            editFunction={() => handleEdit(row)}
                        />
                    );
                },
            },
            {
                Header: t(langKeys.description),
                accessor: "description",
                NoFilter: true,
            },
            {
                Header: t(langKeys.address),
                accessor: "address",
                NoFilter: true,
            },
            {
                Header: t(langKeys.status),
                prefixTranslation: "status_",
                accessor: "status",
                NoFilter: true,
            },
        ],
        []
    );

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.description}` : "Nueva Tienda"} />
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
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            type="submit"
                            startIcon={<SaveIcon color="secondary" />}
                            style={{ backgroundColor: "#55BD84" }}
                        >
                            {t(langKeys.save)}
                        </Button>
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.description)}
                            className="col-6"
                            valueDefault={getValues("description")}
                            onChange={(value) => setValue("description", value)}
                            error={errors?.description?.message}
                        />
                        <FieldSelect
                            label={t(langKeys.type)}
                            className="col-6"
                            valueDefault={getValues("type")}
                            onChange={(value) => setValue("type", value?.domainvalue)}
                            error={errors?.type?.message}
                            data={dataExtra.type}
                            uset={true}
                            prefixTranslation="type_corp_"
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            label={t(langKeys.status)}
                            className="col-6"
                            valueDefault={getValues("status")}
                            onChange={(value) => setValue("status", value?.domainvalue)}
                            error={errors?.status?.message}
                            data={dataExtra.status}
                            uset={true}
                            prefixTranslation="status_"
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                    </div>
                </div>
                <div className={classes.containerDetail2}>
                    <Accordion expanded={!row ? true : undefined} style={{ marginBottom: "8px" }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>{"Almacenes"}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {detailRes.error ? (
                                <h1>ERROR</h1>
                            ) : (
                                <TableZyx
                                    columns={columns}
                                    data={dataWarehouse}
                                    download={false}
                                    loading={detailRes.loading}
                                    filterGeneral={false}
                                    register={true}
                                    handleRegister={handleRegister}
                                />
                            )}
                        </AccordionDetails>
                    </Accordion>
                </div>
            </form>
        </div>
    );
};

export default Detail;
