/* eslint-disable react-hooks/exhaustive-deps */
import { Button, IconButton, InputAdornment, makeStyles } from "@material-ui/core";
import { Dictionary } from "@types";
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


export interface CustomDetailModule {
    row: Dictionary | null;
    setViewSelected: (view: string) => void;
    fetchData: () => void;
    newBillDialog: boolean;
    setNewBillDialog: (view: boolean) => void;
    transferDialog: boolean;
    setTransferDialog: (view: boolean) => void;
}

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

interface ModalProps {
    openModal: boolean;
    setOpenModal: (value: boolean) => any;
    data: any;
    parentSetValue: (...param: any) => any;
}

const ModalBill: React.FC<ModalProps> = ({ openModal, setOpenModal, data, parentSetValue }) => {
    const { t } = useTranslation();

    const { register, handleSubmit, setValue, getValues, formState: { errors }, clearErrors } = useForm({
        defaultValues: {
            name: '',
            initialamount: '',
            observations: '',
        }
    });

    useEffect(() => {
        register('name', { validate: (value: any) => (value && value.length) || t(langKeys.field_required) });
        register('initialamount', { validate: (value: any) => (value && value.length) || t(langKeys.field_required) });
    }, [getValues, register, t])

    const handleCancelModal = () => {
        setOpenModal(false);
        setValue('name', "");
        setValue('initialamount', "");
        setValue('observations', "");
        clearErrors();
    }

    const onSubmitPassword = handleSubmit((data) => {
        //enviar la data
        setOpenModal(false);
    });

    return (
        <DialogZyx
            open={openModal}
            title={t(langKeys.createnewbill)}
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.save)}
            handleClickButton1={handleCancelModal}
            handleClickButton2={onSubmitPassword}
        >
            <div className="row-zyx">
                <FieldEdit
                    label={t(langKeys.name)}
                    className="col-12"
                    valueDefault={getValues('name')}
                    onChange={(value) => setValue('name', value)}
                    error={errors?.name?.message}
                />
                <FieldEdit
                    label={t(langKeys.initialamount)}
                    className="col-12"
                    type="number"
                    valueDefault={getValues('initialamount')}
                    onChange={(value) => setValue('initialamount', value)}
                    error={errors?.initialamount?.message}
                />
                <FieldEdit
                    label={t(langKeys.observations)}
                    className="col-12"
                    valueDefault={getValues('observations')}
                    onChange={(value) => setValue('observations', value)}
                    error={errors?.observations?.message}
                />
            </div>
        </DialogZyx>
    )
}
const ModalTransfer: React.FC<ModalProps> = ({ openModal, setOpenModal, data, parentSetValue }) => {
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

const Detail: React.FC<CustomDetailModule> = ({ row, setViewSelected, fetchData, newBillDialog, setNewBillDialog, transferDialog, setTransferDialog }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);

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


    return (
        <>
            <ModalBill
                openModal={newBillDialog}
                setOpenModal={setNewBillDialog}
                data={row}
                parentSetValue={setValue}
            />
            <ModalTransfer
                openModal={transferDialog}
                setOpenModal={setTransferDialog}
                data={row}
                parentSetValue={setValue}
            />
        </>
    );
}

export default Detail;