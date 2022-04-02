import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { useDispatch } from 'react-redux';
import { Dictionary, IDistributor } from '@types';
import { execute, getMultiCollectionAux } from 'store/main/actions';
import { DialogZyx, FieldEdit, FieldSelect } from 'components';
import { Button, Checkbox, CircularProgress, Divider, Fab } from '@material-ui/core';
import { getClientLst, insVisitsNew, reassignVisitUser } from 'common/helpers';
import TableZyx from 'components/fields/table-simple';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Autorenew, Add, Delete as DeleteIcon } from '@material-ui/icons';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import IconButton from '@material-ui/core/IconButton';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';

const serviceType = [{value:'MERCADERISMO'},{value:'IMPULSADOR'}]

interface CreateVisitModalProps {
    fetchData: () => void;
    setOpenModal: (param: any) => void;
    openModal: boolean;
    rowWithDataSelected: Dictionary[],
    userData: Dictionary[],
    allParameters: Dictionary,
}

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
    modal_content: {

    },
    px2: {
        padding: '0px 21px'
    },
    mt2: {
        marginTop: '1.2rem'
    },
    px5: {
        paddingRight: '4rem',
        paddingLeft: '4rem'
    },
    mb2: {
        marginBottom: '21px'
    },
    mb1: {
        marginBottom: '11px'
    },
    pb2: {
        paddingBottom: '21px'
    },
    modal_body: {
        padding: '.8rem 1.4rem'
    },
    modal_detail: {
        padding: '.8rem 1.4rem',
        height: '500px',
        overflow: 'auto'
    },
    text_center: {
        textAlign: 'center',
    },
    pt50: {
        paddingT: '0.5rem',
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: '14px',
        textTransform: 'initial',
        width: '60%'
    },
    table: {
        width: '100%',
        '& thead': {
            background: '#dddddd'
        },
        '& thead th': {
            padding: '7px'
        },
        '& tbody td': {
            fontSize: '13px'
        }
    },
    tableNoBorder: {
        '& tr td': {
            border: 0
        }
    },
    tabRoot: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        '& header': {
            // background: 'red'
        },
        '& #simple-tabpanel-0 > div, #simple-tabpanel-1 > div': {
            padding: '12px'
        }
    },
    modal_header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '0px 150px'
    },
    modal_add: {
        width: '40%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    modal_drop_zone: {
        width: '40%',
        cursor: 'pointer'
    },
    drop_zone: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#f8f8f8',
        border: '1px dashed #7367f0',
        borderRadius: '.357rem',
        minHeight: '170px',
        width: '100%',
        height: 100,
        padding: 16
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    row_test: {
        '& .col-*': {
            marginBottom: '10px'
        }
    },
    row_button: {
        '& button': {
            padding: '10px 10px 10px 10px'
        }
    }
}));

