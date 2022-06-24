/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import { TemplateIcons, TemplateBreadcrumbs, TitleDetail, FieldEdit, FieldSelect, DialogZyx, AntTab, FieldEditMulti, FieldEditArray } from 'components';
import { insPatient, getAppointmentByPatient, getPatientSel, insertAppointment } from 'common/helpers';
import { Dictionary } from "@types";
import TableZyx from '../components/fields/table-simple';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    getCollection, resetAllMain, uploadFile, resetUploadFile,
    execute, resetMainAux, getCollectionAux
} from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation, manageLightBox } from 'store/popus/actions';
import ClearIcon from '@material-ui/icons/Clear';
import Avatar from '@material-ui/core/Avatar';
import { Tabs, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import AddIcon from '@material-ui/icons/Add';
import IOSSwitch from "components/fields/IOSSwitch";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { apiUrls } from 'common/constants';

const recordPatient = [
    "X-Diabetes",
    "Y-Hematocrito",
    "X-Hipertensión arteria",
    "Y-Glicemia",
    "X-Cancer",
    "Y-Hemoglobina",
    "X-Inmunodepresión",
    "X-Tabaquismo",
    "X-Insuficiencia venos",
    "Y-Creatinina",
    "X-Insuficiencia arteria",
    "Y-HB Glicosilad",
    "Y-Hemograma completo",
    "Y-Orina",
    "Y-Perfil lipídico",
    "X-Hipoglicemiantes",
    "X-Antibióticos",
    "X-Tratamiento anticoagulante",
    "Z-otros",
    "F-Radiografia",
    "F-Tomografía",
    "F-Ecodoppler",
    "F-Ecografia de partes blandas",
    "F-Otra imagen",
    "H-Sintomas principales",
    "H-Tiempo de enfermedad",
    "H-Exámen clínico",
    "H-Diagnóstico",
    "H-Plan de tratamiento",
    "HI-Firma digital",
    "HI-Anexos"
]

const initialRecordAppointment = {
    "Aspecto": "",
    "Diámetro": "",
    "Profundidad": "",
    "Cantidad exudado": "",
    "Calidad exudado": "",
    "Tejido esf/necrótico": "",
    "Tejido granulatorio": "",
    "Edema": "",
    "Dolor": "",
    "Piel circundante": "",
    "Puntaje": "",
    "Grado de la úlcera": "",
    "Agente utilizado": "",
    "Apósito o cobertura": "",
    "Tipo de fijación": "",
    "Nombre evaluador": "",
}

function calculateAge(birthday: string) { // birthday is a date
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    if (isNaN(ageDifMs)) {
        return ""
    }
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970) + "";
}

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
    },
    boxImage: {
        width: '100%',
        height: '105px',
        paddingRight: 10,
        position: 'relative',
        border: '1px solid #e1e1e1',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    boxImage2: {
        width: '100px',
        height: '100px',
        padding: 4,
        objectFit: "cover",
        cursor: 'pointer'
    },
    editText: {
        width: '100%'
    }
}));

