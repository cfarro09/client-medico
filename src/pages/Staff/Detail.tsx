/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Checkbox, CircularProgress, FormControlLabel, makeStyles, Switch, Typography } from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute, getCollectionAux, resetMainAux } from "store/main/actions";
import { getUserComissionProduct, insStaff } from "common/helpers";
import ModalPassword from "./Modal/ModalPassword";
import LockOpenIcon from "@material-ui/icons/LockOpen";

const charges = [
    { value: "CHOFER", id: 3 },
    { value: "MOTORIZADO", id: 4 },
    { value: "AYUDANTE", id: 5 },
];
const arrayBread = [
    { id: "view-1", name: "Staff" },
    { id: "view-2", name: "Staff detail" },
];

const useStyles = makeStyles((theme) => ({
    containerDetail: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        background: "#fff",
    },
    containerDetail2: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        background: "#fff",
        width: "50%",
        boxShadow: "0 3px 9px 1px rgb(51,48,69,.03), 0 9px 8px rgb(51,48,60,.02), 0 1px 6px 4px rgb(51,48,60,.01)",
        borderRadius: "6px",
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: "14px",
        textTransform: "initial",
    },
    input: {
        "&  input": {
            padding: "12px",
        },
    },
}));
interface StaffValues {
    id: number;
    operation: string;
    full_name: string;
    password: string;
    usr: string;
    email: string;
    doc_type: string;
    doc_number: string;
    address: string;
    status: string;
    roleid: number;
    staff_type: string;
    comision: boolean;
    comision_amount: number;
    paidperday: number;
    dayswithoutwork: number;
    salary: number;
    salary_amount: number;
    travel: boolean;
    travel_amount: number;
    payment_type: Dictionary;
    products: Dictionary[];
    select_route: boolean;
}

