/* eslint-disable react-hooks/exhaustive-deps */
import { DialogZyx, FieldEdit, FieldSelect } from "components";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useSelector } from "hooks";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute } from "store/main/actions";
import { insAccount, insPaymentMethod } from "common/helpers";
import { FormControlLabel, Switch } from "@material-ui/core";
import { Dictionary } from "@types";

export interface modalPorps {
    openModal: boolean;
    setOpenModal: (param: any) => void;
    fetchData: () => void;
}

const NewPaymentMethodModal: React.FC<modalPorps> = ({ openModal, setOpenModal, fetchData }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [dataExtra, setDataExtra] = useState<{
        status: Dictionary[];
        account: Dictionary[];
    }>({ status: [], account: [] });

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataAccount = multiData.data.find((x) => x.key === "UFN_ACCOUNT_LS");
            if (dataStatus && dataAccount) {
                setDataExtra({
                    status: dataStatus.data,
                    account: dataAccount.data,
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
                        message: t(langKeys.successful_register),
                    })
                );
                fetchData && fetchData();
                dispatch(showBackdrop(false));
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

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
        clearErrors,
        trigger,
    } = useForm({
        defaultValues: {
            id: 0,
            description: "",
            status: "ACTIVO",
            accountid: 0,
            is_coupon: false,
            coupon_value: 0,
            type: "NINGUNO",
            operation: "INSERT",
        },
    });

    useEffect(() => {
        // register("description", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("accountid", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("is_coupon");
        register("coupon_value");
    }, [getValues, register, t]);

    const handleCancelModal = () => {
        setOpenModal(false);
        setValue("description", "");
        // setValue("initial_amount", "");
        // setValue("observations", "");
        clearErrors();
    };

    const onSubmitAccount = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insPaymentMethod({ ...data, coupon_value: !data.is_coupon ? 0 : data.coupon_value })));
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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue("is_coupon", event.target.checked);
        trigger("is_coupon");
    };

    return (
        <DialogZyx
            open={openModal}
            title={"Nuevo método de pago"}
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.save)}
            handleClickButton1={handleCancelModal}
            handleClickButton2={onSubmitAccount}
        >
            <div className="row-zyx">
                <FieldEdit
                    label={"Nombre"}
                    className="col-12"
                    valueDefault={getValues("description")}
                    onChange={(value) => setValue("description", value)}
                    error={errors?.description?.message}
                />
                <FieldSelect
                    label={"Cuenta"}
                    className="col-12"
                    valueDefault={getValues("accountid")}
                    onChange={(value) => setValue("accountid", value?.accountid)}
                    error={errors?.accountid?.message}
                    data={dataExtra.account}
                    uset={true}
                    optionDesc="account_name"
                    optionValue="accountid"
                />
                <FieldSelect
                    label={t(langKeys.status)}
                    className="col-12"
                    valueDefault={getValues("status")}
                    onChange={(value) => setValue("status", value?.domainvalue)}
                    error={errors?.status?.message}
                    data={dataExtra.status}
                    uset={true}
                    prefixTranslation="status_"
                    optionDesc="domainvalue"
                    optionValue="domainvalue"
                />
                <div className="col-6" style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                    <div>
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
                </div>
                {getValues("is_coupon") && (
                    <FieldEdit
                        label={"Valor del Cupon"}
                        className="col-6"
                        valueDefault={getValues("coupon_value")}
                        onChange={(value) => setValue("coupon_value", value)}
                        error={errors?.coupon_value?.message}
                        type="number"
                    />
                )}
            </div>
        </DialogZyx>
    );
};

export default NewPaymentMethodModal;
