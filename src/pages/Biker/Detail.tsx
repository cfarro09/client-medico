/* eslint-disable react-hooks/exhaustive-deps */
import { Button, makeStyles } from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute } from "store/main/actions";
import { insBiker } from "common/helpers";
import ModalPassword from "./Modal/ModalPassword";
import LockOpenIcon from '@material-ui/icons/LockOpen';

const arrayBread = [
    { id: "view-1", name: "Bikers" },
    { id: "view-2", name: "Biker detail" },
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


const DetailBiker: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [dataExtra, setDataExtra] = useState<{ status: Dictionary[]; type: Dictionary[] }>({ status: [], type: [] });
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [openDialogPassword, setOpenDialogPassword] = useState(false);

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataTypes = multiData.data.find((x) => x.key === "DOMAIN-TIPODOCUMENTO");
            if (dataStatus && dataTypes) {
                setDataExtra({
                    status: dataStatus.data,
                    type: dataTypes.data,
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
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: row?.userid || 0,
            operation: row ? "UPDATE" : "INSERT",
            full_name: row?.full_name || '',
            password: row?.password || '',
            usr: row?.usr || '',
            email: row?.email || '',
            doc_type: row?.doc_type || 'DNI',
            doc_number: row?.doc_number || '',
            address: row?.address || '',
            status: row?.status || 'ACTIVO',
        },
    });


    const onSubmit = handleSubmit((data) => {
        if (!row && !data.password) {
            dispatch(showSnackbar({ show: true, success: false, message: t(langKeys.password_required) }));
            return;
        }

        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insBiker({...data, pwd: data.password})));
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
        register('id');
        register('password');
        register('status', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('full_name', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('usr', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('doc_type', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('doc_number', { validate: (value) => (value && !!value.length) || "" + t(langKeys.field_required) });
        register('email');
        register('address');
    }, [register]);

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.full_name}` : 'Nuevo Motorizado'} />
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
                            label={'Nombre completo (*)'}
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
                            label={'Usuario (*)'}
                            className="col-6"
                            valueDefault={getValues('usr')}
                            onChange={(value) => setValue('usr', value)}
                            error={errors?.usr?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            loading={multiData.loading}
                            label={`${t(langKeys.docType)} (*)`}
                            className="col-6"
                            valueDefault={getValues('doc_type')}
                            onChange={(value) => setValue('doc_type', value ? value.domainvalue : '')}
                            error={errors?.doc_type?.message}
                            data={dataExtra.type}
                            optionDesc="domaindesc"
                            optionValue="domainvalue"
                        />
                        <FieldEdit
                            label={`${t(langKeys.docNumber)} (*)`}
                            className="col-6"
                            valueDefault={getValues('doc_number')}
                            onChange={(value) => setValue('doc_number', value)}
                            error={errors?.doc_number?.message}
                        />
                    </div>
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

export default DetailBiker;