const DialogAppointment: FC<{ open: boolean, setOpen: (p: any) => void, appointment: Dictionary | null, setDataAppointments: (p: any) => void }> = ({ open, setOpen, appointment, setDataAppointments }) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const dispatch = useDispatch();
    const [valuefile, setvaluefile] = useState('')
    const [waitSave, setWaitSave] = useState(false);
    const uploadResult = useSelector(state => state.main.uploadFile);
    const [record, setRecord] = useState<Dictionary>(initialRecordAppointment)

    const { register, handleSubmit, reset, setValue, control, getValues, formState: { errors } } = useForm<any>({
        defaultValues: {
            appointmentid: appointment?.appointmentid || 0,
            description: appointment?.description || '',
            observation: appointment?.observation || '',
            nextappointmentdate: '',
            images: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'images',
    });

    useEffect(() => {
        register('appointmentid')
        register('nextappointmentdate')
        register('images')
        register('description', { validate: (value) => (value && value.length) ? "" : (t(langKeys.field_required) + "") });
    }, [])

    const onSubmit = handleSubmit((data) => {
        if (data.appointmentid) {
            setDataAppointments((prev: Dictionary[]) => prev.map(x => x.appointmentid === data.appointmentid ? ({
                ...x,
                ...data,
                images: JSON.stringify(data.images),
                nextappointmentdate: data.nextappointmentdate || null,
                operation: data.appointmentid < 0 ? x.operation : 'UPDATE',
                medicalrecord: JSON.stringify(record)
            }) : x))
        } else {
            setDataAppointments((prev: Dictionary[]) => [...prev, {
                ...data,
                operation: 'INSERT',
                images: JSON.stringify(data.images),
                appointmentid: (prev.length + 1) * -1,
                nextappointmentdate: data.nextappointmentdate || null,
                medicalrecord: JSON.stringify(record)
            }])
        }
        setOpen(false)
    });

    useEffect(() => {
        if (waitSave) {
            if (!uploadResult.loading && !uploadResult.error) {
                append({
                    url: uploadResult.url,
                    description: ''
                })
                setWaitSave(false);
                dispatch(resetUploadFile());
                dispatch(showBackdrop(false))
            } else if (uploadResult.error) {
                setWaitSave(false);
                dispatch(showBackdrop(false))
            }
        }
    }, [waitSave, uploadResult, dispatch])

    useEffect(() => {
        if (open) {
            setRecord((appointment?.medicalrecord && appointment?.medicalrecord?.length > 20) ? JSON.parse(appointment?.medicalrecord) : initialRecordAppointment)
            reset({
                appointmentid: appointment?.appointmentid || 0,
                description: appointment?.description || '',
                observation: appointment?.observation || '',
                nextappointmentdate: appointment?.nextappointmentdate || '',
                images: JSON.parse(appointment?.images || "[]"),
            })
        }
    }, [open])

    const onSelectImage = (files: any) => {
        console.log(files)
        const selectedFile = files[0];
        var fd = new FormData();
        fd.append('file', selectedFile, selectedFile.name);
        setvaluefile('')
        dispatch(uploadFile(fd));
        setWaitSave(true)
        dispatch(showBackdrop(true))
    }

    return (
        <DialogZyx
            open={open}
            title="Cita"
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.save)}
            handleClickButton1={() => setOpen(false)}
            handleClickButton2={onSubmit}
        >
            <div className="row-zyx">
                <FieldEdit
                    className="col-12"
                    label="Sesión"
                    style={{ marginBottom: 8 }}
                    valueDefault={getValues('description')}
                    onChange={(value) => setValue('description', value)}
                    error={errors?.description?.message}
                />
            </div>
            <div className="row-zyx" style={{ marginBottom: 0 }}>
                <FieldEdit
                    className="col-12"
                    label="Fecha próxima"
                    type="date"
                    valueDefault={getValues('nextappointmentdate')}
                    onChange={(value) => setValue('nextappointmentdate', value)}
                    error={errors?.nextappointmentdate?.message}
                />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'end' }}>
                    <input
                        name="file"
                        accept="image/*"
                        id={`upload_image`}
                        type="file"
                        value={valuefile}
                        style={{ display: 'none' }}
                        onChange={(e) => onSelectImage(e.target.files)}
                    />
                    <label htmlFor={`upload_image`} className={classes.boxImage} style={{ backgroundColor: '#e3e3e3', cursor: 'pointer', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', paddingRight: 0 }}>
                        <AddIcon color="action" />
                    </label>
                </div>
                {fields.map((item: Dictionary, index) => (
                    <div
                        key={item.id}
                        className={classes.boxImage}
                    >
                        <img
                            alt={"mg" + index}
                            src={item.url}
                            className={classes.boxImage2}
                            onClick={() => dispatch(manageLightBox({ visible: true, descriptions: fields.map((x: Dictionary) => x.description), images: fields.map((x: Dictionary) => x.url), index }))}
                        />
                        <IconButton
                            size='small'
                            style={{ position: 'absolute', top: 0, right: 0 }}
                            onClick={(e) => remove(index)}
                        >
                            <DeleteIcon color='action' />
                        </IconButton>
                        <FieldEditArray
                            label="Descripción"
                            className={classes.editText}
                            fregister={{
                                ...register(`images.${index}.description`, {
                                    validate: (value: any) => (value && value.length) || t(langKeys.field_required)
                                })
                            }}
                            valueDefault={item.description}
                            error={errors?.images?.[index]?.description?.message}
                            onChange={(value) => setValue(`images.${index}.description`, "" + value)}
                        />
                    </div>
                ))}
            </div>
        </DialogZyx>
    )
}

