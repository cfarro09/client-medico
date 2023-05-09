/*
 ** Change defaultValues
 ** Change insPaymentMethod for insert function of your new module
 ** Change REGISTER_VALUES
 ** Change FORM_TITTLE
 */

/* eslint-disable react-hooks/exhaustive-deps */
import { Button, FormControlLabel, makeStyles, Switch } from "@material-ui/core";
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
import { insPaymentMethod } from "common/helpers";

const arrayBread = [
    { id: "view-1", name: "Payment Methods" },
    { id: "view-2", name: "Payment Method detail" },
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

const PaymentMethodDetail: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [dataExtra, setDataExtra] = useState<{ status: Dictionary[]; type: Dictionary[]; accounts: Dictionary[] }>({
        status: [],
        type: [],
        accounts: [],
    });
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataTypes = multiData.data.find((x) => x.key === "DOMAIN-TIPOCORP");
            const dataAccount = multiData.data.find((x) => x.key === "UFN_ACCOUNT_LS");
            if (dataStatus && dataTypes && dataAccount) {
                setDataExtra({
                    status: dataStatus.data,
                    type: dataTypes.data,
                    accounts: dataAccount.data,
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
        trigger,
    } = useForm({
        defaultValues: {
            id: row?.paymentmethodid || 0,
            description: row?.description || "",
            status: row?.status || "ACTIVO",
            debit_accountid: row?.debit_accountid || 0,
            credit_accountid: row?.credit_accountid || 0,
            is_coupon: row?.is_coupon || false,
            coupon_value: row?.coupon_value || 0,
            type: row?.type || "NINGUNO",
            operation: row ? "UPDATE" : "INSERT",
        },
    });

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insPaymentMethod({...data, coupon_value: (!data.is_coupon) ? 0 : data.coupon_value})));
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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue("is_coupon", event.target.checked);
        trigger("is_coupon");
    };

    // REGISTER_VALUES
    React.useEffect(() => {
        register("description", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("status", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("debit_accountid", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("credit_accountid", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("is_coupon");
        register("coupon_value");
    }, [register]);

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.description}` : `Nuevo metodod de Pago`} />
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
                            label={"Nombre"}
                            className="col-6"
                            valueDefault={getValues("description")}
                            onChange={(value) => setValue("description", value)}
                            error={errors?.description?.message}
                        />
                        <FieldSelect
                            label={"Cuenta Debito"}
                            className="col-6"
                            valueDefault={getValues("debit_accountid")}
                            onChange={(value) => setValue("debit_accountid", value?.accountid)}
                            error={errors?.debit_accountid?.message}
                            data={dataExtra.accounts}
                            uset={true}
                            optionDesc="description"
                            optionValue="accountid"
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            label={"Cuenta Credito"}
                            className="col-6"
                            valueDefault={getValues("credit_accountid")}
                            onChange={(value) => setValue("credit_accountid", value?.accountid)}
                            error={errors?.credit_accountid?.message}
                            data={dataExtra.accounts}
                            uset={true}
                            optionDesc="description"
                            optionValue="accountid"
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
                    <div className="row-zyx">
                        <div className="col-6">
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={getValues("is_coupon")}
                                        onChange={handleChange}
                                        name="checkedB"
                                        color="primary"
                                    />
                                }
                                label="Es Cupon?"
                            />
                        </div>
                        {getValues('is_coupon') && 
                            <FieldEdit
                                label={"Valor del Cupon"}
                                className="col-6"
                                valueDefault={getValues("coupon_value")}
                                onChange={(value) => setValue("coupon_value", value)}
                                error={errors?.coupon_value?.message}
                                type='number'
                            />
                        }
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PaymentMethodDetail;
