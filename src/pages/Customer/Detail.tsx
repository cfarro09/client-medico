/* eslint-disable react-hooks/exhaustive-deps */
import {
    Button,
    CircularProgress,
    FormControlLabel,
    IconButton,
    makeStyles,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldSelect, AntTab, FieldUploadImage2, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute, getCollectionAux, resetMainAux } from "store/main/actions";
import { getCustomerProductsSel, insCostumer, insCustomerProduct } from "common/helpers";
import ProductModal from "./Modals/ProductModal";
import HistoryProduct from "./Modals/HistoryProductModal";
import Tabs from '@material-ui/core/Tabs';
import { Visibility } from "@material-ui/icons";
import DocumentationModal from "./Modals/DocumentationModal";

const arrayBread = [
    { id: "view-1", name: "Clients" },
    { id: "view-2", name: "Client detail" },
];

type FormValues = {
    id: number;
    description: string;
    doc_type: string;
    doc_number: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    dni_image: string;
    address: string;
    status: string;
    type: string;
    operation: string;
    products: Dictionary[];
    documentation: Dictionary[] | null;
    latitude: number;
    longitude: number;
    route: string;
    zone: string;
    glp_consignation: boolean;
    water_consignation: boolean;
    can_credit: boolean;
};

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
    simple_table: {
        cursor: "pointer",
        "&:hover": {
            background: "#F5F5F5",
        },
    },
}));

