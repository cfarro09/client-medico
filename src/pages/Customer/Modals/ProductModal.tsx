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
import { Dictionary } from "@types";

interface DataSelected {
    item: Dictionary | null;
    edit: boolean;
    idx: number;
}

export interface modalPorps {
    parentData: DataSelected;
    openModal: boolean;
    setOpenModal: (param: any) => void;
    parentSetValue: (...param: any) => any;
    parentAppendValue: (...param: any) => any;
    productsToShow: Dictionary[];
    setProductsToShow: (param: any) => void;
}

const ProductModal: React.FC<modalPorps> = ({
    parentData: { item, edit, idx },
    openModal,
    setOpenModal,
    parentSetValue,
    parentAppendValue,
    productsToShow,
    setProductsToShow,
}) => {
    const { t } = useTranslation();

    useEffect(() => {
        reset({
            productid: item?.productid,
            description: item?.label,
            price: item?.price || '',
            product_type: item?.product_type,
            bonification_value: item?.bonification_value,
            label: item?.label,
            identifier: item?.identifier
        });
    }, [item, edit]);

    const {
        register,
        reset,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
        clearErrors,
    } = useForm({
        defaultValues: {
            productid: 0,
            description: "",
            price: '',
            bonification_value: "",
            product_type: "",
            label: "",
            identifier: ''
        },
    });

    useEffect(() => {
        register("description", { validate: (value: any) => (value && value.length) || t(langKeys.field_required) });
        register("price", { validate: (value: any) => (value && value > 0) || t(langKeys.field_required) });
        register("bonification_value");
    }, [getValues, register, t, item]);

    const handleCancelModal = () => {
        if (item?.clientproductpriceid <= 0 || item?.fromBD)
            setProductsToShow([...productsToShow, item]);
        clearErrors();
        setOpenModal(false);
    };

    const onSubmitAccount = handleSubmit((data) => {
        if (edit) {
            parentSetValue(`products.${idx}.price`, data.price);
            parentSetValue(`products.${idx}.bonification_value`, data.bonification_value);
        } else {
            parentAppendValue({
                clientproductpriceid: item?.clientproductpriceid,
                productid: data.productid,
                product_description: data.description,
                price: data.price,
                bonification_value: data.bonification_value,
                product_type: data.product_type,
                label: item?.label,
            });
        }
        setOpenModal(false);
    });

    return (
        <DialogZyx
            open={openModal}
            title={edit ? `Editar ${item?.label}` : "Nuevo Registro"}
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.save)}
            handleClickButton1={handleCancelModal}
            handleClickButton2={onSubmitAccount}
        >
            <div className="row-zyx">
                <FieldEdit
                    label={t(langKeys.name)}
                    disabled={true}
                    className="col-12"
                    valueDefault={getValues("description")}
                    onChange={(value) => setValue("description", value)}
                    error={errors?.description?.message}
                />
                <FieldEdit
                    label={"Precio (*)"}
                    className="col-12"
                    type="number"
                    valueDefault={getValues("price")}
                    onChange={(value) => setValue("price", value)}
                    error={errors?.price?.message}
                />
                <FieldEdit
                    label={"Bonificacion"}
                    className="col-12"
                    valueDefault={getValues("bonification_value")}
                    onChange={(value) => setValue("bonification_value", value)}
                    error={errors?.bonification_value?.message}
                />
            </div>
        </DialogZyx>
    );
};

export default ProductModal;
