/* eslint-disable react-hooks/exhaustive-deps */
import {
    Button,
    IconButton,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldEditArray, FieldSelect, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute, getCollectionAux, resetMainAux } from "store/main/actions";
import { getCustomerProductsSel, insCostumer, insPurchase, insCustomerProduct } from "common/helpers";
import DeleteIcon from "@material-ui/icons/Delete";

type FormFields = {
    id: number;
    description: string;
    doc_type: string;
    doc_num: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    status: string;
    type: string;
    operation: string;
    products: Dictionary[];
};

const arrayBread = [
    { id: "view-1", name: "Customers" },
    { id: "view-2", name: "Customer detail" },
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

const DetailCustomer: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const mainAux = useSelector((state) => state.main.mainAux);
    const [dataExtra, setDataExtra] = useState<{ status: Dictionary[]; type: Dictionary[]; bonif: Dictionary[] }>({
        status: [],
        type: [],
        bonif: [],
    });
    const [productsToShow, setProductsToShow] = useState<Dictionary[]>([]);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataTypes = multiData.data.find((x) => x.key === "DOMAIN-TIPODOCUMENTO");
            const dataBonif = multiData.data.find((x) => x.key === "DOMAIN-TIPOBONIFICACION");
            const products = multiData.data.find((x) => x.key === "UFN_PRODUCT_LST");
            if (dataStatus && dataTypes && products && dataBonif) {
                setProductsToShow(products.data);
                setDataExtra({
                    status: dataStatus.data,
                    type: dataTypes.data,
                    bonif: dataBonif.data,
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
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
        trigger,
    } = useForm<FormFields>({
        defaultValues: {
            id: row?.customerid || 0,
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
            products: [],
        },
    });

    const {
        fields: fieldsProduct,
        append: productAppend,
        remove: productRemove,
    } = useFieldArray({
        control,
        name: "products",
    });

    const processTransaction = (data: FormFields, status: string = "") => {
        if (data.products.filter(item => item.status !== "ELIMINADO").length === 0) {
            dispatch(showSnackbar({ show: true, success: false, message: "Debe tener como minimo un producto registrado" }));
            return
        }
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute({
                header: insCostumer(data),
                detail: data.products.map(x => insCustomerProduct({
                    ...x,
                    id: x.customerproductid,
                    operation: x.customerproductid > 0 ? (x.status === "ELIMINADO" ? "DELETE" : "UPDATE") : "INSERT",
                    status: 'ACTIVO',
                }))
            }, true));
            setWaitSave(true)
        }

        dispatch(
            manageConfirmation({
                visible: true,
                question: t(langKeys.confirmation_save),
                callback,
            })
        );
    }

    const onSubmit = handleSubmit((data) => processTransaction(data));

    useEffect(() => {
        if (!mainAux.loading && !mainAux.error) {
            if (mainAux.key === "UFN_CUSTOMER_PRODUCT_SEL") {
                setValue("products", mainAux.data.map(x => ({
                    customerproductid: x.customerproductid,
                    productid: x.productid,
                    type_bonification: x.type_bonification,
                    bonification: x.bonification,
                    min_bonification: x.min_bonification,
                    product_description: x.product_name,
                    price: parseFloat((x.price || "0")),
                })));
                trigger("products")
            }
        }
        return () => {
            dispatch(resetMainAux())
        }
    }, [mainAux])

    React.useEffect(() => {
        register("description", {
            validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required),
        });
        register("status", { validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required) });
        register("doc_type", { validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required) });
        register("doc_num", { validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required) });
        register("contact_name");
        register("contact_email");
        register("contact_phone");
        register("address");

        if (row) {
            // if (row.status === "ENTREGADO" || merchantEntry) {
            //     setLock(true)
            // }
            dispatch(getCollectionAux(getCustomerProductsSel(row?.customerid)))
        }
    }, [register]);

    // const onSubmit = handleSubmit((data) => {
    //     console.log("data", data);
    //     return;
    //     const callback = () => {
    //         dispatch(showBackdrop(true));
    //         dispatch(execute(insCostumer(data)));
    //         setWaitSave(true);
    //     };

    //     dispatch(
    //         manageConfirmation({
    //             visible: true,
    //             question: t(langKeys.confirmation_save),
    //             callback,
    //         })
    //     );
    // });

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.description}` : "Nuevo Cliente"} />
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
                            label={"Descripcion"}
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
                            type="number"
                            error={errors?.doc_num?.message}
                            InputProps={{ inputProps: { min: "0", max: "99999999999" } }}
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
                            type="email"
                            error={errors?.contact_email?.message}
                        />
                        <FieldEdit
                            label={"Telefono Contacto"}
                            className="col-6"
                            valueDefault={getValues("contact_phone")}
                            onChange={(value) => setValue("contact_phone", value)}
                            error={errors?.contact_phone?.message}
                            type="number"
                            InputProps={{ inputProps: { min: "0", max: "999999999" } }}
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
                <div className={classes.containerDetail}>
                    <FieldSelect
                        label={"Product"}
                        variant="outlined"
                        optionDesc="description"
                        optionValue="productid"
                        data={productsToShow}
                        onChange={(value) => {
                            setProductsToShow(productsToShow.filter((x) => x.productid !== value.productid));
                            productAppend({
                                customerproductid: fieldsProduct.length * -1,
                                productid: value.productid,
                                // stockid: value.stockid,
                                product_description: value.description,
                                price: 0,
                                type_bonification: "",
                                bonification: 0,
                                min_bonification: 0,
                            });
                        }}
                    />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Producto</TableCell>
                                    <TableCell style={{}}>Precio</TableCell>
                                    <TableCell style={{}}>Tipo Bonif.</TableCell>
                                    <TableCell style={{}}>Bonificacion</TableCell>
                                    <TableCell style={{}}>Min. Req (Bonif)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody style={{ marginTop: 5 }}>
                                {fieldsProduct.map((item, i: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div style={{ display: "flex" }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        productRemove(i);
                                                    }}
                                                >
                                                    <DeleteIcon style={{ color: "#777777" }} />
                                                </IconButton>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>{getValues(`products.${i}.product_description`)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <FieldEditArray
                                                fregister={{
                                                    ...register(`products.${i}.price`, {
                                                        validate: (value) =>
                                                            value > 0 || "" + t(langKeys.field_required),
                                                    }),
                                                }}
                                                inputProps={{ min: 0, style: { textAlign: "right" } }} // the change is here
                                                type={"number"}
                                                valueDefault={getValues(`products.${i}.price`)}
                                                // disabled={lock}
                                                error={errors?.products?.[i]?.price?.message}
                                                onChange={(value) => {
                                                    setValue(`products.${i}.price`, value);
                                                    const price = getValues(`products.${i}.price`);
                                                    // const n_bottles = getValues(`products.${i}.n_bottles`);
                                                    setValue(`products.${i}.subtotal`, price * value);
                                                    trigger(`products.${i}.subtotal`);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FieldSelect
                                                fregister={{
                                                    ...register(`products.${i}.type_bonification`, {
                                                        validate: (value) =>
                                                            (value && value.length > 0) ||
                                                            "" + t(langKeys.field_required),
                                                    }),
                                                }}
                                                label={""}
                                                // className="col-6"
                                                valueDefault={getValues(`products.${i}.type_bonification`)}
                                                onChange={(value) => {
                                                    setValue(`products.${i}.type_bonification`, value?.domainvalue);
                                                }}
                                                error={errors?.products?.[i]?.type_bonification?.message}
                                                data={dataExtra.bonif}
                                                uset={true}
                                                optionDesc="domainvalue"
                                                optionValue="domainvalue"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FieldEditArray
                                                fregister={{
                                                    ...register(`products.${i}.bonification`, {
                                                        validate: (value) =>
                                                            value > 0 || "" + t(langKeys.field_required),
                                                    }),
                                                }}
                                                inputProps={{ min: 0, style: { textAlign: "right" } }} // the change is here
                                                type={"number"}
                                                valueDefault={getValues(`products.${i}.bonification`)}
                                                // disabled={lock}
                                                error={errors?.products?.[i]?.bonification?.message}
                                                onChange={(value) => {
                                                    setValue(`products.${i}.bonification`, value);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FieldEditArray
                                                fregister={{
                                                    ...register(`products.${i}.min_bonification`, {
                                                        validate: (value) =>
                                                            value > 0 || "" + t(langKeys.field_required),
                                                    }),
                                                }}
                                                inputProps={{ min: 0, style: { textAlign: "right" } }} // the change is here
                                                type={"number"}
                                                valueDefault={getValues(`products.${i}.min_bonification`)}
                                                // disabled={lock}
                                                error={errors?.products?.[i]?.min_bonification?.message}
                                                onChange={(value) => {
                                                    setValue(`products.${i}.min_bonification`, value);
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </form>
        </div>
    );
};

export default DetailCustomer;
