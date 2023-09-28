/* eslint-disable react-hooks/exhaustive-deps */
import { Button, FormControlLabel, InputAdornment, Switch, makeStyles } from "@material-ui/core";
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
    const [dataExtra, setDataExtra] = useState<{ status: Dictionary[]; type: Dictionary[]; staff: Dictionary[] }>({
        status: [],
        type: [],
        staff: [],
    });
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataTypes = multiData.data.find((x) => x.key === "DOMAIN-TIPOCORP");
            const staff = multiData.data.find((x) => x.key === "UFN_STAFF_SEL");

            setDataExtra({
                status: dataStatus?.data || [],
                type: dataTypes?.data || [],
                staff: staff?.data || [],
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
                dispatch(
                    showSnackbar({
                        show: true,
                        success: false,
                        message: executeResult.usererror ? executeResult.usererror : errormessage,
                    })
                );
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
        trigger,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: row?.cashboxid || 0,
            operation: row ? "UPDATE" : "INSERT",
            description: row?.description || "",
            initial_amount: row?.initial_amount || 0,
            observations: row?.observations || "",
            status: row?.status || "ACTIVO",
            userid: row?.userid || 0,
            administrative: row?.administrative || false,
        },
    });

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insCashbox({ ...data, amount: data.initial_amount })));
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

    //
    React.useEffect(() => {
        register("userid", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("status", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("observations");
    }, [register]);

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.description}` : "Nueva Caja"} />
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
                        <FieldSelect
                            label={"RESPONSABLE"}
                            className="col-6"
                            valueDefault={getValues("userid")}
                            onChange={(value) => {
                                setValue("userid", value?.userid);
                                setValue("description", value?.full_name);
                                trigger("description");
                            }}
                            error={errors?.userid?.message}
                            data={dataExtra.staff}
                            // uset={true}
                            optionDesc="full_name"
                            optionValue="userid"
                        />

                        <FieldEdit
                            label={"NOMBRE (*)"}
                            className="col-6"
                            disabled={true}
                            valueDefault={getValues("description")}
                            onChange={(value) => setValue("description", value)}
                            error={errors?.description?.message}
                        />
                        <FieldEdit
                            label={"MONTO INICIAL (*)"}
                            className="col-6"
                            valueDefault={getValues("initial_amount")}
                            onChange={(value) => setValue("initial_amount", value)}
                            error={errors?.initial_amount?.message}
                            type="number"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                            }}
                        />
                        <FieldSelect
                            label={"ESTADO"}
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
                        <FieldEdit
                            label={"OBSERVACIONES"}
                            className="col-6"
                            valueDefault={getValues("observations")}
                            onChange={(value) => setValue("observations", value)}
                            error={errors?.observations?.message}
                            type="numeric"
                        />
                        <div className="col-4" style={{ display: "flex" }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={getValues("administrative")}
                                        onChange={(event) => {
                                            setValue("administrative", event.target.checked);
                                            trigger("administrative");
                                        }}
                                        name="checkedB"
                                        color="primary"
                                    />
                                }
                                label="ADMINISTRATIVA"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DetailCashbox;
