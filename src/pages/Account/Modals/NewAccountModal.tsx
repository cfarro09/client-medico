/* eslint-disable react-hooks/exhaustive-deps */
import { DialogZyx, FieldEdit } from "components";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useSelector } from "hooks";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute } from "store/main/actions";
import { insAccount } from "common/helpers";

export interface modalPorps {
    openModal: boolean;
    setOpenModal: (param: any) => void;
    fetchData: () => void;
}

const NewAccountModal: React.FC<modalPorps> = ({ openModal, setOpenModal, fetchData }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);

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
    } = useForm({
        defaultValues: {
            id: 0,
            description: "",
            account_number: "",
            initial_amount: "",
            observations: "",
            status: "ACTIVO",
            operation: "INSERT",
        },
    });

    useEffect(() => {
        register("description", { validate: (value: any) => (value && value.length) || t(langKeys.field_required) });
        register("initial_amount", { validate: (value: any) => (value && value.length) || t(langKeys.field_required) });
        register("account_number");
        register("status");
    }, [getValues, register, t]);

    const handleCancelModal = () => {
        setOpenModal(false);
        setValue("description", "");
        setValue("initial_amount", "");
        setValue("observations", "");
        clearErrors();
    };

    const onSubmitAccount = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insAccount({ ...data, amount: data.initial_amount })));
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
        <DialogZyx
            open={openModal}
            title={t(langKeys.createnewbill)}
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.save)}
            handleClickButton1={handleCancelModal}
            handleClickButton2={onSubmitAccount}
        >
            <div className="row-zyx">
                <FieldEdit
                    label={t(langKeys.name)}
                    className="col-12"
                    valueDefault={getValues("description")}
                    onChange={(value) => setValue("description", value)}
                    error={errors?.description?.message}
                />
                <FieldEdit
                    label={"Numero de Cuenta"}
                    className="col-12"
                    valueDefault={getValues("account_number")}
                    onChange={(value) => setValue("account_number", value)}
                    error={errors?.account_number?.message}
                />
                <FieldEdit
                    label={t(langKeys.initialamount)}
                    className="col-12"
                    type="number"
                    valueDefault={getValues("initial_amount")}
                    onChange={(value) => setValue("initial_amount", value)}
                    error={errors?.initial_amount?.message}
                />
                <FieldEdit
                    label={t(langKeys.observations)}
                    className="col-12"
                    valueDefault={getValues("observations")}
                    onChange={(value) => setValue("observations", value)}
                    error={errors?.observations?.message}
                />
            </div>
        </DialogZyx>
    );
};

export default NewAccountModal;
