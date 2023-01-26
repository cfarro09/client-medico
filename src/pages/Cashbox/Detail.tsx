/*
 ** Change REGISTER_VALUES
 ** Change FORM_TITTLE
 */

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
import { insCashbox } from "common/helpers";

const arrayBread = [
    { id: "view-1", name: "Cashbox" },
    { id: "view-2", name: "Cashbox detail" },
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

const DetailCashbox: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
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
            id: row?.cashboxid || 0,
            operation: row ? "UPDATE" : "INSERT",
            description: row?.description || "",
            initial_amount: row?.initial_amount || "",
            observations: row?.observations || "",
            status: row?.status || "ACTIVO",
        },
    });

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insCashbox(data)));
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
        register("initial_amount", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("observations");
    }, [register]);

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.description}` : "FORM_TITTLE"} />
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
                            label={"Nombre (*)"}
                            className="col-6"
                            valueDefault={getValues("description")}
                            onChange={(value) => setValue("description", value)}
                            error={errors?.description?.message}
                        />
                        <FieldEdit
                            label={"Monto Inicial (*)"}
                            className="col-6"
                            valueDefault={getValues("initial_amount")}
                            onChange={(value) => setValue("initial_amount", value)}
                            error={errors?.initial_amount?.message}
                            type="numeric"
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={"Observaciones"}
                            className="col-6"
                            valueDefault={getValues("observations")}
                            onChange={(value) => setValue("observations", value)}
                            error={errors?.observations?.message}
                            type="numeric"
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

export default DetailCashbox;
