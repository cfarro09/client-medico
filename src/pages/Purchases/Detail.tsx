/* eslint-disable react-hooks/exhaustive-deps */
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    CircularProgress,
    IconButton,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import {
    FieldEdit,
    FieldEditArray,
    FieldSelect,
    FieldUploadImage,
    FieldUploadImage2,
    TemplateBreadcrumbs,
    TitleDetail,
} from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute, getMultiCollectionAux, resetMultiMainAux } from "store/main/actions";
import {
    getDetailPayments,
    getDetailPurchase,
    insPurchase,
    insPurchaseDetail,
    insPurchasePayments,
} from "common/helpers";
import { ExpandMore } from "@material-ui/icons";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";

const arrayBread = [
    { id: "view-1", name: "Purchase" },
    { id: "view-2", name: "Purchase detail" },
];

const useStyles = makeStyles((theme) => ({
    containerDetail: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        background: "#fff",
        width: "100%",
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: "14px",
        textTransform: "initial",
    },
    title: {
        fontSize: "22px",
        color: theme.palette.text.primary,
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: "33.33%",
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
}));

type FormFields = {
    id: number;
    operation: string;
    status: string;
    supplierid: number;
    warehouseid: number;
    purchase_order_number: string;
    bill_entry_date: string;
    purchase_order_create_date: string;
    bill_number: string;
    bill_image: File;
    observations: string;
    userid: number;
    brand: string;
    scop_number: string;
    company_name: string;
    guide_number: string;
    description: string;
    products: Dictionary[];
    payments: Dictionary[];
    image1: any;
    image2: any;
};