const CreateVisitModal: React.FC<CreateVisitModalProps> = ({ setOpenModal, openModal, rowWithDataSelected, fetchData, userData, allParameters}) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const multiResultAux = useSelector(state => state.main.multiDataAux);
    const [filterUser, setFilterUser] = useState<Dictionary[]>([]);
    const [dataClient, setDataClient] = useState<Dictionary[]>([]);
    const [namesheet, setnamesheet] = useState('');
    const [templateSelected, setTemplateSelected] = useState<Dictionary[]>([]);
    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const [datatable, setdatatable] = useState<{ columns: Dictionary[], rows: Dictionary[] }>({
        columns: [],
        rows: []
    })

    useEffect(() => {
        if (openModal) {
            dispatch(getMultiCollectionAux([getClientLst()]));
        }
    }, [openModal])

    useEffect(() => {
        if (!multiResultAux.loading && !multiResultAux.error) {
            const found = multiResultAux.data.find(x => x.key === 'QUERY_CLIENT_LST');
            if (found) {
                setDataClient(found.data)
            }
        }
    }, [multiResultAux]);

    useEffect(() => {
        if (waitSave) {
            if (!executeRes.loading && !executeRes.error) {
                const error = executeRes.data?.[0]?.mensaje || ""
                console.log(error)

                if (!error) {
                    dispatch(showSnackbar({ show: true, success: true, message: 'Se subió la carga correctamente' }));
                    fetchData();
                    setnamesheet('')
                    setdatatable({
                        columns: [],
                        rows: []
                    })
                    dispatch(showBackdrop(false));
                    setWaitSave(false);
                    reset({})
                    setOpenModal(false)
                } else {
                    dispatch(showSnackbar({ show: true, success: false, message: error.replace(/#BREAK#/gi, "\n") }))
                    dispatch(showBackdrop(false));
                    setWaitSave(false);
                }
            } else if (executeRes.error) {
                const errormessage = t(executeRes.code || "error_unexpected_error", { module: t(langKeys.corporation_plural).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeRes, waitSave])


    useEffect(() => {
        if (userData.length !== 0) {
            setFilterUser(userData)
        }
    },[userData])
    
    useEffect(() => {
        setTemplateSelected([
            {
                columnbd: "customerid",
                columnbddesc: "Codigo Cliente",
                obligatory: true,
                obligatorycolumn: true,
                selected: true,
                keyexcel: "COD-LIVE"
            },
            {
                columnbd: "visit_date",
                columnbddesc: "Fecha Visita",
                obligatory: true,
                obligatorycolumn: true,
                selected: true,
                keyexcel: "FECHA"
            },
            {
                columnbd: "service",
                columnbddesc: "Servicio",
                obligatory: true,
                obligatorycolumn: true,
                selected: true,
                keyexcel: "SERVICIO"
            },
            {
                columnbd: "docnum",
                columnbddesc: "Dni",
                obligatory: true,
                obligatorycolumn: true,
                selected: true,
                keyexcel: "DNI"
            }
        ])
    }, []);

    const { register, control, getValues, setValue, handleSubmit, reset, trigger, formState: { errors } } = useForm();
    const { fields, append, remove,  update: fieldUpdate } = useFieldArray({
        control,
        name: "items"
    });

    const getUserFiltered = (userData:Dictionary, i:number) => {
        console.log('aca');
        const serviceSelected = (getValues(`items.${i}.service`) === 'IMPULSADOR') ? 6 : 5

        return userData.filter((x:any) => x.roleid === serviceSelected ) as Dictionary[]
    }

    const onDrop = useCallback(acceptedFiles => {
        const selectedFile = acceptedFiles[0];
        var reader = new FileReader();

        reader.onload = (e: any) => {
            var data = e.target.result;
            let workbook = XLSX.read(data, { type: 'binary', cellDates: true, dateNF: 'yyyy-mm-dd;@' });
            const wsname = workbook.SheetNames[0];
            setnamesheet(wsname)
            let rowsx = XLSX.utils.sheet_to_json(
                workbook.Sheets[wsname],
                {raw: false}
            );
            const listtransaction = [];

            try {
                if (rowsx instanceof Array) {
                    for (let i = 0; i < rowsx.length; i++) {
                        const r = rowsx[i];
                        const datarow: Dictionary = {};

                        for (const [key, value] of Object.entries(r)) {
                            const keycleaned = key;

                            const dictionarykey = templateSelected.find(k => keycleaned.toLocaleLowerCase() === k.keyexcel.toLocaleLowerCase());

                            if (dictionarykey) {
                                if (dictionarykey.obligatory && !value) {
                                    throw `La fila ${i}, columna ${key} está vacia.`;
                                }
                                if (dictionarykey.columnbd === 'service' && !['IMPULSADOR', 'MERCADERISMO'].includes(''+value)) {
                                    throw `La fila ${i+2}, columna ${key} es invalida.`;
                                }
                                datarow[dictionarykey.columnbd] = value;
                            }

                        }
                        let columnerror = "";
                        const completed = templateSelected.filter(x => x.obligatory === true).every(j => {
                            if (datarow[j.columnbd])
                                return true
                            columnerror = j.keyexcel;
                            return false
                        });

                        if (!completed)
                            throw `La fila ${i + 1}, no tiene las columnas obligatorias(${columnerror}).`;

                        datarow['visit_date'] = datarow['visit_date'].split("/").map((s:any) => s.padStart(2,'0')).reverse().join("-");
                        
                        let findUser = filterUser.filter( i => i.docnum === datarow['docnum'])[0];
                        datarow['userid'] = (findUser) ? findUser.userid : 0;

                        listtransaction.push(datarow);
                    }
                }
                let columnstoload: Dictionary[] = templateSelected.map(k => ({ Header: k.keyexcel.toLocaleUpperCase(), accessor: k.columnbd, NoFilter: true }));
                setdatatable({
                    columns: columnstoload,
                    rows: listtransaction
                })
                // setisload(true);
            } catch (e) {
                dispatch(showSnackbar({ show: true, success: false, message: e + "" }))
                setnamesheet('')
                setdatatable({
                    columns: [],
                    rows: []
                })
            }
        };
        reader.readAsBinaryString(selectedFile)
    }, [templateSelected, filterUser])

    useEffect(() => {
        if (datatable.rows.length) {
            reset({})
            append(datatable.rows.map(item => ({userid: item.userid, visit_date: item.visit_date, service: item.service, customerid: item.customerid})))
        }
    }, [datatable])

    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    const onSubmit = handleSubmit((dataForm) => {
        if (!getValues().items.length) return
        const complete_data = getValues().items.map((x:any) => ({...x, hour_start: '08:00:00', hour_finish: '16:45:00', observations: '', tactical: 'NO'}))
        const data = JSON.stringify(complete_data)
        
        const callback = () => {
            dispatch(execute(insVisitsNew({data})));
            dispatch(showBackdrop(true));
            setWaitSave(true)
        }
        dispatch(manageConfirmation({
            visible: true,
            question: "¿Está seguro de procesar la carga?",
            callback
        }))
    })

    const handleClose = () => {
        reset({})
        setOpenModal(false)
    }

    return (
        <DialogZyx
            open={openModal}
            title=""
            buttonText1={t(langKeys.save)}
            buttonText2={t(langKeys.cancel)}
            handleClickButton1={onSubmit}
            handleClickButton2={handleClose}
            button1Type="submit"
            maxWidth={'lg'}
        >
            <div>
                {multiResultAux.loading ? (
                    <div style={{ textAlign: 'center' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <div className='modal_content'>
                        <div className={[classes.pb2, classes.px5, classes.modal_body].join(' ')}>
                            <div className={[classes.text_center, classes.mb1].join(' ')}>
                                <h2 className='mb1'>Crear visitas</h2>
                            </div>
                            <div className={[classes.modal_header].join(' ')}>
                                <div className={[classes.modal_add].join(' ')}>
                                    <Button
                                            className={classes.button}
                                            variant="contained"
                                            color="primary"
                                            endIcon={<Add color="secondary" />}
                                            style={{ backgroundColor: "#303F9F", borderRadius: '4px' }}
                                            onClick={() => append(
                                                {
                                                    userid: allParameters['userid'] || 0,
                                                    customerid: '',
                                                    service: allParameters['service'] ? ( allParameters['service'] === 6 ) ? 'IMPULSADOR' : 'MERCADERISMO' : '',
                                                    visit_date: new Date(new Date().getTime() - 300*60*1000).toISOString().split('T')[0]
                                                })}
                                    >{'Agregar item'}
                                    </Button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <h4>o</h4>
                                </div>
                                <div className={[classes.modal_drop_zone].join(' ')}>
                                    <div {...getRootProps()} className={[classes.drop_zone].join(' ')}>
                                        <input {...getInputProps()} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                                        <img src="https://i.ibb.co/x3tx7v6/upload.png" width='80' alt="" />
                                        <h4 style={{textAlign:'center'}}>Arrastra o selecciona una carga excel</h4>
                                        {namesheet && <p style={{margin:0}}>Hoja seleccionada: {namesheet}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Divider />
                        <div className={[classes.modal_detail].join(' ')}>
                            <h3>Detalle de las visitas</h3>
                            { fields.map( (item, i) => (
                                <div className={[classes.row_test, "row-zyx"].join(' ')} key={item.id} style={{marginBottom: 0}}>
                                    <FieldEdit
                                        fregister={{
                                            ...register(`items.${i}.visit_date`, {
                                                validate: (value: any) => (value && value.length) || t(langKeys.field_required)
                                            })
                                        }}
                                        className="col-2"
                                        size='small'
                                        type='date'
                                        variant='outlined'
                                        valueDefault={getValues(`items.${i}.visit_date`)}
                                        onChange={(value) => setValue(`items.${i}.visit_date`, value)}
                                        error={errors?.items?.[i]?.visit_date?.message}
                                    />
                                    <FieldSelect
                                        fregister={{
                                            ...register(`items.${i}.customerid`, {
                                                validate: (value: any) => (value && value.length) || t(langKeys.field_required)
                                            })
                                        }}
                                        label={'COD-LIVE'}
                                        className="col-3"
                                        valueDefault={getValues(`items.${i}.customerid`) || ''}
                                        onChange={(value) => setValue(`items.${i}.customerid`, value ? value.code : '')}
                                        uset={true}
                                        variant="outlined"
                                        size='small'
                                        data={dataClient}
                                        optionDesc="description"
                                        optionValue="code"
                                        error={errors?.items?.[i]?.customerid?.message}
                                    />
                                    <FieldSelect
                                        fregister={{
                                            ...register(`items.${i}.service`, {
                                                validate: (value: any) => (value && value.length) || t(langKeys.field_required)
                                            })
                                        }}
                                        label={t(langKeys.type_service)}
                                        className="col-2"
                                        // disabled={mainMultiResult.loading}
                                        valueDefault={getValues(`items.${i}.service`)}
                                        onChange={(value) => {
                                            // fieldUpdate(i, { ...fields[i], userid: 0 })
                                            // fieldUpdate(i, { ...fields[i], service: value ? value.value : '' })
                                            // fieldUpdate(i, { ...fields[i], userid: 0 })
                                            
                                            setValue(`items.${i}.userid`, 0)
                                            setValue(`items.${i}.service`, value ? value.value : '')
                                            trigger([`items.${i}.userid`])
                                        }}
                                        uset={true}
                                        variant="outlined"
                                        size='small'
                                        data={serviceType}
                                        optionDesc="value"
                                        optionValue="value"
                                        error={errors?.items?.[i]?.service?.message}
                                    />
                                    <FieldSelect
                                        fregister={{
                                            ...register(`items.${i}.userid`, {
                                                validate: (value: any) => (value && value > 0) || t(langKeys.field_required)
                                            })
                                        }}
                                        disabled={!getValues(`items.${i}.service`)}
                                        label={t(langKeys.user)}
                                        className="col-4"
                                        valueDefault={getValues(`items.${i}.userid`) || 0}
                                        onChange={(value) => setValue(`items.${i}.userid`, value ? value.userid : 0)}
                                        uset={true}
                                        variant="outlined"
                                        size='small'
                                        data={getUserFiltered(userData, i)}
                                        optionDesc="description"
                                        optionValue="userid"
                                        error={errors?.items?.[i]?.userid?.message}
                                    />
                                    <div className={[classes.row_button, "col-1"].join(' ')}>
                                        <IconButton
                                            aria-label="delete"
                                            style={{color: '#dd0054'}}
                                            onClick={() => remove(i)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </div>
                                </div>
                            
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DialogZyx>
    )
}

export default CreateVisitModal;