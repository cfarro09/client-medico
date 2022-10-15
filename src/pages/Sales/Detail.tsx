/* eslint-disable react-hooks/exhaustive-deps */
import { DetailModule, Dictionary } from "@types";
import { AntTab, FieldEdit, FieldEditArray, FieldEditMulti, FieldSelect, TemplateBreadcrumbs, TitleDetail } from "components";
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
import { getDetailSale, insOrderSale, insSaleDetail } from "common/helpers";
import { Button, makeStyles, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import Tabs from '@material-ui/core/Tabs';

const arrayBread = [
    { id: "view-1", name: "Sale" },
    { id: "view-2", name: "Sale detail" },
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
    title: {
        fontSize: '22px',
        color: theme.palette.text.primary,
    }
}));

type FormFields = {
    saleorderid: number,
    products: Dictionary[],
    customerid: number,
    warehouseid: number,
    bill_number: string,
    observations: string,
    document_type: string,
    document_number: string,
    status: string,
    bill_entry_date: string,
}

const DetailPurcharse: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const mainAux = useSelector((state) => state.main.mainAux);
    const [productsToShow, setProductsToShow] = useState<Dictionary[]>([])
    const [pageSelected, setPageSelected] = useState(0)
    const [lock, setLock] = useState(false)
    const [dataExtra, setDataExtra] = useState<{
        status: Dictionary[];
        products: Dictionary[],
        customers: Dictionary[],
        warehouses: Dictionary[],
        docType: Dictionary[],
    }>({
        status: [],
        products: [],
        customers: [],
        warehouses: [],
        docType: [],
    });
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const { register, control, handleSubmit, setValue, getValues, formState: { errors }, trigger } = useForm<FormFields>({
        defaultValues: {
            saleorderid: row?.saleorderid || 0,
            customerid: row?.customerid || 0,
            warehouseid: row?.warehouseid || 0,
            bill_number: row?.bill_number || "",
            observations: row?.observations || "",
            document_type: row?.document_type || "",
            document_number: row?.document_number || "",
            status: row?.status || "PENDIENTE",
            bill_entry_date: row?.bill_entry_date || new Date(new Date().setHours(10)).toISOString().substring(0, 10),
            products: []
        },
    });
    const { fields: fieldsProduct, append: productAppend, remove: productRemove } = useFieldArray({
        control,
        name: 'products',
    });

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const products = multiData.data.find((x) => x.key === "UFN_AVAILABLE_STOCK_SEL");
            const warehouses = multiData.data.find((x) => x.key === "UFN_WAREHOUSE_LST");
            const customers = multiData.data.find((x) => x.key === "UFN_CUSTOMER_LST");
            const docType = multiData.data.find(x => x.key === "DOMAIN-TIPOCOMPROBANTE");

            if (dataStatus && customers && products && warehouses && docType) {
                setProductsToShow(products.data)
                setDataExtra({
                    status: dataStatus.data,
                    products: products.data,
                    warehouses: warehouses.data,
                    customers: customers.data,
                    docType: docType.data,
                });

                // setValue('customerid', suppliers.data?.[0]?.customerid || 0);
                // trigger("customerid");
                setValue('warehouseid', warehouses.data?.[0]?.warehouseid || 0);
                trigger("warehouseid");
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


    const onSubmit = handleSubmit((data) => {
        if (data.products.filter(item => item.status !== "ELIMINADO").length === 0) {
            dispatch(showSnackbar({ show: true, success: false, message: "Debe tener como minimo un producto registrado" }));
            return
        }
        const callback = () => {
            const total = data.products.filter(item => item.status !== "ELIMINADO").reduce((acc, item) => acc + item.subtotal, 0)
            dispatch(showBackdrop(true));
            dispatch(execute({
                header: insOrderSale({
                    ...data,
                    operation: data.saleorderid ? "UPDATE" : "INSERT",
                    status: "ACTIVO",
                    total
                }),
                detail: data.products.map(x => insSaleDetail({
                    ...x,
                    operation: x.saleorderdetailid > 0 ? (x.status === "ELIMINADO" ? "DELETE" : "UPDATE") : "INSERT",
                    status: 'ACTIVO',
                    quantity: x.n_bottles * x.quantity
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
    });

    useEffect(() => {
        if (!mainAux.loading && !mainAux.error) {
            if (mainAux.key === "UFN_SALE_ORDER_DETAIL_SEL") {
                setValue("products", mainAux.data.map(x => ({
                    saleorderdetailid: x.purchaseorderdetailid,
                    productid: x.productid,
                    quantity: x.quantity,
                    product_description: x.product_name,
                    price: parseFloat((x.price || "0")),
                    subtotal: parseFloat((x.total || "0")),
                    list_unit: [
                        { unit: x.unit, unit_desc: `${x.unit} (1)`, quantity: 1 },
                        ...(x.n_bottles > 0 ? [{ unit: x.types_packaging, quantity: x.n_bottles, unit_desc: `${x.types_packaging} (${x.n_bottles})` }] : [])
                    ],
                    unit_selected: x.unit,
                    n_bottles: 1
                })));
                trigger("products")
            }
        }
        return () => {
            dispatch(resetMainAux())
        }
    }, [mainAux])

    React.useEffect(() => {
        register("saleorderid");
        register("customerid", { validate: (value) => (value > 0) || "" + t(langKeys.field_required) });
        register("warehouseid", { validate: (value) => (value > 0) || "" + t(langKeys.field_required) });
        register("document_type", { validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required) });
        register("document_number", { validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required) });
        register("observations");
        register("bill_number");
        register("bill_entry_date", { validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required) });

        if (row?.saleorderid) {
            setLock(true)
            dispatch(getCollectionAux(getDetailSale(row?.saleorderid)))
        }
    }, [register]);

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.bill_number}` : "Nueva venta"} />
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
                    </div>
                </div>
                <Tabs
                    value={pageSelected}
                    indicatorColor="primary"
                    variant="fullWidth"
                    style={{ borderBottom: '1px solid #EBEAED', backgroundColor: '#FFF', marginTop: 8 }}
                    textColor="primary"
                    onChange={(_, value) => setPageSelected(value)}
                >
                    <AntTab label={"Informacion"} />
                    <AntTab label="Productos" />
                </Tabs>

                {pageSelected === 0 && (
                    <div className={classes.containerDetail}>
                        <div className="row-zyx">
                            <FieldEdit
                                label={"N° Orden de venta"}
                                className="col-6"
                                valueDefault={getValues("bill_number")}
                                onChange={(value) => setValue("bill_number", value)}
                                error={errors?.bill_number?.message}
                                disabled={true}
                            />
                            <FieldEdit
                                label={"Fecha de la orden de venta"}
                                type="date"
                                className="col-6"
                                valueDefault={getValues("bill_entry_date")}
                                onChange={(value) => setValue("bill_entry_date", value)}
                                error={errors?.bill_entry_date?.message}
                                disabled={lock}
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldSelect
                                loading={multiData.loading}
                                label={"Tipo comprobante"}
                                className="col-6"
                                valueDefault={getValues('document_type')}
                                onChange={(value) => setValue('document_type', value?.domainvalue || "")}
                                error={errors?.document_type?.message}
                                data={dataExtra.docType}
                                disabled={lock}
                                optionDesc="domaindesc"
                                optionValue="domainvalue"
                            />
                            <FieldEdit
                                label={"N° comprobante"}
                                className="col-6"
                                valueDefault={getValues("document_number")}
                                onChange={(value) => setValue("document_number", value)}
                                error={errors?.document_number?.message}
                                disabled={lock}
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldSelect
                                loading={multiData.loading}
                                label={t(langKeys.customer)}
                                className="col-6"
                                valueDefault={getValues('customerid')}
                                onChange={(value) => setValue('customerid', value ? value.customerid : 0)}
                                error={errors?.customerid?.message}
                                data={dataExtra.customers}
                                optionDesc="description"
                                disabled={lock}
                                optionValue="customerid"
                            />
                            <FieldSelect
                                loading={multiData.loading}
                                label={"Almacen"}
                                className="col-6"
                                valueDefault={getValues('warehouseid')}
                                onChange={(value) => setValue('warehouseid', value ? value.warehouseid : 0)}
                                error={errors?.warehouseid?.message}
                                data={dataExtra.warehouses}
                                optionDesc="description"
                                disabled={lock}
                                optionValue="warehouseid"
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldEditMulti
                                label={"Observación"}
                                type="date"
                                rows={3}
                                className="col-12"
                                disabled={lock}
                                valueDefault={getValues("observations")}
                                onChange={(value) => setValue("observations", value)}
                                error={errors?.observations?.message}
                            />
                        </div>
                    </div>
                )}
                {pageSelected === 1 && (
                    <div className={classes.containerDetail}>
                        {!lock && (
                            <FieldSelect
                                label={"Product"}
                                variant='outlined'
                                onChange={(value) => {
                                    if (value) {
                                        setProductsToShow(productsToShow.filter(x => x.productid !== value.productid))
                                        productAppend({
                                            saleorderdetailid: fieldsProduct.length * -1,
                                            productid: value.productid,
                                            stockid: value.stockid,
                                            product_description: value.description,
                                            price: parseFloat((value?.price_1 || "0")),
                                            quantity: 0,
                                            stock: value.quantity,
                                            subtotal: 0.0,
                                            list_unit: [
                                                { unit: value.unit, unit_desc: `${value.unit} (1)`, quantity: 1 },
                                                ...(value.n_bottles > 0 ? [{ unit: value.types_packaging, quantity: value.n_bottles, unit_desc: `${value.types_packaging} (${value.n_bottles})` }] : [])
                                            ],
                                            unit_selected: value.unit,
                                            n_bottles: 1,
                                        })
                                    }
                                }}
                                data={productsToShow}
                                optionDesc="description"
                                optionValue="productid"
                            />
                        )}
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                        </TableCell>
                                        <TableCell>Producto</TableCell>
                                        <TableCell style={{}}>Unidad</TableCell>
                                        <TableCell style={{}}>Cantidad</TableCell>
                                        <TableCell style={{}}>Precio</TableCell>
                                        <TableCell style={{}}>Subtotal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody style={{ marginTop: 5 }}>
                                    {fieldsProduct.map((item, i: number) =>
                                        <TableRow key={item.id}>
                                            <TableCell width={20}>
                                                {!lock && (
                                                    <div style={{ display: 'flex' }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => { productRemove(i) }}
                                                        >
                                                            <DeleteIcon style={{ color: '#777777' }} />
                                                        </IconButton>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell >
                                                <div>
                                                    {getValues(`products.${i}.product_description`)}
                                                </div>
                                            </TableCell>
                                            <TableCell width={200}>
                                                <FieldSelect
                                                    label={""}
                                                    variant='outlined'
                                                    valueDefault={getValues(`products.${i}.unit_selected`)}
                                                    onChange={(value) => {
                                                        setValue(`products.${i}.unit_selected`, value.unit)
                                                        setValue(`products.${i}.n_bottles`, value.quantity)

                                                        const quantity = getValues(`products.${i}.quantity`);
                                                        const price = getValues(`products.${i}.price`);
                                                        const n_bottles = getValues(`products.${i}.n_bottles`);
                                                        setValue(`products.${i}.subtotal`, price * quantity * n_bottles);
                                                        trigger(`products.${i}.subtotal`);
                                                    }}
                                                    disableClearable={true}
                                                    data={item.list_unit}
                                                    disabled={lock}
                                                    optionDesc="unit_desc"
                                                    optionValue="unit"
                                                />
                                            </TableCell>
                                            <TableCell width={180}>
                                                <FieldEditArray
                                                    fregister={{
                                                        ...register(`products.${i}.quantity`, { validate: (value) => (value >= 0 && value <= getValues(`products.${i}.stock`)) || "Debe ingresar una cantidad correcta" }),
                                                    }}
                                                    inputProps={{ min: 0, style: { textAlign: 'right' } }} // the change is here
                                                    type={"number"}
                                                    valueDefault={getValues(`products.${i}.quantity`)}
                                                    disabled={lock}
                                                    error={errors?.products?.[i]?.quantity?.message}
                                                    onChange={(value) => {
                                                        setValue(`products.${i}.quantity`, value)
                                                        const price = getValues(`products.${i}.price`);
                                                        const n_bottles = getValues(`products.${i}.n_bottles`);
                                                        setValue(`products.${i}.subtotal`, price * value * n_bottles);
                                                        trigger(`products.${i}.subtotal`);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell width={180}>
                                                <FieldEditArray
                                                    fregister={{
                                                        ...register(`products.${i}.price`),
                                                    }}
                                                    inputProps={{ min: 0, style: { textAlign: 'right' } }} // the change is here
                                                    type={"number"}
                                                    valueDefault={getValues(`products.${i}.price`)}
                                                    error={errors?.products?.[i]?.price?.message}
                                                    disabled={lock}
                                                    onChange={(value) => {
                                                        console.log("value", value)
                                                        setValue(`products.${i}.price`, value);
                                                        const quantity = getValues(`products.${i}.quantity`);
                                                        const n_bottles = getValues(`products.${i}.n_bottles`);
                                                        setValue(`products.${i}.subtotal`, quantity * value * n_bottles);
                                                        trigger(`products.${i}.subtotal`)
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell width={100}>
                                                <div style={{ textAlign: 'right' }}>
                                                    {getValues(`products.${i}.subtotal`).toFixed(2)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell style={{
                                            fontWeight: "bold",
                                            color: "black",
                                            textAlign: "right",
                                        }}>
                                            {getValues("products").reduce((acc, x) => acc + x.subtotal, 0).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    </div>
                )}

            </form>
        </div>
    );
};

export default DetailPurcharse;