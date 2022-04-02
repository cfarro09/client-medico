import React, { FC, useCallback, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dictionary, MultiData, IDistributor } from '@types';
import { AntTab, FieldEdit, FieldSelect, TemplateBreadcrumbs, TemplateIcons, TitleDetail } from 'components';
import { langKeys } from 'lang/keys';
import {
    getCollection, resetAllMain, getMultiCollection,
    execute, processLoad, uploadData
} from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
import TableZyx from 'components/fields/table-simple';
import { getDistributorSel, getValuesFromDomain, getVisitsSel, insDistributor, insVisits } from 'common/helpers';
import { useForm } from 'react-hook-form';
import { Button, IconButton, makeStyles, Tabs } from '@material-ui/core';
import {
    Save as SaveIcon,
    Clear as ClearIcon,
    PlayArrow as PlayArrowIcon,
    DeleteForever as DeleteForeverIcon
} from '@material-ui/icons';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';

const VisitPlanning: FC = () => {
    const [namesheet, setnamesheet] = useState('');

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector(state => state.main.mainData);
    const multiData = useSelector(state => state.main.multiData);
    const executeRes = useSelector(state => state.main.execute);

    const executeResult = useSelector(state => state.main.uploadData);
    const processDataResult = useSelector(state => state.main.processData);

    const [waitSave, setWaitSave] = useState(false);
    const [processSave, setProcessSave] = useState(false);
    const [pageSelected, setPageSelected] = useState(0);

    const [templateSelected, setTemplateSelected] = useState<Dictionary[]>([]);
    const [template, settemplate] = useState<Dictionary | null>(null);
    const [datatable, setdatatable] = useState<{ columns: Dictionary[], rows: Dictionary[] }>({
        columns: [],
        rows: []
    })

    const columns = React.useMemo(
        () => [
            {
                accessor: 'description',
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: '1%',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <div style={{ whiteSpace: 'nowrap', display: 'flex' }}>
                            {row.status === 'PENDIENTE' &&
                                <IconButton
                                    aria-label="more"
                                    aria-controls="long-menu"
                                    aria-haspopup="true"
                                    size="small"
                                    // onClick={() => triggerProcessLoad(row.massiveloadid)}
                                >
                                    <PlayArrowIcon style={{ color: '#B6B4BA' }} />
                                </IconButton>
                            }
                            {row.status === 'ACTIVO' &&
                                <IconButton
                                    aria-label="more"
                                    aria-controls="long-menu"
                                    aria-haspopup="true"
                                    size="small"
                                // onClick={editFunction}
                                    onClick={() => console.log(row.visitloadid)}
                                >
                                    <DeleteForeverIcon style={{ color: '#B6B4BA' }} />
                                </IconButton>
                            }
                        </div>
                    )
                }
            },
            {
                Header: 'ID carga',
                accessor: 'visitloadid',
                NoFilter: true
            },
            {
                Header: 'ESTADO',
                accessor: 'status',
                NoFilter: true
            },
            {
                Header: 'NUM REGISTROS',
                accessor: 'num_records',
                NoFilter: true
            },
            {
                Header: 'FECHA CREACION',
                accessor: 'createdate',
                NoFilter: true,
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return new Date(row.createdate).toLocaleString()
                }
            },
            {
                Header: 'REGISTRADO POR',
                accessor: 'createby',
                NoFilter: true
            },
        ],
        []
    );

    useEffect(() => {
        if (processSave) {
            if (!processDataResult.loading && !processDataResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: "Se procesó la carga con exito" }));
                // fetchData();
                dispatch(showBackdrop(false));
                setProcessSave(false);
            } else if (processDataResult.error) {
                const errormessage = t(processDataResult.code || "error_unexpected_error", { module: t(langKeys.corporation_plural).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setProcessSave(false);
            }
        }
    }, [processDataResult, processSave])

    const fetchData = () => dispatch(getCollection(getVisitsSel(0)));

    useEffect(() => {
        fetchData()
        return () => {
            dispatch(resetAllMain());
        };
    }, [])

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
                columnbd: "hour_start",
                columnbddesc: "Hora Inicio",
                obligatory: true,
                obligatorycolumn: true,
                selected: true,
                keyexcel: "INGRESO"
            },
            {
                columnbd: "hour_finish",
                columnbddesc: "Hora Salida",
                obligatory: true,
                obligatorycolumn: true,
                selected: true,
                keyexcel: "SALIDA"
            },
            {
                columnbd: "observations",
                columnbddesc: "Observaciones",
                obligatory: false,
                obligatorycolumn: false,
                selected: true,
                keyexcel: "OBSERVACIONES"
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
                columnbd: "tactical",
                columnbddesc: "Táctico",
                obligatory: true,
                obligatorycolumn: true,
                selected: true,
                keyexcel: "TÁCTICO"
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

    useEffect(() => {
        if (waitSave) {
            if (!executeRes.loading && !executeRes.error) {
                const error = executeRes.data?.[0]?.mensaje || ""
                console.log(error)

                if (!error) {
                    dispatch(showSnackbar({ show: true, success: true, message: 'Se subió la carga correctamente' }));
                    fetchData();
                    setPageSelected(1)
                    setnamesheet('')
                    setdatatable({
                        columns: [],
                        rows: []
                    })
                    dispatch(showBackdrop(false));
                    setWaitSave(false);
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
    }, [templateSelected])
    
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    const handlerinsertload = async () => {
        const data = JSON.stringify(datatable.rows)
        const callback = () => {
            console.log('aaaaaaaaaa')
            dispatch(execute(insVisits({data})));
            dispatch(showBackdrop(true));
            setWaitSave(true)
            // setProcessSave(true)
            // dispatch(showBackdrop(true));
            // setPageSelected(1)
            // setnamesheet('')
            // setdatatable({
            //     columns: [],
            //     rows: []
            // })
        }
        dispatch(manageConfirmation({
            visible: true,
            question: "¿Está seguro de procesar la carga?",
            callback
        }))

    }

    return (
        <div style={{ width: '100%' }}>
            <div style={{ marginBottom: 16 }}>
                <Tabs
                    value={pageSelected}
                    indicatorColor="primary"
                    variant="fullWidth"
                    style={{ borderBottom: '1px solid #EBEAED', backgroundColor: '#FFF', marginTop: 8 }}
                    textColor="primary"
                    onChange={(_, value) => setPageSelected(value)}
                >
                    <AntTab label="Registrar una carga" />
                    <AntTab label="Cargas" />
                </Tabs>
            </div>
            {pageSelected === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 8 }}>
                        {/* <FieldSelect
                            label={t(langKeys.template)}
                            style={{ width: '200px' }}
                            // loading={mainResult.loading}
                            optionValue="loadtemplateid"
                            optionDesc="description"
                            onChange={(value) => {
                                value ? setTemplateSelected(JSON.parse(value.json_detail)) : setTemplateSelected([])
                                setnamesheet('')
                                settemplate(value)
                            }}
                            data={multiData.data[0]?.data || []}
                        /> */}
                        <div></div>
                        {namesheet &&
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handlerinsertload}
                                startIcon={<SaveIcon color="secondary" />}
                                style={{ backgroundColor: "#55BD84" }}
                            >{t(langKeys.save)}
                            </Button>
                        }
                    </div>
                    {/* {templateSelected.length > 0 && ( */}
                    <div {...getRootProps()} style={{ backgroundColor: '#e9e9e9', border: '1px solid #e1e1e1', width: '100%', height: 100, padding: 16 }}>
                        <input {...getInputProps()} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                        <p>Arrastra o selecciona una carga excel...</p>
                        {namesheet && <p>Hoja seleccionada: {namesheet}</p>}
                    </div>

                    {/* )} */}
                    {namesheet &&
                        <TableZyx
                            columns={datatable.columns}
                            data={datatable.rows}
                            download={false}
                            filterGeneral={false}
                        />
                    }
                </div>
            )}
            {pageSelected === 1 && (
                <TableZyx
                    loading={mainResult.loading}
                    filterGeneral={true}
                    columns={columns}
                    data={mainResult.data}
                    download={false}
                />
            )}
        </div>
    )
}

export default VisitPlanning;