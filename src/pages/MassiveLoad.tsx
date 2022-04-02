/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState, useCallback } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import { FieldSelect, AntTab } from 'components';
import { getCollection, uploadData, getMultiCollection, resetAllMain, processLoad } from 'store/main/actions';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { getTemplates, getMassiveLoads } from 'common/helpers';
import { Dictionary } from "@types";
import TableZyx from '../components/fields/table-simple';
import SaveIcon from '@material-ui/icons/Save';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone'
import { langKeys } from 'lang/keys';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
// import { FileUploader } from "react-drag-drop-files";
import * as XLSX from 'xlsx';
import { IconButton, Tabs } from '@material-ui/core';
const MassiveLoad: FC = () => {
    const [namesheet, setnamesheet] = useState('');

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector(state => state.main.mainData);
    const multiData = useSelector(state => state.main.multiData);

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
                accessor: 'clientid',
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
                                    onClick={() => triggerProcessLoad(row.massiveloadid)}
                                >
                                    <PlayArrowIcon style={{ color: '#B6B4BA' }} />
                                </IconButton>
                            }
                            {row.status === 'PENDIENTE' &&
                                <IconButton
                                    aria-label="more"
                                    aria-controls="long-menu"
                                    aria-haspopup="true"
                                    size="small"
                                // onClick={editFunction}
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
                accessor: 'massiveloadid',
                NoFilter: true
            },
            {
                Header: 'N° REGISTROS',
                accessor: 'number_records',
                NoFilter: true,
                type: 'number'
            },
            {
                Header: 'ESTADO',
                accessor: 'status',
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
                fetchData();
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

    const fetchData = () => dispatch(getCollection(getMassiveLoads()));

    useEffect(() => {
        fetchData();
        dispatch(getMultiCollection([
            getTemplates()
        ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: 'Se subió la carga con ID ' + executeResult.data.massiveloadid }));
                fetchData();
                dispatch(showBackdrop(false));
                setWaitSave(false);
            } else if (executeResult.error) {
                const errormessage = t(executeResult.code || "error_unexpected_error", { module: t(langKeys.corporation_plural).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeResult, waitSave])

    const onDrop = useCallback(acceptedFiles => {
        const selectedFile = acceptedFiles[0];
        var reader = new FileReader();

        reader.onload = (e: any) => {
            var data = e.target.result;
            let workbook = XLSX.read(data, { type: 'binary' });
            const wsname = workbook.SheetNames[0];
            setnamesheet(wsname)
            let rowsx = XLSX.utils.sheet_to_json(
                workbook.Sheets[wsname]
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
        dispatch(uploadData({
            data: datatable.rows,
            loadtemplateid: template?.loadtemplateid
        }))
        setWaitSave(true)
        dispatch(showBackdrop(true));
    }

    const triggerProcessLoad = (id: number) => {
        const callback = () => {
            dispatch(processLoad({
                massiveloadid: id
            }))
            setProcessSave(true)
            dispatch(showBackdrop(true));
        }
        dispatch(manageConfirmation({
            visible: true,
            question: "¿Está seguro de procesar la carga " + id + "?",
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
                        <FieldSelect
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
                        />
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
                    {templateSelected.length > 0 && (
                        <div {...getRootProps()} style={{ backgroundColor: '#e9e9e9', border: '1px solid #e1e1e1', width: '100%', height: 100, padding: 16 }}>
                            <input {...getInputProps()} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                            <p>Arrastra o selecciona una carga excel...</p>
                            {namesheet && <p>Hoja seleccionada: {namesheet}</p>}
                        </div>

                    )}
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

export default MassiveLoad;