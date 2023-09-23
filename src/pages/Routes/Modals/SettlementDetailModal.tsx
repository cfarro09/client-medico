import { Box, FormControl, Input, InputAdornment, InputLabel, TextField } from "@material-ui/core";
import { Dictionary } from "@types";
import { DialogZyx, DialogZyx3Opt, FieldEdit, FieldSelect } from "components";
import { useSelector } from "hooks";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute } from "store/main/actions";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { langKeys } from "lang/keys";
import { insSettlementDetailUpdate } from "common/helpers";

export interface modalPorps {
    openModal: boolean;
    setOpenModal: (param: any) => void;
    row?: Dictionary | null;
    updateRow: (param: Dictionary) => void;
}

const SettlementDetailModal: React.FC<modalPorps> = ({ openModal, setOpenModal, row, updateRow }) => {
    const { t } = useTranslation();
    const multiData = useSelector((state) => state.main.multiData);
    const dispatch = useDispatch();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const [dataExtra, setDataExtra] = useState<{
        accounts: Dictionary[];
        cashboxes: Dictionary[];
        payment_methods: Dictionary[];
    }>({
        accounts: [],
        cashboxes: [],
        payment_methods: [],
    });

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(
                    showSnackbar({
                        show: true,
                        success: true,
                        message: t(langKeys.successful_register),
                    })
                );
                updateRow && updateRow(row || {});
                dispatch(showBackdrop(false));
                setWaitSave(false);
                handleCancelModal();
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
        if (!multiData.error && !multiData.loading) {
            const accounts = multiData.data.find((x) => x.key === "UFN_ACCOUNT_SEL");
            const cashboxes = multiData.data.find((x) => x.key === "UFN_CASHBOX_SEL");
            const payment_methods = multiData.data.find((x) => x.key === "UFN_PAYMENT_METHODS_SEL");

            setDataExtra({
                accounts: accounts?.data.filter((x) => x.show_settlement) || [],
                cashboxes: cashboxes?.data || [],
                payment_methods: payment_methods?.data.filter((x) => x.show_settlement) || [],
            });
        }
    }, [multiData]);

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
        clearErrors,
        reset,
        watch,
    } = useForm({
        defaultValues: {
            id: 0,
            origin: row?.origin || "",
            settlementdetailid: row?.settlementdetailid || 0,
            accountid: 0,
            cashboxid: 0,
            amount: row?.amount || 0,
            paymentmethodid: 0,
            observations: "",
            status: "ACTIVO",
            operation: "INSERT",
        },
    });

    const [paymentmethodid] = watch(["paymentmethodid"]);

    const registerCustom = () => {
        register("origin", { validate: (value: any) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register("paymentmethodid", {
            validate: (value: any) => (value && value > 0) || "" + t(langKeys.field_required),
        });
        register("amount", { validate: (value: any) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("accountid", {
            validate: (value) =>
                paymentmethodid === 3 || (paymentmethodid !== 3 && value > 0) || "" + t(langKeys.field_required),
        });
        register("cashboxid", {
            validate: (value) =>
                paymentmethodid !== 3 || (paymentmethodid === 3 && value > 0) || "" + t(langKeys.field_required),
        });
    };

    useEffect(() => {
        reset({
            id: 0,
            origin: row?.origin || "",
            settlementdetailid: row?.settlementdetailid || 0,
            accountid: row?.accountid || 0,
            cashboxid: row?.cashboxid || 0,
            amount: row?.amount || 0,
            paymentmethodid: row?.paymentmethodid || 0,
            observations: "",
            status: "ACTIVO",
            operation: "INSERT",
        });
        registerCustom();
    }, [row]);

    useEffect(() => {
        registerCustom();
    }, [paymentmethodid]);

    const handleCancelModal = () => {
        setOpenModal(false);
        clearErrors();
    };

    const onConfirm = handleSubmit((data) => {
        if (row?.status) row.new_status = "CONFIRMADO";
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insSettlementDetailUpdate({ ...data, status: "CONFIRMADO" })));
            setWaitSave(true);
        };

        dispatch(
            manageConfirmation({
                visible: true,
                question: t(langKeys.confirmation_save),
                callback,
            })
        );
        setOpenModal(false);
    });

    const onReject = handleSubmit((data) => {
        if (row) row.new_status = "RECHAZADO";
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insSettlementDetailUpdate({ ...data, status: "RECHAZADO" })));
            setWaitSave(true);
        };

        dispatch(
            manageConfirmation({
                visible: true,
                question: t(langKeys.confirmation_save),
                callback,
            })
        );
        setOpenModal(false);
    });

    return (
        <DialogZyx3Opt
            open={openModal}
            title={"Detalle de Liquidación"}
            buttonText1={"Confimar transaccion"}
            buttonText2={"Rechazar transaccion"}
            buttonText3={"Salir"}
            handleClickButton1={onConfirm}
            handleClickButton2={onReject}
            handleClickButton3={handleCancelModal}
        >
            <div className="row-zyx">
                <FieldEdit
                    label={"PROCEDENCIA"}
                    variant={"standard"}
                    className="col-12"
                    disabled={true}
                    valueDefault={getValues("origin")}
                    onChange={(value) => setValue("origin", value)}
                    error={errors?.origin?.message}
                />
            </div>
            <div className="row-zyx">
                <FieldSelect
                    loading={multiData.loading}
                    label={"METODO DE PAGO"}
                    className="col-6"
                    valueDefault={getValues("paymentmethodid")}
                    onChange={(value) => setValue("paymentmethodid", value?.paymentmethodid)}
                    data={dataExtra.payment_methods}
                    optionDesc="description"
                    optionValue="paymentmethodid"
                    error={errors?.paymentmethodid?.message}
                />
            </div>
            <div className="row-zyx">
                {paymentmethodid !== 3 && (
                    <FieldSelect
                        loading={multiData.loading}
                        label={"DESTINO - CUENTA"}
                        className="col-6"
                        valueDefault={getValues("accountid")}
                        onChange={(value) => setValue("accountid", value?.accountid)}
                        data={dataExtra.accounts}
                        optionDesc="description"
                        optionValue="accountid"
                        error={errors?.accountid?.message}
                    />
                )}
                {paymentmethodid === 3 && (
                    <FieldSelect
                        loading={multiData.loading}
                        label={"DESTINO - CAJA"}
                        className="col-6"
                        valueDefault={getValues("cashboxid")}
                        onChange={(value) => setValue("cashboxid", value?.cashboxid)}
                        data={dataExtra.cashboxes}
                        optionDesc="description"
                        optionValue="cashboxid"
                        error={errors?.cashboxid?.message}
                    />
                )}
            </div>
            <div className="row-zyx">
                <FieldEdit
                    label={"MONTO"}
                    variant={"standard"}
                    className="col-6"
                    valueDefault={getValues("amount")}
                    onChange={(value) => setValue("amount", value)}
                    type="number"
                    error={errors?.amount?.message}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                    }}
                />
            </div>
        </DialogZyx3Opt>
    );
};

export default SettlementDetailModal;
