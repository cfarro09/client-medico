/* eslint-disable react-hooks/exhaustive-deps */
import { Button, makeStyles } from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute } from "store/main/actions";
import { insSupplier } from "common/helpers";

const arrayBread = [
    { id: "view-1", name: "Suppliers" },
    { id: "view-2", name: "Supplier detail" },
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
}));

const DetailSupplier: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [dataExtra, setDataExtra] = useState<{ status: Dictionary[]; type: Dictionary[] }>({ status: [], type: [] });
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataTypes = multiData.data.find((x) => x.key === "DOMAIN-TIPODOCUMENTO");
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
            id: row?.supplierid || 0,
            description: row?.description || "",
            doc_type: row?.doc_type || "",
            doc_num: row?.doc_num || "",
            contact_name: row?.contact_name || "",
            contact_email: row?.contact_email || "",
            contact_phone: row?.contact_phone || "",
            address: row?.address || "",
            status: row?.status || "ACTIVO",
            type: row?.type || "NINGUNO",
            operation: row ? "UPDATE" : "INSERT",
        },
    });

    React.useEffect(() => {
        register("description", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("status", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("doc_type", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("doc_num", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("contact_name");
        register("contact_email");
        register("contact_phone");
        register("address");
    }, [register]);

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insSupplier(data)));
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

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.description}` : 'Nuevo Proveedor'} />
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
                            label={'Descripcion'}
                            className="col-6"
                            valueDefault={getValues("description")}
                            onChange={(value) => setValue("description", value)}
                            error={errors?.description?.message}
                        />
                        <FieldSelect
                            label={t(langKeys.docType)}
                            className="col-6"
                            valueDefault={getValues("doc_type")}
                            onChange={(value) => setValue("doc_type", value?.domainvalue)}
                            error={errors?.doc_type?.message}
                            data={dataExtra.type}
                            uset={true}
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.docNumber)}
                            className="col-6"
                            valueDefault={getValues("doc_num")}
                            onChange={(value) => setValue("doc_num", value)}
                            type='number'
                            error={errors?.doc_num?.message}
                            InputProps={{ inputProps: { min: "0", max: '99999999999' } }}
                        />
                        <FieldEdit
                            label={"Nombre Contacto"}
                            className="col-6"
                            valueDefault={getValues("contact_name")}
                            onChange={(value) => setValue("contact_name", value)}
                            error={errors?.contact_name?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={"Email Contact"}
                            className="col-6"
                            valueDefault={getValues("contact_email")}
                            onChange={(value) => setValue("contact_email", value)}
                            type='email'
                            error={errors?.contact_email?.message}
                        />
                        <FieldEdit
                            label={"Telefono Contacto"}
                            className="col-6"
                            valueDefault={getValues("contact_phone")}
                            onChange={(value) => setValue("contact_phone", value)}
                            error={errors?.contact_phone?.message}
                            type='number'
                            InputProps={{ inputProps: { min: "0", max: '999999999' } }}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={"Direccion"}
                            className="col-6"
                            valueDefault={getValues("address")}
                            onChange={(value) => setValue("address", value)}
                            error={errors?.address?.message}
                        />
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
            </form>
        </div>
    );
};

export default DetailSupplier;
