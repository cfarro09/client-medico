/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import { DialogZyx, TemplateIcons, TemplateBreadcrumbs, TitleDetail, FieldEdit, FieldSelect, FieldMultiSelect, AntTab } from 'components';
import { getOrgUserSel, getUserSel, getValuesFromDomain, insPatient, getAppointmentByPatient, getPatientSel } from 'common/helpers';
import { Dictionary, MultiData } from "@types";
import TableZyx from '../components/fields/table-simple';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { useForm } from 'react-hook-form';
import {
    getCollection, resetAllMain, getMultiCollection,
    execute, resetMainAux, getCollectionAux
} from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation, manageLightBox } from 'store/popus/actions';
import ClearIcon from '@material-ui/icons/Clear';
import Avatar from '@material-ui/core/Avatar';
import { Tabs } from '@material-ui/core';

import AvatarGroup from '@material-ui/lab/AvatarGroup';
interface DetailProps {
    row: Dictionary | null;
    setViewSelected: (view: string) => void;
    fetchData?: () => void
}
const arrayBread = [
    { id: "view-1", name: "Pacientes" },
    { id: "view-2", name: "Detalle del paciente" }
];

const data_type_document = [
    { domainvalue: 'DNI', domaindesc: 'DNI' },
    { domainvalue: 'PASAPORTE', domaindesc: 'PASAPORTE' },
    { domainvalue: 'RUC', domaindesc: 'RUC' }
]

const data_status = [
    { domainvalue: 'ACTIVO', domaindesc: 'ACTIVO' },
    { domainvalue: 'ELIMINADO', domaindesc: 'ELIMINADO' }
]

const useStyles = makeStyles((theme) => ({
    containerDetail: {
        marginTop: theme.spacing(2),
        // maxWidth: '80%',
        padding: theme.spacing(2),
        background: '#fff',
    },
    mb2: {
        marginBottom: theme.spacing(4),
    },
    title: {
        fontSize: '22px',
        color: theme.palette.text.primary,
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: '14px',
        textTransform: 'initial'
    }
}));