const DetailPurcharse: React.FC<DetailModule & { merchantEntry: Boolean }> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const multiDataAux = useSelector((state) => state.main.multiDataAux);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [totalOrder, setTotalOrder] = useState(0);
    const [dataExtra, setDataExtra] = useState<{
        companys: Dictionary[];
        warehouses: Dictionary[];
        payments: Dictionary[];
        drivers: Dictionary[];
        vehicles: Dictionary[];
        suppliers: Dictionary[];
    }>({ companys: [], warehouses: [], payments: [], drivers: [], vehicles: [], suppliers: [] });
    const [expanded, setExpanded] = React.useState<string | false>("panel0");
    const [productsToShow, setProductsToShow] = useState<Dictionary[]>([]);
    const [loading, setLoading] = useState<Boolean>(false);

    useEffect(() => {
        if (row) {
            setLoading(true);
        }
    }, [row]);

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const companys = multiData.data.find((x) => x.key === "DOMAIN-EMPRESAS");
            const warehouses = multiData.data.find((x) => x.key === "UFN_WAREHOUSE_LST");
            const payments = multiData.data.find((x) => x.key === "UFN_PAYMENT_METHOD_LST");
            const drivers = multiData.data.find((x) => x.key === "UFN_DRIVERS_LST");
            const vehicles = multiData.data.find((x) => x.key === "UFN_AVAILABLE_VEHICLE_LST");
            const products = multiData.data.find((x) => x.key === "UFN_PRODUCT_LST2");
            const suppliers = multiData.data.find((x) => x.key === "UFN_SUPPLIER_LST");
            if (companys && warehouses && payments && drivers && vehicles && products && suppliers) {
                setProductsToShow(products.data);
                setDataExtra({
                    companys: companys.data,
                    warehouses: warehouses.data,
                    payments: payments.data,
                    drivers: !row ? drivers.data.filter((d) => d.status !== "ASIGNADO") : drivers.data,
                    vehicles: !row ? vehicles.data.filter((v) => v.status !== "ASIGNADO") : vehicles.data,
                    suppliers: suppliers.data,
                });

                if (!row) {
                    setValue("supplierid", suppliers.data?.[0]?.supplierid || 0);
                    setValue("company_name", companys.data?.[0]?.domainvalue || 0);
                    trigger("supplierid");
                    trigger("company_name");
                }
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
        control,
        trigger,
        formState: { errors, isDirty, isValid },
    } = useForm<FormFields>({
        defaultValues: {
            id: row?.purchaseorderid || 0,
            operation: row ? "UPDATE" : "INSERT",
            status: row?.status || "ACTIVO",
            supplierid: row?.supplierid || 0,
            warehouseid: row?.warehouseid || 0,
            purchase_order_number: row?.purchase_order_number || "",
            bill_entry_date: row?.bill_entry_date || new Date(new Date().setHours(10)).toISOString().substring(0, 10),
            purchase_order_create_date:
                row?.purchase_order_create_date || new Date(new Date().setHours(10)).toISOString().substring(0, 10),
            bill_number: row?.bill_number || "",
            bill_image: row?.bill_image || "",
            observations: row?.observations || "",
            userid: row?.userid || 0,
            brand: row?.brand || "",
            scop_number: row?.scop_number || "",
            company_name: row?.company_name || "",
            guide_number: row?.guide_number || "",
            description: row?.description || "",
            image1: row?.image1 || "",
            image2: row?.image2 || "",
            products: [],
            payments: [],
        },
    });

    const {
        fields: fieldsPayment,
        append: paymentAppend,
        remove: paymentRemove,
    } = useFieldArray({
        control,
        name: "payments",
    });

    const {
        fields: fieldsProduct,
        append: productAppend,
        remove: productRemove,
    } = useFieldArray({
        control,
        name: "products",
    });

    useEffect(() => {
        const total = getValues("products")
            .filter((item) => item.status !== "ELIMINADO")
            .reduce((acc, item) => acc + item.subtotal, 0);
        setTotalOrder(total);
    }, [getValues("products")]);

    const processTransaction = (data: FormFields, status: string = "") => {
        console.log("🚀 ~ file: Detail.tsx:254 ~ processTransaction ~ data:", data);
        return;
        if (data.products.filter((item) => item.status !== "ELIMINADO").length === 0) {
            dispatch(
                showSnackbar({ show: true, success: false, message: "Debe tener como minimo un producto registrado" })
            );
            return;
        }

        if (data.payments.filter((item) => item.status !== "ELIMINADO").length === 0) {
            dispatch(
                showSnackbar({
                    show: true,
                    success: false,
                    message: "Debe tener como minimo un metodo de pago registrado",
                })
            );
            return;
        }

        const total = data.products
            .filter((item) => item.status !== "ELIMINADO")
            .reduce((acc, item) => acc + item.subtotal, 0);

        const pagos = data.payments.reduce((acc, item) => acc + item.amount, 0);

        if (pagos < total) {
            dispatch(
                showSnackbar({
                    show: true,
                    success: false,
                    message: "Los pagos deben igualar el total de la transaccion",
                })
            );
            return;
        }

        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(
                execute(
                    {
                        header: insPurchase({ ...data, total }),
                        detail: [
                            ...data.products.map((x) =>
                                insPurchaseDetail({
                                    ...x,
                                    operation:
                                        x.purchaseorderdetailid > 0
                                            ? x.status === "ELIMINADO"
                                                ? "DELETE"
                                                : "UPDATE"
                                            : "INSERT",
                                })
                            ),
                            ...data.payments.map((p) =>
                                insPurchasePayments({
                                    ...p,
                                    operation:
                                        p.purchaseorderpaymentid > 0
                                            ? p.status === "ELIMINADO"
                                                ? "DELETE"
                                                : "UPDATE"
                                            : "INSERT",
                                    id: p.purchaseorderpaymentid,
                                    status: "ACTIVO",
                                    amount: p.amount,
                                })
                            ),
                        ],
                    },
                    true
                )
            );
            setWaitSave(true);
        };

        dispatch(
            manageConfirmation({
                visible: true,
                question: t(langKeys.confirmation_save),
                callback,
            })
        );
    };

    const onSubmit = handleSubmit((data) => processTransaction(data));

    const onChangePhoto = (value: any) => {
        setValue("image1", value);
    };

    React.useEffect(() => {
        if (!multiDataAux.error && !multiDataAux.loading) {
            const detailProducts = multiDataAux.data.find((x) => x.key === "UFN_PURHCASE_ORDER_DETAIL_SEL");
            const detailPayments = multiDataAux.data.find((x) => x.key === "UFN_PURCHASE_ODER_PAYMENT_SEL");
            if (detailProducts && detailPayments) {
                setProductsToShow(productsToShow.filter((b) => !detailProducts.data.some(({ id }) => b.id === id)));

                setValue(
                    "products",
                    detailProducts.data.map((x) => ({
                        purchaseorderdetailid: x.purchaseorderdetailid,
                        id: x.id,
                        productid: x.productid,
                        description: x.description,
                        product_type: x.product_type,
                        price: parseFloat(x?.price || "0"),
                        requested_quantity: x.requested_quantity,
                        delivered_quantity: x.delivered_quantity,
                        subtotal: x.total,
                        status: x.status,
                    }))
                );
                trigger("products");
                setLoading(false);

                setValue(
                    "payments",
                    detailPayments.data.map((x) => ({
                        purchaseorderpaymentid: x.purchaseorderpaymentid,
                        paymentmethodid: x.paymentmethodid,
                        method: x.method,
                        amount: x.amount,
                        status: x.status,
                    }))
                );
            }
        }
        return () => {
            dispatch(resetMultiMainAux());
        };
    }, [multiDataAux]);

    React.useEffect(() => {
        register("warehouseid", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("userid", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("supplierid", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });

        if (row?.purchaseorderid) {
            dispatch(
                getMultiCollectionAux([
                    getDetailPurchase(row?.purchaseorderid),
                    getDetailPayments(row?.purchaseorderid),
                ])
            );
        }
    }, [register]);

    const handleChangePanel = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleRemove = (index: number, item: Dictionary) => {
        if (item.purchaseorderdetailid > 0) {
            setValue(`products.${index}.status`, "ELIMINADO");
            trigger("products");
            return;
        }

        productRemove(index);
    };

    const handleDeletePayment = (index: number, item: Dictionary) => {
        if (item.purchaseorderpaymentid > 0) {
            setValue(`payments.${index}.status`, "ELIMINADO");
            trigger("payments");
            return;
        }
        paymentRemove(index);
    };

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.purchase_order_number}` : "Nueva compra"} />
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
                        {!row && (
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
                        )}
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <div className="row-zyx">
                        <FieldSelect
                            label={"CHOFER (*)"}
                            className="col-4"
                            disabled={!!row}
                            valueDefault={getValues("userid")}
                            onChange={(value) => setValue("userid", value?.userid)}
                            error={errors?.userid?.message}
                            data={dataExtra.drivers}
                            uset={true}
                            optionDesc="driver"
                            optionValue="userid"
                        />
                        <FieldSelect
                            label={"ALMACEN(UNIDAD) (*)"}
                            className="col-4"
                            disabled={!!row}
                            valueDefault={getValues("warehouseid")}
                            onChange={(value) => setValue("warehouseid", value?.warehouseid)}
                            error={errors?.warehouseid?.message}
                            data={dataExtra.vehicles}
                            uset={true}
                            optionDesc="plate_number"
                            optionValue="warehouseid"
                        />
                        <FieldSelect
                            label={"EMPRESA"}
                            className="col-4"
                            disabled={!!row}
                            valueDefault={getValues("company_name")}
                            onChange={(value) => setValue("company_name", value?.domainvalue)}
                            error={errors?.company_name?.message}
                            data={dataExtra.companys}
                            uset={true}
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            label={"PROVEEDOR (*)"}
                            className="col-4"
                            disabled={!!row}
                            valueDefault={getValues("supplierid")}
                            onChange={(value) => setValue("supplierid", value?.supplierid)}
                            error={errors?.supplierid?.message}
                            data={dataExtra.suppliers}
                            uset={true}
                            optionDesc="description"
                            optionValue="supplierid"
                        />
                        <FieldEdit
                            label={"MARCA"}
                            className="col-4"
                            disabled={!!row}
                            valueDefault={getValues("brand")}
                            onChange={(value) => setValue("brand", value)}
                            error={errors?.brand?.message}
                        />
                        <FieldEdit
                            label={"OBSERVACIONES"}
                            className="col-4"
                            disabled={!!row}
                            valueDefault={getValues("observations")}
                            onChange={(value) => setValue("observations", value)}
                            error={errors?.observations?.message}
                        />
                        
                    </div>
                    <div className="row-zyx"><FieldEdit
                            label={"NRO DE SCOTT"}
                            disabled={!!row}
                            className="col-3"
                            valueDefault={getValues("scop_number")}
                            onChange={(value) => setValue("scop_number", value)}
                            error={errors?.scop_number?.message}
                        />
                        <FieldUploadImage2
                            className="col-1"
                            valueDefault={getValues("bill_image")}
                            onChange={(value) => setValue("bill_image", value)}
                        />
                        <FieldEdit
                            label={"FACTURA"}
                            className="col-3"
                            disabled={!!row}
                            valueDefault={getValues("bill_number")}
                            onChange={(value) => setValue("bill_number", value)}
                            error={errors?.bill_number?.message}
                        />
                        <FieldUploadImage2
                            className="col-1"
                            valueDefault={getValues("bill_image")}
                            onChange={(value) => setValue("bill_image", value)}
                        />
                        <FieldEdit
                            label={"NRO GUIA"}
                            className="col-3"
                            disabled={!!row}
                            valueDefault={getValues("guide_number")}
                            onChange={(value) => setValue("guide_number", value)}
                            error={errors?.guide_number?.message}
                        />
                        <FieldUploadImage2
                            className="col-1"
                            valueDefault={getValues("bill_image")}
                            onChange={(value) => setValue("bill_image", value)}
                        />
                        
                    </div>
                </div>
                {loading && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <CircularProgress />
                    </div>
                )}
                {!loading && (
                    <div className={classes.containerDetail}>
                        <Accordion expanded={expanded === "panel0"} onChange={handleChangePanel("panel0")}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel0bh-content"
                                id="panel0bh-header"
                            >
                                <Typography className={classes.heading}>Productos</Typography>
                                <Typography className={classes.secondaryHeading}>
                                    {row ? "Detalle de productos" : "Elegir productos de la compra"}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className={classes.containerDetail}>
                                    {!row && (
                                        <FieldSelect
                                            label={"PRODUCTOS"}
                                            variant="outlined"
                                            data={productsToShow}
                                            optionDesc="descritpion"
                                            optionValue="id"
                                            onChange={(value) => {
                                                setProductsToShow(productsToShow.filter((x) => x.id !== value.id));
                                                productAppend({
                                                    purchaseorderdetailid: fieldsProduct.length * -1,
                                                    id: value.id,
                                                    productid: value.productid,
                                                    description: value.descritpion,
                                                    product_type: value.product_type,
                                                    price: parseFloat(value?.purchase_price || "0"),
                                                    requested_quantity: 0,
                                                    delivered_quantity: 0,
                                                    subtotal: 0.0,
                                                    status: "ACTIVO",
                                                });
                                            }}
                                        />
                                    )}
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell></TableCell>
                                                    <TableCell>Producto</TableCell>
                                                    <TableCell style={{ textAlign: "right" }}>Cantidad</TableCell>
                                                    <TableCell style={{ textAlign: "right" }}>Precio</TableCell>
                                                    <TableCell style={{ textAlign: "right" }}>Subtotal</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody style={{ marginTop: 5 }}>
                                                {getValues("products").map(
                                                    (item, i: number) =>
                                                        item.status === "ACTIVO" && (
                                                            <TableRow key={item.id}>
                                                                <TableCell width={30}>
                                                                    <div style={{ display: "flex" }}>
                                                                        <IconButton
                                                                            size="small"
                                                                            style={{ display: !!row ? "none" : "auto" }}
                                                                            onClick={() => {
                                                                                handleRemove(i, item);
                                                                            }}
                                                                        >
                                                                            <DeleteIcon style={{ color: "#777777" }} />
                                                                        </IconButton>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getValues(`products.${i}.description`)}
                                                                </TableCell>
                                                                <TableCell width={180}>
                                                                    <FieldEditArray
                                                                        fregister={{
                                                                            ...register(
                                                                                `products.${i}.requested_quantity`,
                                                                                {
                                                                                    validate: (value) =>
                                                                                        value > 0 ||
                                                                                        "" + t(langKeys.field_required),
                                                                                }
                                                                            ),
                                                                        }}
                                                                        type={"number"}
                                                                        disabled={!!row}
                                                                        inputProps={{
                                                                            min: 0,
                                                                            style: { textAlign: "right" },
                                                                        }}
                                                                        valueDefault={getValues(
                                                                            `products.${i}.requested_quantity`
                                                                        )}
                                                                        onChange={(value) => {
                                                                            setValue(
                                                                                `products.${i}.requested_quantity`,
                                                                                value
                                                                            );
                                                                            const price = getValues(
                                                                                `products.${i}.price`
                                                                            );
                                                                            setValue(
                                                                                `products.${i}.subtotal`,
                                                                                price * value
                                                                            );
                                                                            trigger(`products.${i}.subtotal`);
                                                                        }}
                                                                        error={
                                                                            errors?.products?.[i]?.requested_quantity
                                                                                ?.message
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell width={180}>
                                                                    <FieldEditArray
                                                                        fregister={{
                                                                            ...register(`products.${i}.price`, {
                                                                                validate: (value) =>
                                                                                    value > 0 ||
                                                                                    "" + t(langKeys.field_required),
                                                                            }),
                                                                        }}
                                                                        inputProps={{
                                                                            min: 0,
                                                                            style: { textAlign: "right" },
                                                                        }}
                                                                        type={"number"}
                                                                        disabled={!!row}
                                                                        valueDefault={getValues(`products.${i}.price`)}
                                                                        error={errors?.products?.[i]?.price?.message}
                                                                        onChange={(value) => {
                                                                            setValue(`products.${i}.price`, value);
                                                                            const quantity = getValues(
                                                                                `products.${i}.requested_quantity`
                                                                            );
                                                                            setValue(
                                                                                `products.${i}.subtotal`,
                                                                                quantity * value
                                                                            );
                                                                            trigger(`products.${i}.subtotal`);
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell width={180}>
                                                                    <div style={{ textAlign: "right" }}>
                                                                        S/. {getValues(`products.${i}.subtotal`)}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={expanded === "panel1"} onChange={handleChangePanel("panel1")}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="panel1bh-content"
                                id="panel1bh-header"
                            >
                                <Typography className={classes.heading}>Método de pago</Typography>
                                <Typography className={classes.secondaryHeading}>
                                    Los métodos de pago para la orden
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className={classes.containerDetail}>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            style={{ display: !!row ? "none" : "auto" }}
                                                            onClick={() => {
                                                                const tt = getValues("payments").reduce(
                                                                    (acc, x) => acc + x.amount,
                                                                    0
                                                                );
                                                                paymentAppend({
                                                                    purchaseorderpaymentid: fieldsPayment.length * -1,
                                                                    paymentmethodid: 0,
                                                                    method: "",
                                                                    amount: totalOrder - tt,
                                                                    status: "ACTIVO",
                                                                });
                                                            }}
                                                        >
                                                            <AddIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell>Modo de pago</TableCell>
                                                    <TableCell>Monto a pagar</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody style={{ marginTop: 5 }}>
                                                {getValues("payments").map(
                                                    (item, i: number) =>
                                                        item.status === "ACTIVO" && (
                                                            <TableRow key={item.id}>
                                                                <TableCell width={20}>
                                                                    <div style={{ display: "flex" }}>
                                                                        <IconButton
                                                                            size="small"
                                                                            style={{ display: !!row ? "none" : "auto" }}
                                                                            onClick={() => {
                                                                                handleDeletePayment(i, item);
                                                                            }}
                                                                        >
                                                                            <DeleteIcon style={{ color: "#777777" }} />
                                                                        </IconButton>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell width={200}>
                                                                    <FieldSelect
                                                                        label={""}
                                                                        className="col-6"
                                                                        disabled={!!row}
                                                                        valueDefault={getValues(
                                                                            `payments.${i}.paymentmethodid`
                                                                        )}
                                                                        onChange={(value) => {
                                                                            console.log("value", value);
                                                                            setValue(
                                                                                `payments.${i}.method`,
                                                                                value.description
                                                                            );
                                                                            setValue(
                                                                                `payments.${i}.paymentmethodid`,
                                                                                value.paymentmethodid
                                                                            );
                                                                        }}
                                                                        disableClearable={true}
                                                                        error={errors?.payments?.[i]?.method?.message}
                                                                        data={dataExtra.payments}
                                                                        fregister={{
                                                                            ...register(`payments.${i}.method`, {
                                                                                validate: (value) =>
                                                                                    !!value ||
                                                                                    "Debe ingresar una cantidad correcta",
                                                                            }),
                                                                        }}
                                                                        optionDesc="description"
                                                                        optionValue="paymentmethodid"
                                                                    />
                                                                </TableCell>
                                                                <TableCell width={180}>
                                                                    <FieldEditArray
                                                                        fregister={{
                                                                            ...register(`payments.${i}.amount`, {
                                                                                validate: (value) =>
                                                                                    value >= 0 ||
                                                                                    "Debe ingresar una cantidad correcta",
                                                                            }),
                                                                        }}
                                                                        inputProps={{
                                                                            min: 0,
                                                                            style: { textAlign: "right" },
                                                                        }}
                                                                        type={"number"}
                                                                        disabled={!!row}
                                                                        valueDefault={getValues(`payments.${i}.amount`)}
                                                                        error={errors?.payments?.[i]?.amount?.message}
                                                                        onChange={(value) =>
                                                                            setValue(
                                                                                `payments.${i}.amount`,
                                                                                parseFloat(value || "0")
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                )}
            </form>
        </div>
    );
};

export default DetailPurcharse;