const DetailCustomer: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [waitSave, setWaitSave] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openModalHistorical, setOpenModalHistorical] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [productsToShow, setProductsToShow] = useState<Dictionary[]>([]);
    const [productsToDelete, setProductsToDelete] = useState<Dictionary[]>([]);
    const mainAux = useSelector((state) => state.main.mainAux);
    const [loading, setLoading] = useState<boolean>(false);
    const [pageSelected, setPageSelected] = useState(0);
    const [prodHistoricalSelected, setProdHistoricalSelected] = useState<Dictionary | null>(null);
    const [productSelected, setProductSelected] = useState<{
        item: Dictionary | null;
        edit: boolean;
        idx: number;
    }>({
        item: null,
        edit: false,
        idx: 0,
    });
    const [dataExtra, setDataExtra] = useState<{
        status: Dictionary[];
        type: Dictionary[];
        bonif: Dictionary[];
        tipoCliente: Dictionary[];
        ruta: Dictionary[];
    }>({
        status: [],
        type: [],
        bonif: [],
        tipoCliente: [],
        ruta: [],
    });

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataTypes = multiData.data.find((x) => x.key === "DOMAIN-TIPODOCUMENTO");
            const dataBonif = multiData.data.find((x) => x.key === "DOMAIN-TIPOBONIFICACION");
            const tipoCliente = multiData.data.find((x) => x.key === "DOMAIN-TIPOCLIENTE");
            const ruta = multiData.data.find((x) => x.key === "DOMAIN-RUTAS");
            const products = multiData.data.find((x) => x.key === "UFN_PRODUCT_LST");
            if (dataStatus && dataTypes && products && dataBonif && tipoCliente && ruta) {
                setProductsToShow(
                    products.data.reduce((acum, current) => {
                        if (current.with_container)
                            acum.push(
                                {
                                    ...current,
                                    label: "CARGA " + current.product_name,
                                    identifier: `carga-${current.productid}`,
                                    product_type: "carga",
                                },
                                {
                                    ...current,
                                    label: "ENVASE " + current.product_name,
                                    identifier: `envase-${current.productid}`,
                                    product_type: "envase",
                                }
                            );
                        else
                            acum.push({
                                ...current,
                                label: current.product_name,
                                identifier: current.productid,
                                product_type: "full",
                            });
                        return acum as Dictionary;
                    }, []) as Dictionary[]
                );
                setDataExtra({
                    status: dataStatus.data,
                    type: dataTypes.data,
                    bonif: dataBonif.data,
                    tipoCliente: tipoCliente.data,
                    ruta: ruta.data,
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
        trigger,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            id: row?.customerid || 0,
            description: row?.description || "",
            doc_type: row?.doc_type || "DNI",
            doc_number: row?.doc_number || "",
            contact_name: row?.contact_name || "",
            contact_email: row?.contact_email || "",
            contact_phone: row?.contact_phone || "",
            address: row?.address || "",
            status: row?.status || "ACTIVO",
            type: row?.type || "NINGUNO",
            operation: row ? "UPDATE" : "INSERT",
            latitude: row?.latitude || 0,
            longitude: row?.longitude || 0,
            route: row?.route || "",
            zone: row?.zone || "",
            glp_consignation: row?.glp_consignation || false,
            water_consignation: row?.water_consignation || false,
            can_credit: row?.can_credit || false,
            products: [],
        },
    });

    const [latitude, longitude] = watch(["latitude", "longitude"]);

    const {
        fields: fieldsProduct,
        append: productAppend,
        remove: productRemove,
    } = useFieldArray({
        control,
        name: "products",
    });

    React.useEffect(() => {
        register("description", {
            validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required),
        });
        register("route", {
            validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required),
        });
        register("status", { validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required) });
        register("doc_number", { validate: (value) => (value && value.length > 0) || "" + t(langKeys.field_required) });
        register("contact_phone");
        register("address");

        if (row) {
            setLoading(true);
            dispatch(getCollectionAux(getCustomerProductsSel(row?.customerid)));
        }
    }, [register]);

    useEffect(() => {
        if (!mainAux.loading && !mainAux.error) {
            if (mainAux.key === "UFN_CUSTOMER_PRODUCT_SEL") {
                setLoading(false);
                setValue(
                    "products",
                    mainAux.data.map((x) => ({
                        clientproductpriceid: x.clientproductpriceid,
                        productid: x.productid,
                        product_description: `${x.product_type.toUpperCase()} ${x.product_name}`,
                        price: parseFloat(x.price || "0"),
                        bonification_value: x.bonification_value,
                        product_type: x.product_type,
                        label: `${x.product_type.toUpperCase()} ${x.product_name}`,
                        identifier: x.identifier,
                    }))
                );
                trigger("products");
                setProductsToShow(
                    productsToShow.filter((x) => !mainAux.data.some((e) => x.identifier === e.identifier))
                );
            }
        }
        return () => {
            dispatch(resetMainAux());
        };
    }, [mainAux]);

    const processTransaction = (data: FormValues) => {
        if (data.products.filter((item) => item.status !== "ELIMINADO").length === 0) {
            dispatch(
                showSnackbar({ show: true, success: false, message: "Debe tener como minimo un producto registrado" })
            );
            return;
        }
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(
                execute(
                    {
                        header: insCostumer(data),
                        detail: [
                            ...data.products.map((x) =>
                                insCustomerProduct({
                                    ...x,
                                    id: x.clientproductpriceid,
                                    operation: x.clientproductpriceid > 0 ? "UPDATE" : "INSERT",
                                    status: "ACTIVO",
                                })
                            ),
                            ...productsToDelete.map((x) =>
                                insCustomerProduct({
                                    ...x,
                                    id: x.clientproductpriceid,
                                    operation: "DELETE",
                                    status: "ELIMINADO",
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

    const handleChange = (value: any) => {
        if (productsToDelete.some((e) => e.identifier === value.identifier)) {
            setProductsToDelete(productsToDelete.filter((x) => x.identifier !== value.identifier));
            setProductSelected({ item: { ...value, fromBD: true }, edit: false, idx: 0 });
            setOpenModal(true);
        } else {
            handleNewProduct({
                item: {
                    ...value,
                    clientproductpriceid: value?.fromBD ? value.clientproductpriceid : fieldsProduct.length * -1,
                },
            });
        }
        setProductsToShow(productsToShow.filter((x) => x.identifier !== value.identifier));
    };

    const handleNewProduct = (value: any) => {
        setProductSelected({ ...value, edit: false, idx: 0 });
        setOpenModal(true);
    };

    const handleEditProduct = (value: any) => {
        setProductSelected({ ...value, edit: true });
        setOpenModal(true);
    };

    const handleDelete = ({ item, i }: Dictionary) => {
        if (item.clientproductpriceid > 0) setProductsToDelete([...productsToDelete, item]);
        setProductsToShow([...productsToShow, item]);
        productRemove(i);
    };

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit} >
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

                <div style={{ width: '100%!important' }}>
                    <Tabs
                        value={pageSelected}
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        style={{ borderBottom: '1px solid #EBEAED', backgroundColor: '#FFF', marginTop: 8 }}
                        textColor="primary"
                        onChange={(_, value) => setPageSelected(value)}
                    >
                        <AntTab label={"Datos"} />
                        <AntTab label={"Productos"} />
                        { getValues("type") === "FORMAL" && (
                            <AntTab label={"Documentos"} />
                        ) }
                    </Tabs>
                </div>

                {pageSelected === 0 && (<>
                    <div className={classes.containerDetail}>
                        <div className="row-zyx">
                            <FieldEdit
                                label={"NOMBRE CLIENTE (*)"}
                                className="col-6"
                                valueDefault={getValues("description")}
                                onChange={(value) => setValue("description", value)}
                                error={errors?.description?.message}
                            />
                            <div className="col-6" style={{ display: 'flex', flex: 1 }}>
                                <FieldEdit
                                    label={`RUC/DNI (*)`}
                                    styleX={{ flex: 1 }}
                                    style={{ flex: 1 }}
                                    valueDefault={getValues("doc_number")}
                                    onChange={(value) => setValue("doc_number", value)}
                                    type="number"
                                    error={errors?.doc_number?.message}
                                    InputProps={{ inputProps: { min: "0", max: "99999999999" } }}
                                />
                                <FieldUploadImage2
                                    className="col-1"

                                    label="Foto de DNI"
                                    valueDefault={getValues("dni_image")}
                                    onChange={(value) => setValue("dni_image", value)}
                                />
                            </div>
                        </div>
                        <div className="row-zyx">
                            <FieldEdit
                                label={"TELEFONO"}
                                className="col-6"
                                valueDefault={getValues("contact_phone")}
                                onChange={(value) => setValue("contact_phone", value)}
                                error={errors?.contact_phone?.message}
                                type="number"
                                InputProps={{ inputProps: { min: "0", max: "999999999" } }}
                            />
                            <FieldEdit
                                label={"DIRECCION"}
                                className="col-6"
                                valueDefault={getValues("address")}
                                onChange={(value) => setValue("address", value)}
                                error={errors?.address?.message}
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldEdit
                                label={"ZONA"}
                                className="col-6"
                                valueDefault={getValues("zone")}
                                onChange={(value) => setValue("zone", value)}
                                error={errors?.zone?.message}
                            />
                            <FieldSelect
                                label={"RUTA (*)"}
                                className="col-6"
                                valueDefault={getValues("route")}
                                onChange={(value) => setValue("route", value?.domainvalue)}
                                error={errors?.route?.message}
                                data={dataExtra.ruta}
                                uset={true}
                                optionDesc="domainvalue"
                                optionValue="domainvalue"
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldSelect
                                label={"TIPO CLIENTE"}
                                className="col-6"
                                valueDefault={getValues("type")}
                                onChange={(value) => {
                                    setValue("type", value?.domainvalue ?? "")
                                    trigger("type")
                                }}
                                error={errors?.type?.message}
                                data={dataExtra.tipoCliente}
                                uset={true}
                                optionDesc="domainvalue"
                                optionValue="domainvalue"
                            />
                            <FieldSelect
                                label={"CONDICION"}
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
                            <FieldEdit
                                label={"LATITUD"}
                                className="col-2"
                                type="number"
                                valueDefault={getValues("latitude")}
                                onChange={(value) => setValue("latitude", value)}
                                error={errors?.latitude?.message}
                            />
                            <FieldEdit
                                label={"LONGITUD"}
                                className="col-2"
                                type="number"
                                valueDefault={getValues("longitude")}
                                onChange={(value) => setValue("longitude", value)}
                                error={errors?.longitude?.message}
                            />
                            <div className="col-2" style={{ display: "flex", alignItems: "center" }}>
                                {latitude !== 0 && longitude !== 0 && (
                                    <span>
                                        <a
                                            target={"_blank"}
                                            href={`http://www.google.com/maps/place/${getValues("latitude")},${getValues(
                                                "longitude"
                                            )}`}
                                            rel="noreferrer"
                                        >
                                            Geoposicion
                                        </a>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </>)}
                {pageSelected === 1 && (<>
                    {loading && (
                        <div style={{ textAlign: "center", marginTop: "20px" }}>
                            <CircularProgress />
                        </div>
                    )}
                    {!loading && (
                        <div className={classes.containerDetail}>
                            <FieldSelect
                                label={"Product"}
                                variant="outlined"
                                optionDesc="label"
                                optionValue="productid"
                                data={productsToShow}
                                onChange={(value) => {
                                    handleChange(value);
                                }}
                            />
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell>Producto</TableCell>
                                            <TableCell style={{}}>Precio Unitario</TableCell>
                                            <TableCell style={{}}>Precio Facturacion</TableCell>
                                            <TableCell style={{}}>Precio POV</TableCell>
                                            <TableCell style={{}}>Fecha Actualizacion</TableCell>
                                            <TableCell style={{}}>Bonificacion</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody style={{ marginTop: 5 }}>
                                        {fieldsProduct.map((item, i: number) => (
                                            <TableRow key={item.id} className={classes.simple_table}>
                                                <TableCell>
                                                    <div style={{ display: "flex" }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                handleDelete({ item, i });
                                                            }}
                                                        >
                                                            <DeleteIcon style={{ color: "#777777" }} />
                                                        </IconButton>
                                                    </div>
                                                </TableCell>
                                                <TableCell onClick={() => handleEditProduct({ item, idx: i })}>
                                                    <div>{getValues(`products.${i}.product_description`)}</div>
                                                </TableCell>
                                                <TableCell onClick={() => handleEditProduct({ item, idx: i })}>
                                                    <div>S/. {getValues(`products.${i}.price`)}</div>
                                                </TableCell>
                                                <TableCell onClick={() => handleEditProduct({ item, idx: i })}>
                                                    <div>S/. {getValues(`products.${i}.price`)}</div>
                                                </TableCell>
                                                <TableCell onClick={() => handleEditProduct({ item, idx: i })}>
                                                    <div>S/. {getValues(`products.${i}.price`)}</div>
                                                </TableCell>
                                                <TableCell onClick={() => handleEditProduct({ item, idx: i })}>
                                                    <div>2023-01-01</div>
                                                </TableCell>
                                                <TableCell onClick={() => handleEditProduct({ item, idx: i })}>
                                                    <div>S/. {getValues(`products.${i}.bonification_value`)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setProdHistoricalSelected(item);
                                                            setOpenModalHistorical(true)
                                                        }}
                                                    >
                                                        <Visibility style={{ color: "#777777" }} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}
                </>)}
                {pageSelected === 2 && (
                    <DocumentationModal 
                        documentationData={[]}
                    />
                )}
            </form>
            <ProductModal
                parentData={productSelected}
                openModal={openModal}
                setOpenModal={setOpenModal}
                parentSetValue={setValue}
                parentAppendValue={productAppend}
                setProductsToShow={setProductsToShow}
                productsToShow={productsToShow}
            />
            <HistoryProduct
                parentData={prodHistoricalSelected}
                openModal={openModalHistorical}
                setOpenModal={setOpenModalHistorical}
            />
        </div>
    );
};

export default DetailCustomer;
