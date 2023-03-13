/* eslint-disable react-hooks/exhaustive-deps */
import { Button, IconButton, InputAdornment, makeStyles } from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TitleDetail, DialogZyx, TemplateSwitch, FieldMultiSelect } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute, getCollectionAux } from "store/main/actions";
import { getApplicationByRole, getShopsByUserid, getWareHouse, insUser, shopUserIns } from "common/helpers";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import { CircularProgress } from '@material-ui/core';

const arrayBread = [
    { id: "view-1", name: "User" },
    { id: "view-2", name: "User detail" },
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

type FormFields = {
    userid: number;
    operation: string;
    full_name: string;
    password: string;
    usr: string;
    email: string;
    doc_type: string;
    doc_number: string;
    status: string;
    shops: Dictionary[],
}

interface ModalPasswordProps {
    openModal: boolean;
    setOpenModal: (value: boolean) => any;
    data: any;
    parentSetValue: (...param: any) => any;
}

const ModalPassword: React.FC<ModalPasswordProps> = ({ openModal, setOpenModal, data, parentSetValue }) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, setValue, getValues, formState: { errors }, clearErrors } = useForm({
        defaultValues: {
            password: '',
            confirmpassword: '',
        }
    });

    useEffect(() => {
        setValue('password', data?.password);
        setValue('confirmpassword', data?.password);
    }, [data, setValue]);

    useEffect(() => {
        register('password', { validate: (value: any) => (value && value.length) || t(langKeys.field_required) });
        register('confirmpassword', {
            validate: {
                validate: (value: any) => (value && value.length) || t(langKeys.field_required),
                same: (value: any) => (getValues('password') === value) || "Contraseñas no coinciden"
            }
        });
    }, [getValues, register, t])

    const handleCancelModal = () => {
        setOpenModal(false);
        setValue('password', data?.password);
        setValue('confirmpassword', data?.password);
        clearErrors();
    }

    const onSubmitPassword = handleSubmit((data) => {
        parentSetValue('password', data.password);
        setOpenModal(false);
    });

    return (
        <DialogZyx
            open={openModal}
            title={t(langKeys.setpassword)}
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.save)}
            handleClickButton1={handleCancelModal}
            handleClickButton2={onSubmitPassword}
        >
            <div className="row-zyx">
                <FieldEdit
                    label={t(langKeys.password)}
                    className="col-6"
                    valueDefault={getValues('password')}
                    type={showPassword ? 'text' : 'password'}
                    onChange={(value) => setValue('password', value)}
                    error={errors?.password?.message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <FieldEdit
                    label={t(langKeys.confirmpassword)}
                    className="col-6"
                    valueDefault={getValues('confirmpassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    onChange={(value) => setValue('confirmpassword', value)}
                    error={errors?.confirmpassword?.message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                >
                                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </div>
        </DialogZyx>
    )
}

const DetailShop: React.FC<{
    i: number,
    register: any,
    item: Dictionary,
    errors: any,
    getValues: (param: any) => any,
    trigger: (param: any) => void,
    shopRemove: (param: any) => void,
    setValue: (param: any, param1: any) => void,
    dataExtra: Dictionary,
}> = ({ i, item, errors, getValues, setValue, register, dataExtra: data, trigger, shopRemove }) => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const { t } = useTranslation();
    const mainAux = useSelector((state) => state.main.mainAux);
    const [dataExtra, setDataExtra] = useState<{
        warehouse: Dictionary[],
        application: Dictionary[],
    }>({
        application: [],
        warehouse: [],
    })

    const onChangeShop = (shop: Dictionary | null, i: number) => {
        setValue(`shops.${i}.shopid`, shop?.shopid || 0);
        setValue(`shops.${i}.warehouses`, "")
        if (shop) {
            dispatch(getCollectionAux(getWareHouse(shop.shopid, item.shopuserid)))
        } else {
            setDataExtra({
                ...dataExtra,
                warehouse: []
            })
        }
    }

    const onChangeRole = (shop: Dictionary | null, i: number) => {
        setValue(`shops.${i}.roleid`, shop?.roleid || 0);
        setValue(`shops.${i}.redirect`, "")
        if (shop) {
            dispatch(getCollectionAux(getApplicationByRole(shop.roleid, item.shopuserid)))
        } else {
            setDataExtra({
                ...dataExtra,
                application: []
            })
        }
    }

    useEffect(() => {
        if (item?.shopid) {
            dispatch(getCollectionAux(getWareHouse(item.shopid, item.shopuserid)))
            dispatch(getCollectionAux(getApplicationByRole(item.roleid, item.shopuserid)))
        }
    }, [])

    useEffect(() => {
        if (!mainAux.error && !mainAux.loading) {
            if (mainAux.key === `UFN_WAREHOUSE_LST${item.shopuserid}`) {
                setDataExtra(prev => ({
                    ...prev,
                    warehouse: mainAux.data
                }))
            } else if (mainAux.key === `UFN_APPLICATIONROLE_SEL${item.shopuserid}`) {
                setDataExtra(prev => ({
                    ...prev,
                    application: mainAux.data
                }))
            }
        }
    }, [mainAux, setValue])

    if (getValues(`shops.${i}.status`) === "ELIMINADO") {
        return null
    }
    return (
        <div className={classes.containerDetail}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <TemplateSwitch
                    label={t(langKeys.bydefault)}
                    valueDefault={getValues(`shops.${i}.bydefault`)}
                    mb={0}
                    onChange={(value) => setValue(`shops.${i}.bydefault`, value)}
                />
                <Button
                    variant="contained"
                    type="button"
                    color="primary"
                    startIcon={<ClearIcon color="secondary" />}
                    style={{ backgroundColor: "#FB5F5F" }}
                    onClick={() => {
                        if (item.shopuserid < 0) {
                            shopRemove(i)
                        } else {
                            setValue(`shops.${i}.status`, "ELIMINADO")
                            trigger(`shops.${i}.status`)
                        }
                    }}
                >{t(langKeys.delete)}</Button>
            </div>
            <div className="row-zyx">
                <FieldSelect
                    label={"Shop"}
                    className="col-6"
                    valueDefault={getValues(`shops.${i}.shopid`)}
                    fregister={{
                        ...register(`shops.${i}.shopid`, {
                            validate: {
                                validate: (value: any) => (value && value > 0) || t(langKeys.field_required),
                            }
                        })
                    }}
                    onChange={(value) => onChangeShop(value, i)}
                    error={errors?.shops?.[i]?.shopid?.message}
                    data={data.shop}
                    optionDesc="description"
                    optionValue="shopid"
                />
                <FieldMultiSelect
                    label={"Almacenes"}
                    className="col-6"
                    valueDefault={getValues(`shops.${i}.warehouses`)}
                    fregister={{
                        ...register(`shops.${i}.warehouses`)
                    }}
                    onChange={(value) => setValue(`shops.${i}.warehouses`, (value?.map((o: Dictionary) => o.warehouseid) || []).join())}
                    error={errors?.shops?.[i]?.warehouses?.message}
                    data={dataExtra.warehouse}
                    optionDesc="description"
                    optionValue="warehouseid"
                />
            </div>
            <div className="row-zyx">
                <FieldSelect
                    label={t(langKeys.role)}
                    className="col-6"
                    valueDefault={getValues(`shops.${i}.roleid`)}
                    fregister={{
                        ...register(`shops.${i}.roleid`, {
                            validate: {
                                validate: (value: any) => (value && value > 0) || t(langKeys.field_required),
                            }
                        })
                    }}
                    onChange={(value) => onChangeRole(value, i)}
                    error={errors?.shops?.[i]?.roleid?.message}
                    data={data.role}
                    optionDesc="description"
                    optionValue="roleid"
                />
                <FieldSelect
                    label={t(langKeys.default_application)}
                    className="col-6"
                    valueDefault={getValues(`shops.${i}.redirect`)}
                    fregister={{
                        ...register(`shops.${i}.redirect`, {
                            validate: {
                                validate: (value: any) => (value && value.length) || t(langKeys.field_required),
                            }
                        })
                    }}
                    onChange={(value) => {
                        setValue(`shops.${i}.redirect`, value?.path || "");
                        trigger(`shops.${i}.redirect`)
                    }}
                    error={errors?.shops?.[i]?.redirect?.message}
                    data={dataExtra.application}
                    optionDesc="description"
                    optionValue="path"
                />
            </div>
        </div>
    )
}

const Detail: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const multiData = useSelector((state) => state.main.multiData);
    const [loadingShop, setloadingShop] = useState(false)
    const mainAux = useSelector((state) => state.main.mainAux);
    const [dataExtra, setDataExtra] = useState<{
        status: Dictionary[],
        docType: Dictionary[],
        role: Dictionary[],
        shop: Dictionary[],
    }>({
        status: [],
        docType: [],
        role: [],
        shop: [],
    })
    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const [openDialogPassword, setOpenDialogPassword] = useState(false);

    const { control, register, handleSubmit, setValue, trigger, getValues, formState: { errors } } = useForm<FormFields>({
        defaultValues: {
            userid: row?.userid || 0,
            operation: row ? "UPDATE" : "INSERT",
            full_name: row?.full_name || '',
            password: row?.password || '',
            usr: row?.usr || '',
            email: row?.email || '',
            doc_type: row?.doc_type || 'DNI',
            doc_number: row?.doc_number || '',
            status: row?.status || 'ACTIVO',
        }
    });

    const { fields: fieldsShop, append: shopAppend, remove: shopRemove } = useFieldArray({
        control,
        name: 'shops',
    });

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const status = multiData.data.find(x => x.key === "DOMAIN-ESTADOGENERICO")
            const docType = multiData.data.find(x => x.key === "DOMAIN-TIPODOCUMENTO")
            const role = multiData.data.find(x => x.key === "UFN_ROLE_LST")
            const shop = multiData.data.find(x => x.key === "UFN_SHOP_LST")

            if (status && docType && role && shop) {
                const dd = {
                    status: status.data,
                    docType: docType.data,
                    role: role.data,
                    shop: shop.data,
                }
                setDataExtra(dd)
                if (row) {
                    setloadingShop(true)
                    dispatch(getCollectionAux(getShopsByUserid(row.userid)));
                } else {
                    shopAppend({ bydefault: true, shopuserid: fieldsShop.length * -1, shopid: dd.shop[0]?.shopid || 0, roleid: dd.role[0]?.roleid || 0 })
                }
            }
        }
    }, [multiData])

    useEffect(() => {
        if (!mainAux.error && !mainAux.loading) {
            if (mainAux.key === "UFN_SHOPUSER_SEL") {
                setValue("shops", mainAux.data)
                setloadingShop(false)
            }
        }
    }, [mainAux, setValue])

    useEffect(() => {
        if (waitSave) {
            if (!executeRes.loading && !executeRes.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(row ? langKeys.successful_edit : langKeys.successful_register) }))
                fetchData && fetchData();
                dispatch(showBackdrop(false));
                setViewSelected("view-1")
            } else if (executeRes.error) {
                const errormessage = t(executeRes.code || "error_unexpected_error", { module: t(langKeys.user).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: executeRes.message || errormessage }))
                setWaitSave(false);
                dispatch(showBackdrop(false));
            }
        }
    }, [executeRes, waitSave])

    React.useEffect(() => {
        register('userid');
        register('password');
        register('status', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('full_name', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('email', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('usr', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('doc_type', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('doc_number', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
    }, [register, t]);

    console.log("dataExtra", dataExtra)

    const onSubmit = handleSubmit((data) => {
        if (!row && !data.password) {
            dispatch(showSnackbar({ show: true, success: false, message: t(langKeys.password_required) }));
            return;
        }
        if (data.shops.filter(item => item.status !== "ELIMINADO").length === 0) {
            dispatch(showSnackbar({ show: true, success: false, message: "Debe tener como minimo una tienda asignada" }));
            return
        }
        if (data.shops.filter(item => item.status !== "ELIMINADO").filter(item => item.bydefault).length !== 1) {
            dispatch(showSnackbar({ show: true, success: false, message: "Debe tener solo una tienda por defecto" }));
            return
        }
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute({
                header: insUser({ ...data, operation: data.userid ? "UPDATE" : "INSERT" }),
                detail: data.shops.map(x => shopUserIns({
                    ...x,
                    operation: x.shopuserid > 0 ? (x.status === "ELIMINADO" ? "DELETE" : "UPDATE") : "INSERT"
                }))
            }, true));
            setWaitSave(true)
        }

        dispatch(manageConfirmation({
            visible: true,
            question: t(langKeys.confirmation_save),
            callback
        }))
    });

    return (
        <div style={{ width: '100%' }}>
            <TemplateBreadcrumbs
                breadcrumbs={arrayBread}
                handleClick={setViewSelected}
            />
            <form onSubmit={onSubmit}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <TitleDetail
                        title={row ? row.full_name : t(langKeys.newuser)}
                    />
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            type="button"
                            color="primary"
                            startIcon={<ClearIcon color="secondary" />}
                            style={{ backgroundColor: "#FB5F5F" }}
                            onClick={() => setViewSelected("view-1")}
                        >{t(langKeys.back)}</Button>
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                type="button"
                                startIcon={<LockOpenIcon color="secondary" />}
                                onClick={() => setOpenDialogPassword(true)}
                            >{t(row ? langKeys.changePassword : langKeys.setpassword)}</Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                startIcon={<SaveIcon color="secondary" />}
                                style={{ backgroundColor: "#55BD84" }}
                            >{t(langKeys.save)}</Button>
                        </>
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <div className="row-zyx">
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.fullname)}
                            valueDefault={row?.full_name || ""}
                            onChange={(value) => setValue('full_name', value)}
                            error={errors?.full_name?.message}
                        />
                        <FieldSelect
                            label={t(langKeys.status)}
                            className="col-6"
                            loading={multiData.loading}
                            valueDefault={getValues('status')}
                            onChange={(value) => setValue('status', value ? value.domainvalue : '')}
                            error={errors?.status?.message}
                            data={dataExtra.status}
                            optionDesc="domaindesc"
                            optionValue="domainvalue"
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.email)}
                            className="col-6"
                            valueDefault={getValues('email')}
                            onChange={(value) => setValue('email', value)}
                            error={errors?.email?.message}
                        />
                        <FieldEdit
                            label={t(langKeys.user)}
                            className="col-6"
                            valueDefault={getValues('usr')}
                            onChange={(value) => setValue('usr', value)}
                            error={errors?.usr?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={'RUC/DNI'}
                            className="col-6"
                            valueDefault={getValues('doc_number')}
                            onChange={(value) => setValue('doc_number', value)}
                            error={errors?.doc_number?.message}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 20, display: 'flex', alignItems: 'center' }}>Tiendas</div>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon color="secondary" />}
                        style={{ backgroundColor: "#55BD84" }}
                        onClick={() => shopAppend({ shopuserid: fieldsShop.length * -1 })}
                    >Agregar tienda</Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {loadingShop ? (
                        <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress />
                        </div>
                    ) : fieldsShop.map((item: Dictionary, i: number) => (
                        <DetailShop
                            key={item.id}
                            item={item}
                            i={i}
                            register={register}
                            errors={errors}
                            getValues={getValues}
                            trigger={trigger}
                            shopRemove={shopRemove}
                            setValue={setValue}
                            dataExtra={dataExtra}
                        />
                    ))}
                </div>
            </form>
            <ModalPassword
                openModal={openDialogPassword}
                setOpenModal={setOpenDialogPassword}
                data={row}
                parentSetValue={setValue}
            />
        </div>
    );
}

export default Detail;