const DetailDriver: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const mainAux = useSelector((state) => state.main.mainAux);
    const multiData = useSelector((state) => state.main.multiData);
    const [dataExtra, setDataExtra] = useState<{
        status: Dictionary[];
        type: Dictionary[];
        tipopago: Dictionary[];
        tipopersonal: Dictionary[];
        roles: Dictionary[];
    }>({
        status: [],
        type: [],
        tipopago: [],
        tipopersonal: [],
        roles: []
    });
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [openDialogPassword, setOpenDialogPassword] = useState(false);
    const [loading, setLoading] = useState<Boolean>(true);

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataTypes = multiData.data.find((x) => x.key === "DOMAIN-TIPODOCUMENTO");
            const tipopago = multiData.data.find((x) => x.key === "DOMAIN-TIPOPAGOPERSONAL");
            const tipopersonal = multiData.data.find((x) => x.key === "DOMAIN-TIPOTRABAJADOR");
            const roles = multiData.data.find((x) => x.key === 'UFN_ROLE_PUBLIC_LST');
            if (dataStatus && dataTypes && tipopago && tipopersonal && roles) {
                setDataExtra({
                    status: dataStatus.data,
                    type: dataTypes.data,
                    tipopago: tipopago.data,
                    tipopersonal: tipopersonal.data,
                    roles: roles.data
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
        control,
        watch,
        trigger,
        formState: { errors },
    } = useForm<StaffValues>({
        defaultValues: {
            id: row?.userid || 0,
            operation: row ? "UPDATE" : "INSERT",
            full_name: row?.full_name || "",
            password: row?.password || "",
            paidperday: row?.paidperday ?? 0, 
            dayswithoutwork: row?.dayswithoutwork ?? 0, 
            salary: row?.salary ?? 0,
            usr: row?.usr || "",
            email: row?.email || "",
            doc_type: row?.doc_type || "DNI",
            doc_number: row?.doc_number || "",
            address: row?.address || "",
            status: row?.status || "ACTIVO",
            roleid: row?.roleid || 0,
            staff_type: row?.staff_type || "",
            select_routes: row?.route_selected || false,
            payment_type: {
                salary_amount: row?.payment_type?.salary_amount || 0,
                travel_amount: row?.payment_type?.travel_amount || 0,
                comision_amount: row?.payment_type?.comision_amount || 0,
                labor_cost_amount: row?.payment_type?.labor_cost_amount || 0,
                per_day_amount: row?.payment_type?.per_day_amount || 0,
                salary: row?.payment_type?.salary_amount ? true : false,
                travel: row?.payment_type?.travel_amount ? true : false,
                comision: row?.payment_type?.comision_amount ? true : false,
                labor_cost: row?.payment_type?.labor_cost_amount ? true : false,
                per_day: row?.payment_type?.per_day_amount ? true : false,
            },
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

    const [staff_type, role_watch, salary, comision, travel, labor_cost, per_day] = watch([
        "staff_type",
        "roleid",
        "payment_type.salary",
        "payment_type.comision",
        "payment_type.travel",
        "payment_type.labor_cost",
        "payment_type.per_day",
    ]);

    const onSubmit = handleSubmit((data) => {
        debugger
        if (data.staff_type === "FIJO") {
            if (
                data.payment_type.salary_amount +
                data.payment_type.travel_amount +
                data.payment_type.comision_amount ===
                0
            ) {
                dispatch(showSnackbar({ show: true, success: false, message: "Debe asignar algun tipo de pago" }));
                return;
            }
            if (comision && data.payment_type.comision_amount === 0) {
                dispatch(showSnackbar({ show: true, success: false, message: "Debe asignar algun tipo de comnision" }));
                return;
            }
            data.payment_type.labor_cost_amount = data.payment_type.per_day_amount = 0;
        }

        if (data.staff_type === "TEMPORAL") {
            if (data.payment_type.labor_cost_amount + data.payment_type.per_day_amount === 0) {
                dispatch(showSnackbar({ show: true, success: false, message: "Debe asignar algun tipo de pago" }));
                return;
            }
            data.payment_type.salary_amount = data.payment_type.travel_amount = data.payment_type.comision_amount = 0;
        }

        let productos = JSON.stringify(data.products);
        if (!row && !data.password && role_watch !== 5) {
            dispatch(showSnackbar({ show: true, success: false, message: t(langKeys.password_required) }));
            return;
        }

        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(
                execute(
                    insStaff({
                        ...data,
                        pwd: data.password,
                        roleid: role_watch,
                        products: productos,
                        commission: data.payment_type.comision,
                    })
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
    });

    React.useEffect(() => {
        register("id");
        register("password");
        register("status", { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register("full_name", { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register("usr", {
            validate: (value) => (value && !!value.length) || role_watch === 5 || "" + t(langKeys.field_required),
        });
        register("doc_type", { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register("doc_number", { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register("roleid", { validate: (value) => (value && value > 0) || "" + t(langKeys.field_required) });
        register("email");
        register("address");
        dispatch(getCollectionAux(getUserComissionProduct(row?.userid || 0)));
    }, [register, role_watch]);

    useEffect(() => {
        if (!mainAux.loading && !mainAux.error) {
            if (mainAux.key === "UFN_USER_COMMISSION_PRODUCT_LS") {
                setLoading(false);
                setValue(
                    "products",
                    mainAux.data.map((x) => ({
                        productid: x.productid,
                        product_name: x.product_name,
                        purchase_price: x.purchase_price,
                        category: x.categroy,
                        commission_type: x.commission_type,
                        description: x.description,
                        userproductcommissionid: x.userproductcommissionid || 0,
                        userid: x.userid || 0,
                        amount: parseFloat(x.amount || "0"),
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
        if (!salary) {
            setValue("payment_type.salary_amount", 0);
            trigger("payment_type.salary_amount");
        }
    }, [salary]);

    React.useEffect(() => {
        if (!comision) {
            setValue("payment_type.comision_amount", 0);
            trigger("payment_type.comision_amount");
            return;
        }
    }, [comision]);

    React.useEffect(() => {
        if (!travel) {
            setValue("payment_type.travel_amount", 0);
            trigger("payment_type.travel_amount");
        }
    }, [travel]);

    React.useEffect(() => {
        if (!labor_cost) {
            setValue("payment_type.labor_cost_amount", 0);
            trigger("payment_type.labor_cost_amount");
        }
    }, [labor_cost]);

    React.useEffect(() => {
        if (!per_day) {
            setValue("payment_type.per_day_amount", 0);
            trigger("payment_type.per_day_amount");
        }
    }, [per_day]);

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.full_name}` : "Nuevo Personal"} />
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
                        <>
                            {role_watch !== 5 && role_watch !== 0 && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="button"
                                    startIcon={<LockOpenIcon color="secondary" />}
                                    onClick={() => setOpenDialogPassword(true)}
                                >
                                    {t(row ? langKeys.changePassword : langKeys.setpassword)}
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                startIcon={<SaveIcon color="secondary" />}
                                style={{ backgroundColor: "#55BD84" }}
                            >
                                {t(langKeys.save)}
                            </Button>
                        </>
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <div className="row-zyx">
                        <FieldSelect
                            label={"Cargo (*)"}
                            className="col-4"
                            loading={multiData.loading}
                            valueDefault={getValues("roleid")}
                            onChange={(value) => setValue("roleid", value ? value.roleid : 0)}
                            error={errors?.roleid?.message}
                            data={dataExtra.roles}
                            optionDesc="description"
                            optionValue="roleid"
                        />
                        <FieldEdit
                            className="col-4"
                            label={"Nombre Completo (*)"}
                            valueDefault={getValues("full_name")}
                            onChange={(value) => setValue("full_name", value)}
                            error={errors?.full_name?.message}
                        />
                        <FieldEdit
                            className="col-4"
                            label={"Usuario (*)"}
                            disabled={role_watch === 5 || role_watch === 0}
                            valueDefault={getValues("usr")}
                            onChange={(value) => setValue("usr", value)}
                            error={errors?.usr?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={"DNI/RUC (*)"}
                            className="col-4"
                            valueDefault={getValues("doc_number")}
                            onChange={(value) => setValue("doc_number", value)}
                            error={errors?.doc_number?.message}
                        />
                        <FieldEdit
                            label={t(langKeys.email)}
                            className="col-4"
                            valueDefault={getValues("email")}
                            onChange={(value) => setValue("email", value)}
                            error={errors?.email?.message}
                        />
                        <FieldEdit
                            label={t(langKeys.address)}
                            className="col-4"
                            valueDefault={getValues("address")}
                            onChange={(value) => setValue("address", value)}
                            error={errors?.address?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            label={t(langKeys.status)}
                            className="col-4"
                            loading={multiData.loading}
                            valueDefault={getValues("status")}
                            onChange={(value) => setValue("status", value ? value.domainvalue : "")}
                            error={errors?.status?.message}
                            data={dataExtra.status}
                            optionDesc="domaindesc"
                            optionValue="domainvalue"
                        />
                        <FieldSelect
                            label={"Tipo Peronsal"}
                            className="col-4"
                            loading={multiData.loading}
                            valueDefault={getValues("staff_type")}
                            onChange={(value) => {
                                setValue("staff_type", value ? value.domainvalue : "");
                                trigger("staff_type");
                            }}
                            error={errors?.staff_type?.message}
                            data={dataExtra.tipopersonal}
                            optionDesc="domaindesc"
                            optionValue="domainvalue"
                        />
                        <div className="col-4">
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={getValues("select_route")}
                                        onChange={(event) => {
                                            setValue("select_route", event.target.checked);
                                            trigger("select_route");
                                        }}
                                        name="checkedB"
                                        color="primary"
                                    />
                                }
                                label="Consignación GLP?"
                            />
                        </div>
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={"Pago por dia"}
                            type="number"
                            className="col-4"
                            valueDefault={getValues("paidperday")}
                            onChange={(value) => setValue("paidperday", parseFloat(value ?? "0"))}
                            error={errors?.doc_number?.message}
                        />
                        <FieldEdit
                            label={"Días sin trabajar"}
                            type="number"
                            className="col-4"
                            valueDefault={getValues("dayswithoutwork")}
                            onChange={(value) => setValue("dayswithoutwork", parseInt(value ?? "0"))}
                            error={errors?.doc_number?.message}
                        />
                        <FieldEdit
                            label={"Salario"}
                            type="number"
                            className="col-4"
                            valueDefault={getValues("salary")}
                            onChange={(value) => setValue("salary", parseFloat(value ?? "0"))}
                            error={errors?.doc_number?.message}
                        />
                    </div>
                </div>
                {loading && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <CircularProgress />
                    </div>
                )}
                {!loading && staff_type && (
                    <div className="row-zyx">
                        <div className={classes.containerDetail2}>
                            <Typography component="div" variant="h5">
                                Forma de pago
                            </Typography>
                            <br />
                            {staff_type === "FIJO" && (
                                <div className="fijo">
                                    <div className="row-zyx" style={{ alignItems: "center", margin: "0 40px" }}>
                                        <div className="col-4">
                                            <label>SUELDO</label>
                                        </div>
                                        <div className="col-6">
                                            <FieldEdit
                                                label={""}
                                                type="number"
                                                className={classes.input}
                                                disabled={!salary}
                                                valueDefault={getValues("payment_type.salary_amount")}
                                                onChange={(value) => setValue("payment_type.salary_amount", value)}
                                                error={errors?.payment_type?.salary_amount?.message}
                                                variant="outlined"
                                            />
                                        </div>
                                        <div className="col-2">
                                            <Controller
                                                name="salary"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        checked={getValues("payment_type.salary")}
                                                        onChange={(value) =>
                                                            setValue("payment_type.salary", value.target.checked)
                                                        }
                                                        color="primary"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="row-zyx" style={{ alignItems: "center", margin: "0 40px" }}>
                                        <div className="col-4">
                                            <label>VATICOS</label>
                                        </div>
                                        <div className="col-6">
                                            <FieldEdit
                                                label={""}
                                                type="number"
                                                className={classes.input}
                                                disabled={!travel}
                                                valueDefault={getValues("payment_type.travel_amount")}
                                                onChange={(value) => setValue("payment_type.travel_amount", value)}
                                                error={errors?.payment_type?.travel_amount?.message}
                                                variant="outlined"
                                            />
                                        </div>
                                        <div className="col-2">
                                            <Controller
                                                name="travel"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        checked={getValues("payment_type.travel")}
                                                        onChange={(value) =>
                                                            setValue("payment_type.travel", value.target.checked)
                                                        }
                                                        color="primary"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="row-zyx" style={{ alignItems: "center", margin: "0 40px" }}>
                                        <div className="col-4">
                                            <label>COMISION</label>
                                        </div>
                                        <div className="col-6">
                                            <FieldEdit
                                                label={""}
                                                type="number"
                                                disabled={true}
                                                className={classes.input}
                                                valueDefault={getValues("payment_type.comision_amount")}
                                                onChange={(value) => setValue("payment_type.comision_amount", value)}
                                                error={errors?.payment_type?.comision_amount?.message}
                                                variant="outlined"
                                            />
                                        </div>
                                        <div className="col-2">
                                            <Controller
                                                name="comision"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        checked={getValues("payment_type.comision")}
                                                        onChange={(value) =>
                                                            setValue("payment_type.comision", value.target.checked)
                                                        }
                                                        color="primary"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {staff_type !== "FIJO" && (
                                <div className="temporal">
                                    <div className="row-zyx" style={{ alignItems: "center", margin: "0 40px" }}>
                                        <div className="col-4">
                                            <label>COSTO TRABAJO</label>
                                        </div>
                                        <div className="col-6">
                                            <FieldEdit
                                                label={""}
                                                type="number"
                                                className={classes.input}
                                                disabled={!labor_cost}
                                                valueDefault={getValues("payment_type.labor_cost_amount")}
                                                onChange={(value) => setValue("payment_type.labor_cost_amount", value)}
                                                error={errors?.payment_type?.labor_cost_amount?.message}
                                                variant="outlined"
                                            />
                                        </div>
                                        <div className="col-2">
                                            <Controller
                                                name="salary"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        checked={getValues("payment_type.labor_cost")}
                                                        onChange={(value) =>
                                                            setValue("payment_type.labor_cost", value.target.checked)
                                                        }
                                                        color="primary"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="row-zyx" style={{ alignItems: "center", margin: "0 40px" }}>
                                        <div className="col-4">
                                            <label>VIATICOS POR DIA</label>
                                        </div>
                                        <div className="col-6">
                                            <FieldEdit
                                                label={""}
                                                type="number"
                                                className={classes.input}
                                                disabled={!per_day}
                                                valueDefault={getValues("payment_type.per_day_amount")}
                                                onChange={(value) => setValue("payment_type.per_day_amount", value)}
                                                error={errors?.payment_type?.per_day_amount?.message}
                                                variant="outlined"
                                            />
                                        </div>
                                        <div className="col-2">
                                            <Controller
                                                name="travel"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        checked={getValues("payment_type.per_day")}
                                                        onChange={(value) =>
                                                            setValue("payment_type.per_day", value.target.checked)
                                                        }
                                                        color="primary"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {comision && role_watch === 3 && staff_type === "FIJO" && (
                            <div className={classes.containerDetail2}>
                                <Typography component="div" variant="h5">
                                    Comisiones
                                </Typography>
                                <br />
                                {fieldsProduct.map((item, i: number) => (
                                    <div className="row-zyx" style={{ alignItems: "center", margin: "0 40px" }} key={i}>
                                        <div className="col-4">
                                            <label>{getValues(`products.${i}.description`)}</label>
                                        </div>
                                        <div className="col-6">
                                            <FieldEdit
                                                label={""}
                                                type="number"
                                                className={classes.input}
                                                valueDefault={getValues(`products.${i}.amount`)}
                                                onChange={(value) => {
                                                    setValue(`products.${i}.amount`, value);
                                                    let sumComision = getValues("products").reduce(
                                                        (acc, act) => acc + parseFloat(act.amount),
                                                        0
                                                    );
                                                    setValue("payment_type.comision_amount", sumComision);
                                                    trigger("payment_type.comision_amount");
                                                }}
                                                error={errors?.products?.[i]?.amount?.message}
                                                variant="outlined"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </form>
            <ModalPassword
                openModal={openDialogPassword}
                setOpenModal={setOpenDialogPassword}
                data={row}
                parentSetValue={setValue}
            />
        </div>
    );
};

export default DetailDriver;
