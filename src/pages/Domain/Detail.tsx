/* eslint-disable react-hooks/exhaustive-deps */
import { Accordion, AccordionDetails, AccordionSummary, Button, makeStyles, Typography } from "@material-ui/core";
import { Dictionary } from "@types";
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
import { getDomainValueSel, insDomain, insDomainvalue } from "common/helpers";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import TableZyx from "components/fields/table-simple";
import DomainModal from "./Modals/DomainModal";

const arrayBread = [
    { id: "view-1", name: "Domain" },
    { id: "view-2", name: "Domain detail" },
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

interface RowSelected {
    row: Dictionary | null;
    domainname: string | "";
    edit: boolean;
}

interface DetailProps {
    data: RowSelected;
    setViewSelected: (view: string) => void;
    fetchData?: () => void
}

const Detail: React.FC<DetailProps> = ({ data: { row, domainname, edit }, setViewSelected, fetchData }) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const dispatch = useDispatch();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const detailRes = useSelector((state) => state.main.mainAux);
    const [dataDomain, setDataDomain] = useState<Dictionary[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [rowSelected, setRowSelected] = useState<RowSelected>({ row: null, edit: false, domainname: '' });
    const [domainToDelete, setDomainToDelete] = useState<Dictionary[]>([]);
    const [dataExtra, setDataExtra] = useState<{ status: Dictionary[]; type: Dictionary[] }>({ status: [], type: [] });

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
            id: row?.domainid || 0,
            operation: row ? "EDIT" : "INSERT",
            description: row?.description || "",
            domainname: row?.domainname || "",
            type: row?.type || "",
            status: row?.status || "ACTIVO",
        },
    });

    React.useEffect(() => {
        register("id");
        register("domainname", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("description", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("status", { validate: (value) => (value && value.length) || t(langKeys.field_required) });

        dispatch(resetMainAux());
        row && dispatch(getCollectionAux(getDomainValueSel(row?.domainname || "")));
    }, [register]);

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(
                execute(
                    {
                        header: insDomain({ ...data }),
                        detail: [
                            ...dataDomain
                                .filter((x) => !!x.operation)
                                .map((x) =>
                                    insDomainvalue({
                                        ...data,
                                        ...x,
                                        status: data?.status,
                                        id: x.domainid ? x.domainid : 0,
                                    })
                                ),
                            ...domainToDelete.map((x) =>
                                insDomainvalue({ ...x, id: x.domainid, description: data.description, type: data.type })
                            ),
                        ],
                    },
                    true
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

    useEffect(() => {
        if (!detailRes.loading && !detailRes.error) {
            setDataDomain(detailRes.data);
        }
    }, [detailRes]);

    const handleRegister = () => {
        setRowSelected({ row: null, edit: false, domainname });
        setOpenModal(true);
    };

    const handleEdit = (row: Dictionary) => {
        setRowSelected({ row, edit: true, domainname });
        setOpenModal(true);
    };

    const handleDelete = (row: Dictionary) => {
        if (row && row.operation !== "INSERT") {
            setDomainToDelete((p) => [...p, { ...row, operation: "DELETE", status: "ELIMINADO" }]);
        } else {
            row.operation = "DELETE";
        }
        setDataDomain((p) =>
            p.filter((x) => (row.operation === "DELETE" ? x.operation !== "DELETE" : row.domainid !== x.domainid))
        );
    };

    const columns = React.useMemo(
        () => [
            {
                accessor: "domainid",
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
                Header: t(langKeys.code),
                accessor: "domainvalue",
                NoFilter: true,
            },
            {
                Header: t(langKeys.description),
                accessor: "domaindesc",
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
                    <TitleDetail title={row ? `${row.domainname}` : "Nuevo Dominio"} />
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
                            label={t(langKeys.domain)}
                            disabled={row ? true : false}
                            className="col-6"
                            valueDefault={row?.domainname || ""}
                            onChange={(value) => setValue("domainname", value)}
                            error={errors?.domainname?.message}
                        />
                        <FieldEdit
                            label={t(langKeys.description)}
                            className="col-6"
                            valueDefault={row?.description || ""}
                            onChange={(value) => setValue("description", value)}
                            error={errors?.description?.message}
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
                            <Typography>{"Lista de Valores"}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {detailRes.error ? (
                                <h1>ERROR</h1>
                            ) : (
                                <TableZyx
                                    columns={columns}
                                    data={dataDomain}
                                    download={false}
                                    loading={detailRes.loading}
                                    filterGeneral={false}
                                    register={true}
                                    handleRegister={handleRegister}
                                    onClickRow={handleEdit}
                                />
                            )}
                        </AccordionDetails>
                    </Accordion>
                </div>
            </form>
            <DomainModal
                data={rowSelected}
                openModal={openModal}
                setOpenModal={setOpenModal}
                updateRecords={setDataDomain}
                dataDomain={dataDomain}
                dataToDelete={domainToDelete}
            />
        </div>
    );
};

export default Detail;
