/* eslint-disable react-hooks/exhaustive-deps */
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldEditArray, FieldEditMulti, FieldSelect, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute } from "store/main/actions";
import { insCorp, insPurchase, insPurchaseDetail } from "common/helpers";
import { Button, makeStyles, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
const arrayBread = [
    { id: "view-1", name: "Purchase" },
    { id: "view-2", name: "Purchase detail" },
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
    purchaseid: number,
    products: Dictionary[],
    supplierid: number,
    warehouseid: number,
    purchasecreatedate: string,
    purchasenumber: string,
    observations: string
}

const DetailPurcharse: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [productsToShow, setProductsToShow] = useState<Dictionary[]>([])
    const [dataExtra, setDataExtra] = useState<{
        status: Dictionary[];
        type: Dictionary[],
        products: Dictionary[],
        suppliers: Dictionary[],
        warehouses: Dictionary[],
    }>({
        status: [],
        type: [],
        products: [],
        suppliers: [],
        warehouses: [],
    });
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const { register, control, handleSubmit, setValue, getValues, formState: { errors }, trigger } = useForm<FormFields>({
        defaultValues: {
            purchaseid: row?.purchaseid || 0,
            supplierid: row?.supplierid || 0,
            warehouseid: row?.warehouseid || 0,
            purchasecreatedate: row?.purchasecreatedate || new Date(new Date().setHours(10)).toISOString().substring(0, 10),
            purchasenumber: row?.purchasenumber || "",
            observations: row?.observations || "",
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
            const dataTypes = multiData.data.find((x) => x.key === "DOMAIN-TIPOCORP");
            const products = multiData.data.find((x) => x.key === "UFN_PRODUCT_LST");
            const suppliers = multiData.data.find((x) => x.key === "UFN_SUPPLIER_LST");
            const warehouses = multiData.data.find((x) => x.key === "UFN_WAREHOUSE_LST");
            if (dataStatus && dataTypes && products && suppliers && warehouses) {
                setProductsToShow(products.data)
                setDataExtra({
                    status: dataStatus.data,
                    type: dataTypes.data,
                    products: products.data,
                    suppliers: suppliers.data,
                    warehouses: warehouses.data,
                });

                setValue('supplierid', suppliers.data?.[0]?.supplierid || 0);
                trigger("supplierid");
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
            dispatch(showBackdrop(true));
            dispatch(execute({
                header: insPurchase({
                    ...data,
                    operation: data.purchaseid ? "UPDATE" : "INSERT",
                    status: 'ACTIVO',
                    total: 0
                }),
                detail: data.products.map(x => insPurchaseDetail({
                    ...x,
                    operation: x.purchasedetailid > 0 ? (x.status === "ELIMINADO" ? "DELETE" : "UPDATE") : "INSERT",
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
    });

    React.useEffect(() => {
        register("purchaseid");
        register("supplierid", { validate: (value) => (value > 0) || "" + t(langKeys.field_required) });
        register("warehouseid", { validate: (value) => (value > 0) || "" + t(langKeys.field_required) });
        register("observations");
        register("purchasenumber");
        register("purchasecreatedate", { validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required) });
    }, [register]);


    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.description}` : "Nueva orden de compra"} />
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
                            label={"N° Orden"}
                            className="col-6"
                            valueDefault={getValues("purchasenumber")}
                            onChange={(value) => setValue("purchasenumber", value)}
                            error={errors?.purchasenumber?.message}
                            disabled={true}
                        />
                        <FieldEdit
                            label={"Fecha de la orden"}
                            type="date"
                            className="col-6"
                            valueDefault={getValues("purchasecreatedate")}
                            onChange={(value) => setValue("purchasecreatedate", value)}
                            error={errors?.purchasecreatedate?.message}
                        />
                    </div>

                    <div className="row-zyx">
                        <FieldSelect
                            loading={multiData.loading}
                            label={t(langKeys.provider)}
                            className="col-6"
                            valueDefault={getValues('supplierid')}
                            onChange={(value) => setValue('supplierid', value ? value.supplierid : 0)}
                            error={errors?.supplierid?.message}
                            data={dataExtra.suppliers}
                            optionDesc="description"
                            optionValue="supplierid"
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
                            optionValue="warehouseid"
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEditMulti
                            label={"Observación"}
                            type="date"
                            className="col-12"
                            valueDefault={getValues("observations")}
                            onChange={(value) => setValue("observations", value)}
                            error={errors?.observations?.message}
                        />
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <FieldSelect
                        label={"Product"}
                        variant='outlined'
                        onChange={(value) => {
                            if (value) {
                                setProductsToShow(productsToShow.filter(x => x.productid !== value.productid))
                                productAppend({ purchasedetailid: fieldsProduct.length * -1, productid: value.productid, product_description: value.description, price: parseFloat((value?.purchase_price || "0")), quantity: 0, subtotal: 0.0 })
                            }
                            // setValue(`products.${i}.productid`, value?.productid || 0);
                            // setValue(`products.${i}.price`, parseFloat((value?.purchase_price || "0")));
                            // trigger(`products.${i}.price`)
                        }}
                        data={productsToShow}
                        optionDesc="description"
                        optionValue="productid"
                    />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                    </TableCell>
                                    <TableCell>Producto</TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>Precio</TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>Cantidad</TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>Subtotal</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody style={{ marginTop: 5 }}>
                                {fieldsProduct.map((item, i: number) =>
                                    <TableRow key={item.id}>
                                        <TableCell width={30}>
                                            <div style={{ display: 'flex' }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => { productRemove(i) }}
                                                >
                                                    <DeleteIcon style={{ color: '#777777' }} />
                                                </IconButton>
                                            </div>
                                        </TableCell>
                                        <TableCell >
                                            <div>
                                                {getValues(`products.${i}.product_description`)}
                                            </div>
                                        </TableCell>
                                        <TableCell width={200}>
                                            <div style={{ textAlign: 'right' }}>
                                                <FieldEditArray
                                                    fregister={{
                                                        ...register(`products.${i}.quantity`),
                                                    }}
                                                    inputProps={{ min: 0, style: { textAlign: 'right' } }} // the change is here
                                                    type={"number"}
                                                    valueDefault={getValues(`products.${i}.price`)}
                                                    error={errors?.products?.[i]?.quantity?.message}
                                                    onChange={(value) => {
                                                        console.log("value", value)
                                                        setValue(`products.${i}.price`, value);
                                                        const quantity = getValues(`products.${i}.quantity`);
                                                        setValue(`products.${i}.subtotal`, quantity * value);
                                                        trigger(`products.${i}.subtotal`)
                                                    }}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell width={200}>
                                            <FieldEditArray
                                                fregister={{
                                                    ...register(`products.${i}.quantity`),
                                                }}
                                                inputProps={{ min: 0, style: { textAlign: 'right' } }} // the change is here
                                                type={"number"}
                                                valueDefault={getValues(`products.${i}.quantity`)}
                                                error={errors?.products?.[i]?.quantity?.message}
                                                onChange={(value) => {
                                                    setValue(`products.${i}.quantity`, value)
                                                    const price = getValues(`products.${i}.price`);
                                                    setValue(`products.${i}.subtotal`, price * value);
                                                    trigger(`products.${i}.subtotal`);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell width={200}>
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
            </form>
        </div>
    );
};

export default DetailPurcharse;
