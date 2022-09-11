import { Button, IconButton, InputAdornment, makeStyles } from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TitleDetail, DialogZyx, TemplateSwitch } from "components";
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
import { getShopsByUserid, insUser } from "common/helpers";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import LockOpenIcon from '@material-ui/icons/LockOpen';

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

type IShops = {
    bydefault: boolean;
    description: string;
    redirect: string;
    role_name: string;
    roleid: number;
    shop_name: number;
    shopid: number;
    shopuserid: number;
    warehouses: string;
}

type FormFields = {
    id: number;
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

    const { register, handleSubmit, setValue, getValues, formState: { errors }, trigger, clearErrors } = useForm({
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

const Detail: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const multiData = useSelector((state) => state.main.multiData);
    const mainShops = useSelector((state) => state.main.mainAux);
    const [dataExtra, setDataExtra] = useState<{
        status: Dictionary[],
        docType: Dictionary[],
        role: Dictionary[],
        application: Dictionary[],
        shop: Dictionary[],
    }>({
        status: [],
        docType: [],
        role: [],
        application: [],
        shop: []
    })
    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const [openDialogPassword, setOpenDialogPassword] = useState(false);

    const { control, register, handleSubmit, setValue, trigger, getValues, formState: { errors } } = useForm<FormFields>({
        defaultValues: {
            id: row?.userid || 0,
            operation: row ? "UPDATE" : "INSERT",
            full_name: row?.full_name || '',
            password: row?.password || '',
            usr: row?.usr || '',
            email: row?.email || '',
            doc_type: row?.doc_type || 'DNI',
            doc_number: row?.doc_number || '',
            status: row?.status || 'ACTIVO',
            shops: []
        }
    });

    const { fields: fieldsShop, append: shopAppend, remove: shopRemove, move } = useFieldArray({
        control,
        name: 'shops',
    });

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const status = multiData.data.find(x => x.key === "DOMAIN-ESTADOGENERICO")
            const docType = multiData.data.find(x => x.key === "DOMAIN-TIPODOCUMENTO")
            const role = multiData.data.find(x => x.key === "UFN_ROLE_LST")
            const application = multiData.data.find(x => x.key === "UFN_APPLICATION_LST")
            const shop = multiData.data.find(x => x.key === "UFN_SHOP_LST")

            if (status && docType && role && application && shop) {
                setDataExtra({
                    status: status.data,
                    docType: docType.data,
                    role: role.data,
                    application: application.data,
                    shop: shop.data
                })
            }
        }
    }, [multiData])

    useEffect(() => {
        if (!mainShops.error && !mainShops.loading && mainShops.key === "UFN_SHOPUSER_SEL") {
            setValue("shops", mainShops.data)
        }
    }, [mainShops, setValue])

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
        register('id');
        register('password');
        register('status', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('full_name', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('email', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('usr', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('doc_type', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('doc_number', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });

        if (row) {
            dispatch(getCollectionAux(getShopsByUserid(row.userid)))
        }
    }, [register, t]);

    console.log("fieldsShop", fieldsShop)

    const onSubmit = handleSubmit((data) => {
        if (!row && !data.password) {
            dispatch(showSnackbar({ show: true, success: false, message: t(langKeys.password_required) }));
            return;
        }
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insUser(data)));
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
                            valueDefault={row?.status || "ACTIVO"}
                            onChange={(value) => setValue('status', value ? value.domainvalue : '')}
                            error={errors?.status?.message}
                            data={dataExtra.status}
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.email)}
                            className="col-6"
                            valueDefault={row?.email || ""}
                            onChange={(value) => setValue('email', value)}
                            error={errors?.email?.message}
                        />
                        <FieldEdit
                            label={t(langKeys.user)}
                            className="col-6"
                            valueDefault={row?.usr || ""}
                            onChange={(value) => setValue('usr', value)}
                            error={errors?.usr?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            loading={multiData.loading}
                            label={t(langKeys.docType)}
                            className="col-6"
                            valueDefault={getValues('doc_type')}
                            onChange={(value) => setValue('doc_type', value ? value.domainvalue : '')}
                            error={errors?.doc_type?.message}
                            data={dataExtra.docType}
                            optionDesc="domaindesc"
                            optionValue="domainvalue"
                        />
                        <FieldEdit
                            label={t(langKeys.docNumber)}
                            className="col-6"
                            valueDefault={getValues('doc_number')}
                            onChange={(value) => setValue('doc_number', value)}
                            error={errors?.doc_number?.message}
                        />
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    {fieldsShop.map((item: Dictionary, i: number) => (
                        <div key={item.id}>
                            {item.shop_name}
                            <div className="row-zyx">
                                <FieldSelect
                                    label={"Shop"}
                                    className="col-6"
                                    valueDefault={getValues(`shops.${i}.shopid`)}
                                    fregister={{
                                        ...register(`shops.${i}.shopid`, {
                                            validate: {
                                                validate: (value: any) => (value && value.length) || t(langKeys.field_required),
                                            }
                                        })
                                    }}
                                    onChange={(value) => {
                                        setValue(`shops.${i}.shopid`, value?.shopid || 0);
                                        trigger(`shops.${i}.shopid`)
                                    }}
                                    error={errors?.shops?.[i]?.shopid?.message}
                                    data={dataExtra.shop}
                                    optionDesc="description"
                                    optionValue="shopid"
                                />
                                <TemplateSwitch
                                    label={t(langKeys.bydefault)}
                                    className="col-6"
                                    valueDefault={getValues(`shops.${i}.bydefault`)}
                                    onChange={(value) => setValue(`shops.${i}.bydefault`, value)}
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
                                                validate: (value: any) => (value && value.length) || t(langKeys.field_required),
                                            }
                                        })
                                    }}
                                    onChange={(value) => {
                                        setValue(`shops.${i}.roleid`, value?.roleid || 0);
                                        trigger(`shops.${i}.roleid`)
                                    }}
                                    error={errors?.shops?.[i]?.roleid?.message}
                                    data={dataExtra.role}
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
                    ))}
                </div>
            </form>
            <ModalPassword
                openModal={openDialogPassword}
                setOpenModal={setOpenDialogPassword}
                data={getValues()}
                parentSetValue={setValue}
            />
        </div>
    );
}

export default Detail;