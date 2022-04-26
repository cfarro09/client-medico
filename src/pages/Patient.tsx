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

const recordPatient = [
    "Diabetes",
    "Hematocrito",
    "Hipertensión arteria",
    "Glicemia",
    "Cancer",
    "Hemoglobina",
    "Inmunodepresión",
    "VHS",
    "Tabaquismo",
    "Albuminemia",
    "Insuficiencia venos",
    "Creatinina",
    "Insuficiencia arteria",
    "HB Glicosilad",
    "Hipoglicemiantes",
    "Cultivos",
    "Antibióticos",
    "Corticosteroides",
    "Tratamiento anticoagulante",
]

const recordAppointment = [
    "Aspecto",
    "Diámetro",
    "Profundidad",
    "Cantidad exudado",
    "Calidad exudado",
    "Tejido esf/necrótico",
    "Tejido granulatorio",
    "Edema",
    "Dolor",
    "Piel circundante"
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
        register('observation', { validate: (value) => (value && value.length) ? "" : (t(langKeys.field_required) + "") });
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
            <div className="row-zyx">
                <FieldEdit
                    className="col-12"
                    label="Fecha próxima"
                    style={{ marginBottom: 8 }}
                    type="date"
                    valueDefault={getValues('nextappointmentdate')}
                    onChange={(value) => setValue('nextappointmentdate', value)}
                    error={errors?.nextappointmentdate?.message}
                />
            </div>
            <div className="row-zyx">
                <FieldEditMulti
                    className="col-12"
                    label="Diagnóstico"
                    style={{ marginBottom: 8 }}
                    valueDefault={getValues('observation')}
                    onChange={(value) => setValue('observation', value)}
                    error={errors?.observation?.message}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {recordAppointment.map((item, index) => (
                    <FormControl component="fieldset" key={index}>
                        <div>{item}</div>
                        <RadioGroup row aria-label="gender" name="gender1" value={record[item] || ""} onChange={(e) => setRecord((prev: Dictionary) => ({ ...prev, [item]: e.target.value }))}>
                            <FormControlLabel style={{ marginRight: 8 }} value="1" control={<Radio style={{ fontSize: 10 }} size='small' color="primary" />} label="1" />
                            <FormControlLabel style={{ marginRight: 8 }} value="2" control={<Radio style={{ fontSize: 10 }} size='small' color="primary" />} label="2" />
                            <FormControlLabel style={{ marginRight: 8 }} value="3" control={<Radio style={{ fontSize: 10 }} size='small' color="primary" />} label="3" />
                            <FormControlLabel style={{ marginRight: 8 }} value="4" control={<Radio style={{ fontSize: 10 }} size='small' color="primary" />} label="4" />
                            <FormControlLabel style={{ marginRight: 8 }} value="5" control={<Radio style={{ fontSize: 10 }} size='small' color="primary" />} label="5" />
                        </RadioGroup>
                    </FormControl>
                ))}
            </div>
        </DialogZyx>
    )
}

const DetailUsers: React.FC<DetailProps> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const resMainAux = useSelector(state => state.main.mainAux);
    const [dataAppointments, setDataAppointments] = useState<Dictionary[]>([])

    const [pageSelected, setPageSelected] = useState(0);

    const [openDialogAppointment, setOpenDialogAppointment] = useState(false);
    const [appointmentSelected, setappointmentSelected] = useState<Dictionary | null>(null);
    const [record, setRecord] = useState((row?.medicalrecord && row?.medicalrecord?.length > 20) ? JSON.parse(row.medicalrecord) : {
        "peso": "",
        "Diabetes": false,
        "Hematocrito": false,
        "Hipertensión arteria": false,
        "Glicemia": false,
        "Cancer": false,
        "Hemoglobina": false,
        "Inmunodepresión": false,
        "VHS": false,
        "Tabaquismo": false,
        "Albuminemia": false,
        "Insuficiencia venos": false,
        "Creatinina": false,
        "Insuficiencia arteria": false,
        "HB Glicosilad": false,
        "Hipoglicemiantes": false,
        "Cultivos": false,
        "Antibióticos": false,
        "Corticosteroides": false,
        "Tratamiento anticoagulante": false,
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
        }
    });

    useEffect(() => {
        if (!resMainAux.loading && !resMainAux.error) {
            setDataAppointments(resMainAux.data)
        }
    }, [resMainAux])

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
                Header: "Diagnóstico",
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
                header: insPatient({ ...data, medicalrecord: JSON.stringify(record) }),
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
                <AntTab label="Citas" />
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
                            <FieldEdit
                                label={"Fecha de nacimiento"}
                                className="col-6"
                                type="date"
                                valueDefault={getValues('birthdate')}
                                onChange={(value) => setValue('birthdate', value)}
                                error={errors?.birthdate?.message}
                            />
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                            <div style={{ color: "#B6B4BA", fontWeight: 400, fontSize: "1rem", fontFamily: "dm-sans" }}>Antecedentes mórbidos</div>
                            <div style={{ color: "#B6B4BA", fontWeight: 400, fontSize: "1rem", fontFamily: "dm-sans" }}>Exámenes</div>
                            {recordPatient.map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: 16 }}>
                                    <IOSSwitch checked={record[item] || false} onChange={(e) => setRecord((prev: Dictionary) => ({ ...prev, [item]: e.target.checked }))} name="checkedB" />
                                    <label >{item}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                }
                {pageSelected === 2 &&
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
        fetch('http://54.209.220.118:6066/api/export/generarpdfpaciente', {
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
            <DetailUsers
                row={rowSelected}
                setViewSelected={setViewSelected}
                fetchData={fetchData}
            />
        )
}

export default Users;