const DetailPatient: React.FC<DetailProps> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const resMainAux = useSelector(state => state.main.mainAux);
    const [dataAppointments, setDataAppointments] = useState<Dictionary[]>([])
    const [waitUpload, setWaitUpload] = useState(false);
    const [uploadType, setUploadType] = useState("");
    const uploadResult = useSelector(state => state.main.uploadFile);
    const [pageSelected, setPageSelected] = useState(0);
    const [openDialogAppointment, setOpenDialogAppointment] = useState(false);
    const [appointmentSelected, setappointmentSelected] = useState<Dictionary | null>(null);
    const [dataexport, setdataexport] = useState<Dictionary>(row?.dataexport ? JSON.parse(row.dataexport) : {
        "attention_date": "",
        "reason_consultation": "",
        "clinical_examination": "",
        "diagnostic_printing": "",
        "treatment": "",
        "patients_relatives": "",
        "patient_accept": "",
        "medical_leave_date": "",
        "export_date": "",
    });

    const [record, setRecord] = useState((row?.medicalrecord && row?.medicalrecord?.length > 20) ? JSON.parse(row.medicalrecord) : {
        "peso": "",
        "Diabetes": false,
        "Hematocrito": false,
        "Hipertensión arteria": false,
        "Glicemia": false,
        "Cancer": false,
        "Hemoglobina": false,
        "Inmunodepresión": false,
        "Tabaquismo": false,
        "Insuficiencia venos": false,
        "Creatinina": false,
        "Insuficiencia arteria": false,
        "HB Glicosilad": false,
        "Hipoglicemiantes": false,
        "Antibióticos": false,
        "Tratamiento anticoagulante": false,
        "Hemograma completo": false,
        "Orina": false,
        "Perfil lipídico": false,
        "otros": "",
        "Radiografia": "",
        "Tomografía": "",
        "Ecodoppler": "",
        "Ecografia de partes blandas": "",
        "Otra imagen": "",

        "Sintomas principales": "",
        "Tiempo de enfermedad": "",
        "Exámen clínico": "",
        "Diagnóstico": "",
        "Plan de tratamiento": "",
        "Firma digital": "",
        "Anexos": "",
    })
    const { register, handleSubmit, setValue, getValues, trigger, formState: { errors } } = useForm({
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
            otros: record.otros,
            origin: row?.origin,
        }
    });

    useEffect(() => {
        if (!resMainAux.loading && !resMainAux.error) {
            setDataAppointments(resMainAux.data)
        }
    }, [resMainAux])

    const onSelectImage = (files: any) => {
        const selectedFile = files[0];
        if (!selectedFile) {
            return;
        }
        var fd = new FormData();
        fd.append('file', selectedFile, selectedFile.name);
        // setvaluefile('')
        dispatch(uploadFile(fd));
        setWaitUpload(true)
        dispatch(showBackdrop(true))
    }

    useEffect(() => {
        if (waitUpload) {
            if (!uploadResult.loading && !uploadResult.error) {
                setRecord({ ...record, [uploadType]: uploadResult.url })
                // append({
                //     url: uploadResult.url,
                //     description: ''
                // })
                setWaitUpload(false);
                dispatch(resetUploadFile());
                dispatch(showBackdrop(false))
            } else if (uploadResult.error) {
                setWaitUpload(false);
                dispatch(showBackdrop(false))
            }
        }
    }, [waitUpload, uploadResult, dispatch])


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
                            deleteFunction={() => editAppointment(row)}
                            editFunction={() => editAppointment(row)}
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
                    console.log("props.cell.row.original", props.cell.row.original)
                    const { images } = props.cell.row.original;
                    if (!images)
                        return null
                    let ii = JSON.parse(images);
                    return (
                        <AvatarGroup
                            max={3}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                dispatch(manageLightBox({ visible: true, images: ii.map((x: Dictionary) => x.url), index: 0, descriptions: ii.map((x: Dictionary) => x.description) }))
                            }}
                        >
                            {ii.map((image: Dictionary, index: number) => (
                                <Avatar key={index} src={image.url} />
                            ))}
                        </AvatarGroup>
                    )
                }
            },
        ],
        []
    );

    const editAppointment = (row: Dictionary) => {
        setappointmentSelected(row);
        setOpenDialogAppointment(true);
    }

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            // dispatch(execute(insPatient(data)));
            dispatch(execute({
                header: insPatient({ ...data, medicalrecord: JSON.stringify({ ...record, otros: data.otros }) }),
                detail: dataAppointments.filter(x => !!x.operation).map(x => insertAppointment(x))
            }, true));
            setWaitSave(true)
        }

        dispatch(manageConfirmation({
            visible: true,
            question: t(langKeys.confirmation_save),
            callback
        }))
    });

    const exportData = () => {
        fetch(apiUrls.EXPORT_PATIENT_HISTORY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
                "key": "UFN_PATIENT_EXPORT_PDF",
                "method": "UFN_PATIENT_EXPORT_PDF",
                "parameters": {
                    "id": row?.patientid,
                    ...dataexport,
                    images: null
                }
            })
        })
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(res => {
                window.open(res.url, '_blank');
            })
    }

    return (
        <div style={{ width: '100%' }}>
            <TemplateBreadcrumbs
                breadcrumbs={arrayBread}
                handleClick={setViewSelected}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <TitleDetail
                    title={row ? `${row.firstname} ${row.lastname}` : "Nuevo paciente"}
                />
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
                <AntTab label="Ficha médica" />
                <AntTab label="Historia clínica" />
                <AntTab label="Citas" />
                <AntTab label="Informe médico" />
            </Tabs>
            <form id="form-patient" onSubmit={onSubmit}>
                {pageSelected === 0 &&
                    <div className={classes.containerDetail}>
                        <div className="row-zyx">
                            <FieldEdit
                                className="col-6"
                                label={t(langKeys.firstname)}
                                style={{ marginBottom: 8 }}
                                valueDefault={getValues('firstname')}
                                onChange={(value) => setValue('firstname', value)}
                                fregister={{
                                    onBlur: () => trigger('firstname')
                                }}
                                error={errors?.firstname?.message}
                            />
                            <FieldEdit
                                className="col-6"
                                label={t(langKeys.lastname)}
                                valueDefault={getValues('lastname')}
                                onChange={(value) => setValue('lastname', value)}
                                fregister={{
                                    onBlur: () => trigger('lastname')
                                }}
                                error={errors?.lastname?.message}
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldEdit
                                label={t(langKeys.email)}
                                className="col-6"
                                valueDefault={getValues('email')}
                                onChange={(value) => setValue('email', value)}
                                fregister={{
                                    onBlur: () => trigger('email')
                                }}
                                error={errors?.email?.message}
                            />
                            <FieldEdit
                                label={t(langKeys.phone)}
                                className="col-6"
                                valueDefault={getValues('phone')}
                                onChange={(value) => setValue('phone', value)}
                                fregister={{
                                    onBlur: () => trigger('phone')
                                }}
                                error={errors?.phone?.message}
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldSelect
                                label={t(langKeys.docType)}
                                className="col-6"
                                valueDefault={getValues('doctype')}
                                onChange={(value) => {
                                    setValue('doctype', value ? value.domainvalue : '');
                                    trigger('doctype');
                                }}
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
                                onBlur={() => trigger('docnum')}
                                error={errors?.docnum?.message}
                            />
                        </div>
                        <div className="row-zyx">
                            <div className="col-6" style={{ display: 'flex' }}>
                                <div style={{ width: "75%" }}>
                                    <FieldEdit
                                        label={"Fecha de nacimiento"}
                                        type="date"
                                        valueDefault={getValues('birthdate')}
                                        onChange={(value) => {
                                            setValue('birthdate', value);
                                            trigger("birthdate")
                                        }}
                                        error={errors?.birthdate?.message}
                                    />
                                </div>
                                <div style={{ width: "25%", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {calculateAge(getValues('birthdate'))} años
                                </div>
                            </div>
                            <FieldEdit
                                label={t(langKeys.address)}
                                className="col-6"
                                valueDefault={getValues('address')}
                                onChange={(value) => setValue('address', value)}
                                error={errors?.address?.message}
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldEdit
                                label={"Procedencia"}
                                className="col-6"
                                valueDefault={getValues('origin')}
                                onChange={(value) => setValue('origin', value)}
                                error={errors?.origin?.message}
                            />
                        </div>
                        <div className="row-zyx">
                            <FieldEdit
                                label="Nombre del contacto"
                                className="col-6"
                                valueDefault={getValues('contactname')}
                                onChange={(value) => setValue('contactname', value)}
                                error={errors?.contactname?.message}
                            />
                            <FieldEdit
                                label="Teléfono del contacto"
                                className="col-6"
                                valueDefault={getValues('contactphone')}
                                onChange={(value) => setValue('contactphone', value)}
                                error={errors?.contactphone?.message}
                            />
                        </div>
                    </div>
                }
                {pageSelected === 1 &&
                    <div className={classes.containerDetail}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Masa corporal</FormLabel>
                            <RadioGroup row aria-label="gender" name="gender1" value={record.peso || ""} onChange={(e) => setRecord((prev: Dictionary) => ({ ...prev, peso: e.target.value }))}>
                                <FormControlLabel value="Enflaquecido" control={<Radio color="primary" />} label="Enflaquecido" />
                                <FormControlLabel value="Normal" control={<Radio color="primary" />} label="Normal" />
                                <FormControlLabel value="Sobrepeso" control={<Radio color="primary" />} label="Sobrepeso" />
                                <FormControlLabel value="Obeso" control={<Radio color="primary" />} label="Obeso" />
                            </RadioGroup>
                        </FormControl>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                            <div style={{ color: "#B6B4BA", fontWeight: 400, fontSize: "1rem", fontFamily: "dm-sans" }}>Antecedentes mórbidos</div>
                            <div style={{ color: "#B6B4BA", fontWeight: 400, fontSize: "1rem", fontFamily: "dm-sans" }}>Exámenes de laboratorio</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {recordPatient.filter(x => x.includes("X-")).map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: 16 }}>
                                        <IOSSwitch checked={record[item.replace("X-", "")] || false} onChange={(e) => setRecord((prev: Dictionary) => ({ ...prev, [item.replace("X-", "")]: e.target.checked }))} name="checkedB" />
                                        <label >{item.replace("X-", "")}</label>
                                    </div>
                                ))}
                                <FieldEdit
                                    label="Otros"
                                    // className="col-6"
                                    valueDefault={getValues('otros')}
                                    onChange={(value) => setValue('otros', value)}
                                    error={errors?.otros?.message}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {recordPatient.filter(x => x.includes("Y-")).map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: 16 }}>
                                        <IOSSwitch checked={record[item.replace("Y-", "")] || false} onChange={(e) => setRecord((prev: Dictionary) => ({ ...prev, [item.replace("Y-", "")]: e.target.checked }))} name="checkedB" />
                                        <label >{item.replace("Y-", "")}</label>
                                    </div>
                                ))}
                            </div>
                            <div style={{ color: "#B6B4BA", fontWeight: 400, fontSize: "1rem", fontFamily: "dm-sans", marginTop: 16 }}>Imagenología</div>
                            <div></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {recordPatient.filter(x => x.includes("F-")).map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: 6, justifyContent: "space-between", alignItems: "center", border: "1px solid #e1e1e1", padding: 8, paddingRight: 4 }}>
                                        <div>
                                            <div>{item.replace("F-", "")}</div>
                                            <input
                                                name="file"
                                                accept="image/*"
                                                id={`upload_image${index}`}
                                                type="file"
                                                // value={record[item.replace("F-", "")]}
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    setUploadType(item.replace("F-", ""));
                                                    onSelectImage(e.target.files)
                                                }}
                                            />
                                            <label htmlFor={`upload_image${index}`}>
                                                <Button variant="contained" component="span" color="primary">
                                                    Subir imagen
                                                </Button>
                                            </label>
                                        </div>
                                        <div>
                                            {record[item.replace("F-", "")] && (
                                                <img
                                                    alt={"mg"}
                                                    src={record[item.replace("F-", "")]}
                                                    className={classes.boxImage2}
                                                    onClick={() => dispatch(manageLightBox({ visible: true, images: [record[item.replace("F-", "")]], index: 0 }))}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                }
                {pageSelected === 2 &&
                    <div className={classes.containerDetail}>
                        <div className='row-zyx'>
                            {recordPatient.filter(x => x.includes("H-")).map((item, index) => (
                                <div key={index} className="col-6">
                                    <FieldEdit
                                        label={item.replace("H-", "")}
                                        className="col-6"
                                        valueDefault={record[item.replace("H-", "")]}
                                        onChange={(value) => setRecord((prev: Dictionary) => ({ ...prev, [item.replace("H-", "")]: value }))}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {recordPatient.filter(x => x.includes("HI-")).map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: 6, justifyContent: "space-between", alignItems: "center", border: "1px solid #e1e1e1", padding: 8, paddingRight: 4 }}>
                                    <div>
                                        <div>{item.replace("HI-", "")}</div>
                                        <input
                                            name="file"
                                            accept="image/*"
                                            id={`upload_image${index}`}
                                            type="file"
                                            // value={record[item.replace("HI-", "")]}
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                setUploadType(item.replace("HI-", ""));
                                                onSelectImage(e.target.files)
                                            }}
                                        />
                                        <label htmlFor={`upload_image${index}`}>
                                            <Button variant="contained" component="span" color="primary">
                                                Subir imagen
                                            </Button>
                                        </label>
                                    </div>
                                    <div>
                                        {record[item.replace("HI-", "")] && (
                                            <img
                                                alt={"mg"}
                                                src={record[item.replace("HI-", "")]}
                                                className={classes.boxImage2}
                                                onClick={() => dispatch(manageLightBox({ visible: true, images: [record[item.replace("HI-", "")]], index: 0 }))}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                }
                {pageSelected === 3 &&
                    <div className={classes.containerDetail}>
                        <TableZyx
                            columns={columns}
                            data={dataAppointments}
                            download={true}
                            filterGeneral={false}
                            loading={resMainAux.loading}
                            register={true}
                            hoverShadow={true}
                            handleRegister={() => {
                                setappointmentSelected(null);
                                setOpenDialogAppointment(true);
                            }}
                        />
                    </div>
                }
                {pageSelected === 4 &&
                    <div className={classes.containerDetail}>
                        <div style={{ textAlign: 'right' }}>
                            <Button
                                variant='contained'
                                onClick={exportData}
                                color='primary'
                            >Exportar</Button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                            <FieldEdit
                                label={"Fecha de atención"}
                                className="col-6"
                                type="date"
                                valueDefault={dataexport["attention_date"]}
                                onChange={(value) => setdataexport({ ...dataexport, ["attention_date"]: value })}
                            />
                            <FieldEdit
                                label={"Fecha de exportación"}
                                className="col-6"
                                type="date"
                                valueDefault={dataexport["export_date"]}
                                onChange={(value) => setdataexport({ ...dataexport, ["export_date"]: value })}
                            />
                            <FieldEditMulti
                                label={"Motivo de consulta"}
                                className="col-6"
                                valueDefault={dataexport["reason_consultation"]}
                                onChange={(value) => setdataexport({ ...dataexport, ["reason_consultation"]: value })}
                            />
                            <FieldEditMulti
                                label={"Examen médico clínico"}
                                className="col-6"
                                valueDefault={dataexport["clinical_examination"]}
                                onChange={(value) => setdataexport({ ...dataexport, ["clinical_examination"]: value })}
                            />
                            <FieldEditMulti
                                label={"Impresión diagnóstica"}
                                className="col-6"
                                valueDefault={dataexport["diagnostic_printing"]}
                                onChange={(value) => setdataexport({ ...dataexport, ["diagnostic_printing"]: value })}
                            />
                            <FieldEditMulti
                                label={"Tratamiento"}
                                className="col-6"
                                valueDefault={dataexport["treatment"]}
                                onChange={(value) => setdataexport({ ...dataexport, ["treatment"]: value })}
                            />
                            <FieldEdit
                                label={"Pacientes y familiares"}
                                className="col-6"
                                valueDefault={dataexport["patients_relatives"]}
                                onChange={(value) => setdataexport({ ...dataexport, ["patients_relatives"]: value })}
                            />
                            <FieldEdit
                                label={"Paciente toleró el proc"}
                                className="col-6"
                                valueDefault={dataexport["patient_accept"]}
                                onChange={(value) => setdataexport({ ...dataexport, ["patient_accept"]: value })}
                            />
                            <FieldEdit
                                label={"Fecha descanso médico"}
                                className="col-6"
                                type="date"
                                valueDefault={dataexport["medical_leave_date"]}
                                onChange={(value) => setdataexport({ ...dataexport, ["medical_leave_date"]: value })}
                            />

                        </div>

                    </div>
                }
            </form>
            <DialogAppointment
                open={openDialogAppointment}
                setDataAppointments={setDataAppointments}
                setOpen={setOpenDialogAppointment}
                appointment={appointmentSelected}
            />
        </div>
    );
}

const Users: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector(state => state.main.mainData);
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
                            extraOption="Exportar PDF"
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
            {
                Header: "Siguiente cita",
                accessor: 'nextappointmentdate',
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
        fetch(apiUrls.EXPORT_PATIENT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
                "key": "UFN_PATIENT_APPOINTMENT_SEL",
                "method": "UFN_PATIENT_APPOINTMENT_SEL",
                "parameters": {
                    "all": true,
                    "id": row.patientid
                }
            })
        })
            .then(res => res.json())
            .catch(err => console.log(err))
            .then(res => {
                window.open(res.url, '_blank');
            })
    }

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected(row);
    }

    const handleDelete = (row: Dictionary) => {
        const callback = () => {
            dispatch(execute(insPatient({ ...row, medicalrecord: '', operation: 'DELETE', status: 'ELIMINADO', id: row.patientid })));
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
            <DetailPatient
                row={rowSelected}
                setViewSelected={setViewSelected}
                fetchData={fetchData}
            />
        )
}

export default Users;