const DetailUsers: React.FC<DetailProps> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const dataAppoiintments = useSelector(state => state.main.mainAux);
    const [pageSelected, setPageSelected] = useState(0);

    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: {
            id: row ? row.patientid : 0,
            operation: row ? "UPDATE" : "INSERT",

            doctype: row?.doctype || "DNI",
            docnum: row?.docnum || "",
            firstname: row?.firstname || "",
            lastname: row?.lastname || "",
            email: row?.email || "",
            phone: row?.phone || "",
            address: row?.address || "",
            birthdate: row?.birthdate || "",
            contactphone: row?.contactphone || "",
            contactname: row?.contactname || "",
            status: row?.status || "ACTIVO",
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
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                setWaitSave(false);
                dispatch(showBackdrop(false));
            }
        }
    }, [executeRes, waitSave])

    React.useEffect(() => {
        register('id');

        register('doctype', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('docnum', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('firstname', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('lastname', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('email', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('phone', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('address');
        register('birthdate', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('contactphone', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('contactname', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('status', { validate: (value) => (value && value.length) || t(langKeys.field_required) });

        dispatch(resetMainAux())

        if (row) {
            console.log("row", row)
            dispatch(getCollectionAux(getAppointmentByPatient(row.patientid)));
        }
    }, [register]);

    const columns = React.useMemo(
        () => [
            {
                accessor: 'patientid',
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: '1%',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <TemplateIcons
                            viewFunction={() => null}
                            deleteFunction={() => null}
                            editFunction={() => null}
                        />
                    )
                }
            },
            {
                Header: "Sesión",
                accessor: 'description',
                NoFilter: true
            },
            {
                Header: "Observación",
                accessor: 'observation',
                NoFilter: true
            },
            {
                Header: "Fecha proxima",
                accessor: 'nextappointmentdate',
                NoFilter: true
            },
            {
                Header: "Fecha",
                accessor: 'createdate',
                NoFilter: true
            },
            {
                Header: "Imagenes",
                accessor: 'images',
                NoFilter: true,
                Cell: (props: any) => {
                    const { images } = props.cell.row.original;
                    if (!images)
                        return null
                    return (
                        <AvatarGroup
                            max={3}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                dispatch(manageLightBox({ visible: true, images: images.split(","), index: 0 }))
                            }}
                        >
                            {images.split(",").map((image: string, index: number) => (
                                <Avatar key={index} src={image} />
                            ))}
                        </AvatarGroup>
                    )
                }
            },
        ],
        []
    );

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insPatient(data)));
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <TemplateBreadcrumbs
                        breadcrumbs={arrayBread}
                        handleClick={setViewSelected}
                    />
                    <TitleDetail
                        title={row ? `${row.firstname} ${row.lastname}` : "Nuevo paciente"}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        type="button"
                        color="primary"
                        startIcon={<ClearIcon color="secondary" />}
                        style={{ backgroundColor: "#FB5F5F" }}
                        onClick={() => setViewSelected("view-1")}
                    >{t(langKeys.back)}</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        form="form-patient"
                        startIcon={<SaveIcon color="secondary" />}
                        style={{ backgroundColor: "#55BD84" }}
                    >{t(langKeys.save)}</Button>
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
                <AntTab label="Información paciente" />
                <AntTab label="Citas" />
            </Tabs>
            {pageSelected === 0 &&
                <form id="form-patient" onSubmit={onSubmit}>
                    <div className={classes.containerDetail}>
                        <div className="row-zyx">

                            <FieldEdit
                                className="col-6"
                                label={t(langKeys.firstname)}
                                style={{ marginBottom: 8 }}
                                valueDefault={row?.firstname || ""}
                                onChange={(value) => setValue('firstname', value)}
                                error={errors?.firstname?.message}
                            />
                            <FieldEdit
                                className="col-6"
                                label={t(langKeys.lastname)}
                                valueDefault={row?.lastname || ""}
                                onChange={(value) => setValue('lastname', value)}
                                error={errors?.lastname?.message}
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
                                label={t(langKeys.phone)}
                                className="col-6"
                                valueDefault={row?.phone || ""}
                                onChange={(value) => setValue('phone', value)}
                                error={errors?.phone?.message}
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldSelect
                                label={t(langKeys.docType)}
                                className="col-6"
                                valueDefault={getValues('doctype')}
                                onChange={(value) => setValue('doctype', value ? value.domainvalue : '')}
                                error={errors?.doctype?.message}
                                data={data_type_document}
                                optionDesc="domaindesc"
                                optionValue="domainvalue"
                            />
                            <FieldEdit
                                label={t(langKeys.docNumber)}
                                className="col-6"
                                valueDefault={getValues('docnum')}
                                onChange={(value) => setValue('docnum', value)}
                                error={errors?.docnum?.message}
                            />
                        </div>

                        <div className="row-zyx">
                            <FieldSelect
                                label={t(langKeys.status)}
                                className="col-6"
                                valueDefault={row?.status || "ACTIVO"}
                                onChange={(value) => setValue('status', value ? value.domainvalue : '')}
                                error={errors?.status?.message}
                                data={data_status}
                                optionDesc="domaindesc"
                                optionValue="domainvalue"
                            />
                            <FieldEdit
                                label={"Fecha de nacimiento"}
                                className="col-6"
                                type="date"
                                valueDefault={getValues('birthdate')}
                                onChange={(value) => setValue('birthdate', value)}
                                error={errors?.birthdate?.message}
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldEdit
                                label={t(langKeys.address)}
                                className="col-12"
                                valueDefault={getValues('address')}
                                onChange={(value) => setValue('address', value)}
                                error={errors?.address?.message}
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldEdit
                                label="Nombre del contacto"
                                className="col-6"
                                valueDefault={row?.contactname || ""}
                                onChange={(value) => setValue('contactname', value)}
                                error={errors?.contactname?.message}
                            />
                            <FieldEdit
                                label="Teléfono del contacto"
                                className="col-6"
                                valueDefault={row?.contactphone || ""}
                                onChange={(value) => setValue('contactphone', value)}
                                error={errors?.contactphone?.message}
                            />
                        </div>
                    </div>
                </form>
            }
            {pageSelected === 1 &&
                <div className={classes.containerDetail}>
                    <TableZyx
                        columns={columns}
                        data={dataAppoiintments.data}
                        download={true}
                        filterGeneral={false}
                        loading={dataAppoiintments.loading}
                        register={true}
                        hoverShadow={true}
                    />
                </div>
            }
        </div>
    );
}

const Users: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector(state => state.main.mainData);
    const mainMultiResult = useSelector(state => state.main.multiData);
    const executeResult = useSelector(state => state.main.execute);
    const [dataUsers, setdataUsers] = useState<Dictionary[]>([]);

    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<Dictionary | null>(null);
    const [waitSave, setWaitSave] = useState(false);

    const columns = React.useMemo(
        () => [
            {
                accessor: 'patientid',
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: '1%',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <TemplateIcons
                            viewFunction={() => handleView(row)}
                            deleteFunction={() => handleDelete(row)}
                            editFunction={() => handleEdit(row)}
                        />
                    )
                }
            },
            {
                Header: t(langKeys.firstname),
                accessor: 'firstname',
                NoFilter: true
            },
            {
                Header: t(langKeys.lastname),
                accessor: 'lastname',
                NoFilter: true
            },
            {
                Header: "N° doc",
                accessor: 'docnum',
                NoFilter: true
            },
            {
                Header: t(langKeys.email),
                accessor: 'email',
                NoFilter: true
            },
            {
                Header: "N° sesiones",
                accessor: 'countquotes',
                NoFilter: true
            },
            {
                Header: "Teléfono",
                accessor: 'phone',
                NoFilter: true
            },
            // {
            //     Header: t(langKeys.role),
            //     accessor: 'role_name',
            //     NoFilter: true
            // },
            {
                Header: t(langKeys.status),
                accessor: 'status',
                NoFilter: true,
            },

        ],
        []
    );

    const fetchData = () => dispatch(getCollection(getPatientSel(0)));

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error) {
            mainResult.data && setdataUsers(mainResult.data);
        }
    }, [mainResult]);

    useEffect(() => {
        fetchData();
        // dispatch(getMultiCollection([
        //     getValuesFromDomain("TIPODOCUMENTO"), //0
        //     getValuesFromDomain("ESTADOUSUARIO"), //1
        //     getRoles(), //formulario orguser 4
        // ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_delete) }))
                fetchData();
                dispatch(showBackdrop(false));
                setWaitSave(false);
            } else if (executeResult.error) {
                const errormessage = t(executeResult.code || "error_unexpected_error", { module: t(langKeys.user).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeResult, waitSave])

    const handleRegister = () => {
        setViewSelected("view-2");
        setRowSelected(null);
    }

    const handleView = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected(row);
    }

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected(row);
    }

    const handleDelete = (row: Dictionary) => {
        const callback = () => {
            dispatch(execute(insPatient({ ...row, operation: 'DELETE', status: 'ELIMINADO', id: row.patientid })));
            dispatch(showBackdrop(true));
            setWaitSave(true);
        }

        dispatch(manageConfirmation({
            visible: true,
            question: t(langKeys.confirmation_delete),
            callback
        }))
    }

    if (viewSelected === "view-1") {

        if (mainResult.error) {
            return <h1>ERROR</h1>;
        }

        return (
            <TableZyx
                columns={columns}
                titlemodule="Pacientes"
                data={dataUsers}
                download={true}
                loading={mainResult.loading}
                register={true}
                hoverShadow={true}
                handleRegister={handleRegister}
            />
        )
    }
    else
        return (
            <DetailUsers
                row={rowSelected}
                setViewSelected={setViewSelected}
                fetchData={fetchData}
            />
        )
}

export default Users;