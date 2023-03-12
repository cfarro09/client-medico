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
import { insProduct } from "common/helpers";

const arrayBread = [
    { id: "view-1", name: "Products" },
    { id: "view-2", name: "Product detail" },
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

const Detail: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [dataExtra, setDataExtra] = useState<{
        status: Dictionary[];
        category: Dictionary[];
        package: Dictionary[];
        unit: Dictionary[];
        brand: Dictionary[];
    }>({ status: [], category: [], package: [], unit: [], brand: [] });
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataCategory = multiData.data.find((x) => x.key === "DOMAIN-CATEGORIAPRODUCTO");
            const dataPackage = multiData.data.find((x) => x.key === "DOMAIN-TIPOEMPAQUE");
            const dataUnit = multiData.data.find((x) => x.key === "DOMAIN-UNIDADMEDIDAPRODUCTO");
            const dataBrand = multiData.data.find((x) => x.key === "DOMAIN-MARCAPRODUCTO");
            if (dataStatus && dataCategory && dataPackage && dataUnit && dataBrand) {
                setDataExtra({
                    status: dataStatus.data,
                    category: dataCategory.data,
                    package: dataPackage.data,
                    unit: dataUnit.data,
                    brand: dataBrand.data,
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
        trigger,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: row?.productid || 0,
            product_name: row?.product_name || "",
            product_code: row?.product_code || "",
            product_description: row?.product_description || "",
            unit: row?.unit || "",
            price_1: row?.price_1 || 0,
            price_2: row?.price_2 || 0,
            purchase_price: row?.purchase_price || 0,
            product_brand: row?.product_brand || "",
            category: row?.category || "",
            types_packaging: row?.types_packaging || "",
            color: row?.color || "",
            n_bottles: row?.n_bottles || 0,
            with_container: row?.with_container || false,
            status: row?.status || "ACTIVO",
            operation: row ? "UPDATE" : "INSERT",
        },
    });

    React.useEffect(() => {
        register("product_name", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        // register("price_1", { validate: (value) => (value && value > 0) || t(langKeys.field_required) });
        // register("purchase_price", { validate: (value) => (value && value > 0) || t(langKeys.field_required) });
        register("status", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("with_container");
    }, [register]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue("with_container", event.target.checked);
        trigger("with_container");
    };

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insProduct(data)));
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
                    <TitleDetail title={row ? `${row.product_name}` : "Nuevo producto"} />
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
                            label={t(langKeys.name)}
                            className="col-6"
                            valueDefault={getValues("product_name")}
                            onChange={(value) => setValue("product_name", value)}
                            error={errors?.product_name?.message}
                        />
                        <FieldSelect
                            label={t(langKeys.category)}
                            className="col-6"
                            valueDefault={getValues("category")}
                            onChange={(value) => setValue("category", value?.domainvalue)}
                            error={errors?.category?.message}
                            data={dataExtra.category}
                            uset={true}
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            label={t(langKeys.brand)}
                            className="col-6"
                            valueDefault={getValues("product_brand")}
                            onChange={(value) => setValue("product_brand", value?.domainvalue)}
                            error={errors?.product_brand?.message}
                            data={dataExtra.brand}
                            uset={true}
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                        <FieldEdit
                            label={"Precio de costo"}
                            className="col-6"
                            type="number"
                            valueDefault={getValues("purchase_price")}
                            onChange={(value) => setValue("purchase_price", value)}
                            error={errors?.purchase_price?.message}
                            InputProps={{ inputProps: { min: "0" } }}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            label={"Unidad de Medida"}
                            className="col-6"
                            valueDefault={getValues("unit")}
                            onChange={(value) => setValue("unit", value?.domainvalue)}
                            error={errors?.unit?.message}
                            data={dataExtra.unit}
                            uset={true}
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
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
                                        checked={getValues("with_container")}
                                        onChange={handleChange}
                                        name="checkedB"
                                        color="primary"
                                    />
                                }
                                label="Tiene Envase?"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Detail;
