/* eslint-disable react-hooks/exhaustive-deps */
import { DetailModule, Dictionary } from "@types";
import {
    AntTab,
    FieldEdit,
    FieldEditArray,
    FieldEditMulti,
    FieldSelect,
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
import { execute, getCollectionAux, resetMainAux } from "store/main/actions";
import { getDetailPurchase, insPurchase, insPurchaseDetail, insPurchasePayments, processOC } from "common/helpers";
import {
    Button,
    makeStyles,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableFooter,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import Tabs from "@material-ui/core/Tabs";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import { ExpandMore } from "@material-ui/icons";
import AddIcon from "@material-ui/icons/Add";

const arrayBread = [
    { id: "view-1", name: "Purchase" },
    { id: "view-2", name: "Purchase detail" },
];

const statusList = [{ value: "PENDIENTE" }, { value: "ENTREGADO" }];

const purchaseType = [{ value: "GLP" }, { value: "INSUMO" }];

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
    purchaseorderid: number;
    products: Dictionary[];
    payments: Dictionary[];
    supplierid: number;
    warehouseid: number;
    purchasecreatedate: string;
    purchase_order_number: string;
    observations: string;
    bill_entry_date: string;
    bill_number: string;
    company_name: string;
    driverid: number;
    scop_number: string;
    brand: string;
    guide_number: string;
    // no va
    category: string;
};

const DetailPurcharse: React.FC<DetailModule & { merchantEntry: Boolean }> = ({
    row,
    setViewSelected,
    fetchData,
    merchantEntry,
}) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const mainAux = useSelector((state) => state.main.mainAux);
    const [productsToShow, setProductsToShow] = useState<Dictionary[]>([]);
    const [pageSelected, setPageSelected] = useState(0);
    const [lock, setLock] = useState(false);
    const [totalOrder, setTotalOrder] = useState(0);
    const [expanded, setExpanded] = React.useState<string | false>("panel0");
    const [dataExtra, setDataExtra] = useState<{
        status: Dictionary[];
        type: Dictionary[];
        products: Dictionary[];
        suppliers: Dictionary[];
        payments: Dictionary[];
        warehouses: Dictionary[];
        payMethods: Dictionary[];
        drivers: Dictionary[];
        vehicles: Dictionary[];
        companys: Dictionary[];
    }>({
        status: [],
        type: [],
        products: [],
        payments: [],
        suppliers: [],
        warehouses: [],
        payMethods: [],
        drivers: [],
        vehicles: [],
        companys: [],
    });
    const dispatch = useDispatch();
    const { t } = useTranslation();

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
            purchaseorderid: row?.purchaseorderid || 0,
            supplierid: row?.supplierid || 0,
            warehouseid: row?.warehouseid || 0,
            purchasecreatedate:
                row?.purchasecreatedate || new Date(new Date().setHours(10)).toISOString().substring(0, 10),
            purchase_order_number: row?.purchase_order_number || "",
            observations: row?.observations || "",
            category: row?.status || "GLP",
            bill_entry_date: row?.bill_entry_date || new Date(new Date().setHours(10)).toISOString().substring(0, 10),
            bill_number: row?.bill_number || "",
            products: [],
            payments: [],
            company_name: row?.company_name || "",
            driverid: row?.userid || 0,
            scop_number: row?.scop_number || "",
            brand: row?.brand || "",
            guide_number: row?.guide_number || "",
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
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const payments = multiData.data.find((x) => x.key === "DOMAIN-METODOPAGO");
            const products = multiData.data.find((x) => x.key === "UFN_PRODUCT_LST");
            const suppliers = multiData.data.find((x) => x.key === "UFN_SUPPLIER_LST");
            const warehouses = multiData.data.find((x) => x.key === "UFN_WAREHOUSE_LST");
            const paymentMethods = multiData.data.find((x) => x.key === "UFN_PAYMENT_METHOD_LST");
            const drivers = multiData.data.find((x) => x.key === "UFN_DRIVERS_LST");
            const vehicles = multiData.data.find((x) => x.key === "UFN_AVAILABLE_VEHICLE_LST");
            const companys = multiData.data.find((x) => x.key === "DOMAIN-EMPRESAS");

            if (dataStatus && products && suppliers && warehouses && drivers && vehicles && companys) {
                setProductsToShow(
                    products.data
                        .filter((x) => x.category === "GLP")
                        .reduce((acum, current) => {
                            if (current.with_container)
                                acum.push(
                                    {
                                        ...current,
                                        label: "CARGA " + current.product_name,
                                        id: `carga-${current.productid}`,
                                        product_type: "carga",
                                    },
                                    {
                                        ...current,
                                        label: "ENVASE " + current.product_name,
                                        id: `envase-${current.productid}`,
                                        product_type: "envase",
                                    }
                                );
                            else
                                acum.push({
                                    ...current,
                                    label: current.product_name,
                                    id: current.productid,
                                    product_type: "full",
                                });
                            return acum as Dictionary;
                        }, []) as Dictionary[]
                );
                setDataExtra({
                    status: dataStatus.data,
                    type: [],
                    products: products.data,
                    suppliers: suppliers.data,
                    warehouses: warehouses.data,
                    payments: payments?.data || [],
                    payMethods: paymentMethods?.data || [],
                    drivers: drivers.data,
                    vehicles: vehicles.data,
                    companys: companys.data,
                });

                setValue("supplierid", suppliers.data?.[0]?.supplierid || 0);
                trigger("supplierid");
                setValue("warehouseid", warehouses.data?.[0]?.warehouseid || 0);
                trigger("warehouseid");
                setValue("company_name", companys.data?.[0]?.companys || 0);
                trigger("company_name");
            }
        }
    }, [multiData]);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                if (
                    executeResult.key === "UFN_PURCHASE_ORDER_INS" &&
                    ((getValues("purchaseorderid") === 0 && getValues("category") === "ENTREGADO") || merchantEntry)
                ) {
                    dispatch(execute(processOC(executeResult.data?.[0]?.p_purchaseorderid)));
                } else {
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
                }
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
        const total = getValues("products")
            .filter((item) => item.status !== "ELIMINADO")
            .reduce((acc, item) => acc + item.subtotal, 0);
        setTotalOrder(total);
    }, [getValues("products")]);

    const processTransaction = (data: FormFields, status: string = "") => {
        console.log("data", data);
        // data.payments.map(x => console.log('paymentmethodid', x.method.paymentmethodid))
        if (data.products.filter((item) => item.status !== "ELIMINADO").length === 0) {
            dispatch(
                showSnackbar({ show: true, success: false, message: "Debe tener como minimo un producto registrado" })
            );
            return;
        }
        const callback = () => {
            const total = data.products
                .filter((item) => item.status !== "ELIMINADO")
                .reduce((acc, item) => acc + item.subtotal, 0);
            dispatch(showBackdrop(true));
            dispatch(
                execute(
                    {
                        header: insPurchase({
                            ...data,
                            operation: data.purchaseorderid ? "UPDATE" : "INSERT",
                            // status: merchantEntry ? status : data.category,
                            status : 'PENDIENTE',
                            total,
                        }),
                        detail: [
                            ...data.products.map((x) =>
                                insPurchaseDetail({
                                    ...x,
                                    operation:
                                        x.purchasedetailid > 0
                                            ? x.status === "ELIMINADO"
                                                ? "DELETE"
                                                : "UPDATE"
                                            : "INSERT",
                                    status: "ACTIVO",
                                    delivered_quantity: merchantEntry
                                        ? x.delivered_quantity
                                        : data.category === "ENTREGADO"
                                        ? x.quantity
                                        : 0,
                                    quantity: x.n_bottles * x.quantity,
                                    price: x.price / x.n_bottles,
                                })
                            ),
                            ...data.payments.map((p) =>
                                insPurchasePayments({
                                    operation: "INSERT",
                                    id: 0,
                                    paymentmethodid: p.method.paymentmethodid,
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

    const processEntryMerchant = async (status: string) => {
        const allOk = await trigger(); //para q valide el formulario
        if (allOk) {
            const data = getValues();
            processTransaction(data, status);
        }
    };

    const handleChangePanel = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const onSubmit = handleSubmit((data) => processTransaction(data));

    useEffect(() => {
        if (!mainAux.loading && !mainAux.error) {
            if (mainAux.key === "UFN_PURHCASE_ORDER_DETAIL_SEL") {
                setValue(
                    "products",
                    mainAux.data.map((x) => ({
                        purchasedetailid: x.purchaseorderdetailid,
                        productid: x.productid,
                        requested_quantity: x.requested_quantity,
                        quantity: x.missing_quantity,
                        delivered_quantity: 0,
                        product_description: x.product_name,
                        price: parseFloat(x.price || "0"),
                        subtotal: parseFloat(x.total || "0"),
                        list_unit: [
                            { unit: x.unit, unit_desc: `${x.unit} (1)`, quantity: 1 },
                            ...(x.n_bottles > 0
                                ? [
                                      {
                                          unit: x.types_packaging,
                                          quantity: x.n_bottles,
                                          unit_desc: `${x.types_packaging} (${x.n_bottles})`,
                                      },
                                  ]
                                : []),
                        ],
                        unit_selected: x.unit,
                        n_bottles: 1,
                    }))
                );
                trigger("products");
            }
        }
        return () => {
            dispatch(resetMainAux());
        };
    }, [mainAux]);

    React.useEffect(() => {
        register("purchaseorderid");
        register("supplierid", { validate: (value) => value > 0 || "" + t(langKeys.field_required) });
        register("warehouseid", { validate: (value) => value > 0 || "" + t(langKeys.field_required) });
        register("observations");
        register("company_name");
        register("purchase_order_number");
        register("purchasecreatedate", {
            validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required),
        });

        if (row?.purchaseorderid) {
            if (row.status === "ENTREGADO" || merchantEntry) {
                setLock(true);
            }
            dispatch(getCollectionAux(getDetailPurchase(row?.purchaseorderid)));
        }
    }, [register]);

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail
                        title={
                            row
                                ? (merchantEntry ? "Ingreso de mercaderia " : "") + `${row.purchase_order_number}`
                                : "Nueva orden de compra"
                        }
                    />
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
                        {!lock && (
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
                        {merchantEntry && (
                            <Button
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                type="button"
                                startIcon={<SaveIcon color="secondary" />}
                                style={{ backgroundColor: "#55BD84" }}
                                onClick={() => processEntryMerchant("ENTREGADO")}
                            >
                                {"Ingreso total"}
                            </Button>
                        )}
                        {merchantEntry && (
                            <Button
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                type="button"
                                onClick={() => processEntryMerchant("ENTREGADO PARCIAL")}
                                startIcon={<SaveIcon color="secondary" />}
                                style={{ backgroundColor: "#55BD84" }}
                            >
                                {"Ingreso parcial"}
                            </Button>
                        )}
                    </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <div>Total</div>
                        <div>S/ {totalOrder.toFixed(2)}</div>
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <Accordion expanded={expanded === "panel0"} onChange={handleChangePanel("panel0")}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="panel0bh-content"
                            id="panel0bh-header"
                        >
                            <Typography className={classes.heading}>Informacion general</Typography>
                            <Typography className={classes.secondaryHeading}>
                                Información de la orden de compra
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className={classes.containerDetail}>
                                <div className="row-zyx">
                                    <FieldSelect
                                        loading={multiData.loading}
                                        label={"Chofer"}
                                        className="col-6"
                                        valueDefault={getValues("driverid")}
                                        onChange={(value) => setValue("driverid", value ? value.driverid : 0)}
                                        error={errors?.driverid?.message}
                                        data={dataExtra.drivers}
                                        optionDesc="driver"
                                        disabled={lock}
                                        optionValue="userid"
                                    />
                                    <FieldSelect
                                        loading={multiData.loading}
                                        label={"Almacen (Unidad)"}
                                        className="col-6"
                                        valueDefault={getValues("warehouseid")}
                                        onChange={(value) => setValue("warehouseid", value ? value.warehouseid : 0)}
                                        error={errors?.warehouseid?.message}
                                        data={dataExtra.vehicles}
                                        optionDesc="plate_number"
                                        disabled={lock}
                                        optionValue="warehouseid"
                                    />
                                </div>

                                <div className="row-zyx">
                                    <FieldEdit
                                        label={"Marca"}
                                        className="col-6"
                                        valueDefault={getValues("brand")}
                                        onChange={(value) => setValue("brand", value)}
                                        error={errors?.brand?.message}
                                    />
                                    <FieldEdit
                                        label={"N° SCOP"}
                                        className="col-6"
                                        valueDefault={getValues("scop_number")}
                                        onChange={(value) => setValue("scop_number", value)}
                                        error={errors?.scop_number?.message}
                                    />
                                </div>

                                <div className="row-zyx">
                                    <FieldEdit
                                        label={"Factura"}
                                        className="col-6"
                                        valueDefault={getValues("bill_number")}
                                        onChange={(value) => setValue("bill_number", value)}
                                        error={errors?.bill_number?.message}
                                    />
                                    <FieldSelect
                                        loading={multiData.loading}
                                        label={"Empresa"}
                                        className="col-6"
                                        valueDefault={getValues("company_name")}
                                        onChange={(value) => setValue("company_name", value ? value.domainvalue : "")}
                                        error={errors?.company_name?.message}
                                        data={dataExtra.companys}
                                        optionDesc="domaindesc"
                                        disabled={lock}
                                        optionValue="domainvalue"
                                    />
                                </div>

                                <div className="row-zyx">
                                    <FieldEdit
                                        label={"Guia"}
                                        className="col-6"
                                        valueDefault={getValues("guide_number")}
                                        onChange={(value) => setValue("guide_number", value)}
                                        error={errors?.guide_number?.message}
                                    />
                                </div>

                                {getValues("category") === "ENTREGADO" && (
                                    <div className="row-zyx">
                                        <FieldEdit
                                            label={"N° Factura"}
                                            className="col-6"
                                            valueDefault={getValues("bill_number")}
                                            onChange={(value) => setValue("bill_number", value)}
                                            error={errors?.bill_number?.message}
                                            disabled={lock}
                                        />
                                        <FieldEdit
                                            label={"Fecha de la factura"}
                                            type="date"
                                            className="col-6"
                                            disabled={lock}
                                            valueDefault={getValues("bill_entry_date")}
                                            onChange={(value) => setValue("bill_entry_date", value)}
                                            error={errors?.bill_entry_date?.message}
                                        />
                                    </div>
                                )}
                                <div className="row-zyx">
                                    <FieldEditMulti
                                        label={"Observación"}
                                        type="date"
                                        rows={3}
                                        className="col-12"
                                        disabled={lock && !merchantEntry}
                                        valueDefault={getValues("observations")}
                                        onChange={(value) => setValue("observations", value)}
                                        error={errors?.observations?.message}
                                    />
                                </div>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === "panel1"} onChange={handleChangePanel("panel1")}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography className={classes.heading}>Productos</Typography>
                            <Typography className={classes.secondaryHeading}>Elegir productos de la compra</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className={classes.containerDetail}>
                                {!lock && (
                                    <FieldSelect
                                        label={"Product"}
                                        variant="outlined"
                                        onChange={(value) => {
                                            if (value) {
                                                setProductsToShow(productsToShow.filter((x) => x.id !== value.id));
                                                productAppend({
                                                    id: value.id,
                                                    purchasedetailid: fieldsProduct.length * -1,
                                                    productid: value.productid,
                                                    product_description: value.description,
                                                    label: value.label,
                                                    price: parseFloat(value?.purchase_price || "0"),
                                                    quantity: 0,
                                                    delivered_quantity: 0,
                                                    subtotal: 0.0,
                                                    list_unit: [
                                                        {
                                                            unit: value.unit,
                                                            unit_desc: `${value.unit} (1)`,
                                                            quantity: 1,
                                                        },
                                                        ...(value.n_bottles > 0
                                                            ? [
                                                                  {
                                                                      unit: value.types_packaging,
                                                                      quantity: value.n_bottles,
                                                                      unit_desc: `${value.types_packaging} (${value.n_bottles})`,
                                                                  },
                                                              ]
                                                            : []),
                                                    ],
                                                    unit_selected: value.unit,
                                                    n_bottles: 1,
                                                });
                                            }
                                        }}
                                        data={productsToShow}
                                        optionDesc="label"
                                        optionValue="id"
                                    />
                                )}
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell></TableCell>
                                                <TableCell>Producto</TableCell>
                                                <TableCell style={{ textAlign: "right" }}>Cantidad</TableCell>
                                                {merchantEntry && (
                                                    <>
                                                        <TableCell style={{ textAlign: "right" }}>
                                                            Cantidad restante
                                                        </TableCell>
                                                        <TableCell style={{ textAlign: "right" }}>
                                                            Cantidad a entregar
                                                        </TableCell>
                                                    </>
                                                )}
                                                <TableCell style={{ textAlign: "right" }}>Precio</TableCell>
                                                <TableCell style={{ textAlign: "right" }}>Subtotal</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody style={{ marginTop: 5 }}>
                                            {fieldsProduct.map((item, i: number) => (
                                                <TableRow key={item.id}>
                                                    <TableCell width={30}>
                                                        {!lock && (
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
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>{getValues(`products.${i}.label`)}</div>
                                                    </TableCell>

                                                    {/* <TableCell width={200}>
                                                        <FieldSelect
                                                            label={""}
                                                            variant="outlined"
                                                            valueDefault={getValues(`products.${i}.unit_selected`)}
                                                            onChange={(value) => {
                                                                setValue(`products.${i}.unit_selected`, value.unit);
                                                                setValue(`products.${i}.n_bottles`, value.quantity);

                                                                const quantity = getValues(`products.${i}.quantity`);
                                                                const price = getValues(`products.${i}.price`);
                                                                // const n_bottles = getValues(`products.${i}.n_bottles`);
                                                                setValue(`products.${i}.subtotal`, price * quantity);
                                                                trigger(`products.${i}.subtotal`);
                                                            }}
                                                            disableClearable={true}
                                                            data={item.list_unit}
                                                            disabled={lock}
                                                            optionDesc="unit_desc"
                                                            optionValue="unit"
                                                        />
                                                    </TableCell> */}
                                                    {merchantEntry && (
                                                        <TableCell width={100}>
                                                            <div style={{ textAlign: "right" }}>
                                                                {getValues(`products.${i}.requested_quantity`)}
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    <TableCell width={180}>
                                                        <FieldEditArray
                                                            fregister={{
                                                                ...register(`products.${i}.quantity`, {
                                                                    validate: (value) =>
                                                                        value > 0 || "" + t(langKeys.field_required),
                                                                }),
                                                            }}
                                                            inputProps={{ min: 0, style: { textAlign: "right" } }} // the change is here
                                                            type={"number"}
                                                            valueDefault={getValues(`products.${i}.quantity`)}
                                                            disabled={lock}
                                                            error={errors?.products?.[i]?.quantity?.message}
                                                            onChange={(value) => {
                                                                setValue(`products.${i}.quantity`, value);
                                                                const price = getValues(`products.${i}.price`);
                                                                // const n_bottles = getValues(`products.${i}.n_bottles`);
                                                                setValue(`products.${i}.subtotal`, price * value);
                                                                trigger(`products.${i}.subtotal`);
                                                            }}
                                                        />
                                                    </TableCell>
                                                    {merchantEntry && (
                                                        <TableCell width={180}>
                                                            <FieldEditArray
                                                                fregister={{
                                                                    ...register(`products.${i}.delivered_quantity`, {
                                                                        validate: (value) =>
                                                                            (value >= 0 &&
                                                                                value <=
                                                                                    getValues(
                                                                                        `products.${i}.quantity`
                                                                                    )) ||
                                                                            "Debe ingresar una cantidad correcta",
                                                                    }),
                                                                }}
                                                                inputProps={{
                                                                    min: 0,
                                                                    max: getValues(`products.${i}.quantity`),
                                                                    style: { textAlign: "right" },
                                                                }} // the change is here
                                                                type={"number"}
                                                                valueDefault={getValues(
                                                                    `products.${i}.delivered_quantity`
                                                                )}
                                                                error={
                                                                    errors?.products?.[i]?.delivered_quantity?.message
                                                                }
                                                                onChange={(value) => {
                                                                    setValue(
                                                                        `products.${i}.delivered_quantity`,
                                                                        parseFloat(value || "0")
                                                                    );
                                                                }}
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell width={180}>
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
                                                            error={errors?.products?.[i]?.price?.message}
                                                            disabled={lock}
                                                            onChange={(value) => {
                                                                setValue(`products.${i}.price`, value);
                                                                const quantity = getValues(`products.${i}.quantity`);
                                                                // const n_bottles = getValues(`products.${i}.n_bottles`);
                                                                setValue(`products.${i}.subtotal`, quantity * value);
                                                                trigger(`products.${i}.subtotal`);
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell width={180}>
                                                        <div style={{ textAlign: "right" }}>
                                                            {getValues(`products.${i}.subtotal`).toFixed(2)}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                {merchantEntry && (
                                                    <>
                                                        <TableCell></TableCell>
                                                        <TableCell></TableCell>
                                                    </>
                                                )}
                                                <TableCell>Total</TableCell>
                                                <TableCell
                                                    style={{
                                                        fontWeight: "bold",
                                                        color: "black",
                                                        textAlign: "right",
                                                    }}
                                                >
                                                    {getValues("products")
                                                        .reduce((acc, x) => acc + x.subtotal, 0)
                                                        .toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </TableContainer>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === "panel2"} onChange={handleChangePanel("panel2")}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="panel2bh-content"
                            id="panel2bh-header"
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
                                                {!lock && (
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                const tt = getValues("payments").reduce(
                                                                    (acc, x) => acc + x.amount,
                                                                    0
                                                                );
                                                                paymentAppend({
                                                                    method: "EFECTIVO",
                                                                    amount: totalOrder - tt,
                                                                });
                                                            }}
                                                        >
                                                            <AddIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                )}
                                                <TableCell>Modo de pago</TableCell>
                                                <TableCell>Monto a pagar</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody style={{ marginTop: 5 }}>
                                            {fieldsPayment.map((item, i: number) => (
                                                <TableRow key={item.id}>
                                                    {!lock && (
                                                        <TableCell width={20}>
                                                            <div style={{ display: "flex" }}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        paymentRemove(i);
                                                                    }}
                                                                >
                                                                    <DeleteIcon style={{ color: "#777777" }} />
                                                                </IconButton>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    <TableCell width={200}>
                                                        <FieldSelect
                                                            label={""}
                                                            className="col-6"
                                                            valueDefault={getValues(`payments.${i}.method`)}
                                                            onChange={(value) =>
                                                                setValue(`payments.${i}.method`, value)
                                                            }
                                                            disableClearable={true}
                                                            error={errors?.payments?.[i]?.method?.message}
                                                            data={dataExtra.payMethods}
                                                            fregister={{
                                                                ...register(`payments.${i}.method`, {
                                                                    validate: (value) =>
                                                                        !!value ||
                                                                        "Debe ingresar una cantidad correcta",
                                                                }),
                                                            }}
                                                            optionDesc="description"
                                                            disabled={lock}
                                                            optionValue="value"
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
                                                            inputProps={{ min: 0, style: { textAlign: "right" } }} // the change is here
                                                            type={"number"}
                                                            valueDefault={getValues(`payments.${i}.amount`)}
                                                            disabled={lock}
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
                                            ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                {!lock && <TableCell></TableCell>}
                                                <TableCell>Total</TableCell>
                                                <TableCell
                                                    style={{
                                                        fontWeight: "bold",
                                                        color: "black",
                                                        textAlign: "right",
                                                    }}
                                                >
                                                    {getValues("payments")
                                                        .reduce((acc, x) => acc + x.amount, 0)
                                                        .toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </TableContainer>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </div>
            </form>
        </div>
    );
};

export default DetailPurcharse;
