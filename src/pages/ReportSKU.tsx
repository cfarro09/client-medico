/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, Fragment, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import { DateRangePicker } from 'components';
import { getCorpSel, selShippingOrder, getValuesFromDomain, insOrg, selReportControlSKU, getDateCleaned } from 'common/helpers';
import { Dictionary } from "@types";
import TableZyx from '../components/fields/table-simple';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { useForm } from 'react-hook-form';
import { getCollection, getMultiCollection, exportData, resetAllMain } from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
import { Range } from 'react-date-range';
import { CalendarIcon, DownloadIcon } from 'icons';
import SearchIcon from '@material-ui/icons/Search';

const initialRange = {
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    key: 'selection'
}

const useStyles = makeStyles((theme) => ({
    containerFilters: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: theme.spacing(1),
        marginTop: theme.spacing(1),
        backgroundColor: '#FFF',
        padding: theme.spacing(2),
    },
    itemFilter: {
        flex: '0 0 220px',
    },
    itemDate: {
        minHeight: 40,
        height: 40,
        border: '1px solid #bfbfc0',
        borderRadius: 4,
        color: 'rgb(143, 146, 161)'
    },
    itemFlex: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(1),
    }
}));


const ReportControl: FC = () => {
    const classes = useStyles()
    const dispatch = useDispatch();
    // const ressignup = useSelector(state => state.signup.currencyList);
    const { t } = useTranslation();
    const mainResult = useSelector(state => state.main);
    const exportResult = useSelector(state => state.main.exportData);

    const [openDateRange, setOpenDateRange] = useState(false);
    const [dateRange, setdateRange] = useState<Range>(initialRange);

    const columns = React.useMemo(
        () => [
            {
                Header: 'Cliente',
                accessor: 'cliente'
            },
            {
                Header: 'N° guia',
                accessor: 'guide_number'
            },
            {
                Header: 'Estado pedido',
                accessor: 'estado_envio'
            },
            {
                Header: 'Fecha pedido',
                accessor: 'fecha_guia',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return !row.fecha_guia ? '' : new Date(row.fecha_guia).toLocaleString()
                }
            },
            {
                Header: 'Fecha envío',
                accessor: 'fecha_envio',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return !row.fecha_envio ? '' : new Date(row.fecha_envio).toLocaleString()
                }
            },
            {
                Header: 'Conductor',
                accessor: 'driver_name'
            },
            {
                Header: 'Vehiculo',
                accessor: 'vehicle_type'
            },
            {
                Header: 'Placa',
                accessor: 'plate_number'
            },
            {
                Header: 'Proveedor',
                accessor: 'provider'
            },
            {
                Header: 'Último estado',
                accessor: 'ult_estado'
            },
            {
                Header: 'Cliente',
                accessor: 'client_name'
            },
            {
                Header: 'Teléfono 1',
                accessor: 'client_phone1'
            },
            {
                Header: 'Teléfono 2',
                accessor: 'client_phone2'
            },
            {
                Header: 'Dirección',
                accessor: 'address'
            },
            {
                Header: 'Departamento',
                accessor: 'department'
            },
            {
                Header: 'Provincia',
                accessor: 'province'
            },
            {
                Header: 'Distrito',
                accessor: 'district'
            },
            {
                Header: 'Zona',
                accessor: 'zone_type'
            },
            {
                Header: 'Fecha asignado',
                accessor: 'fecha_asignado',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return !row.fecha_asignado ? '' : new Date(row.fecha_asignado).toLocaleString()
                }
            },
            {
                Header: 'Ult fecha estado',
                accessor: 'ultfecha_estado'
            },
            {
                Header: 'VISITA 1',
                accessor: 'fecha_visita1',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return !row.fecha_visita1 ? '' : new Date(row.fecha_visita1).toLocaleString()
                }
            },
            {
                Header: 'RESULTADO 1',
                accessor: 'visita1_status'
            },
            {
                Header: 'VISITA 2',
                accessor: 'fecha_visita2',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return !row.fecha_visita2 ? '' : new Date(row.fecha_visita2).toLocaleString()
                }
            },
            {
                Header: 'RESULTADO 2',
                accessor: 'visita2_status'
            },
            {
                Header: 'VISITA 3',
                accessor: 'fecha_visita3',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return !row.fecha_visita3 ? '' : new Date(row.fecha_visita3).toLocaleString()
                }
            },
            {
                Header: 'RESULTADO 3',
                accessor: 'visita3_status'
            },
            {
                Header: 'CANT VISITAS',
                accessor: 'cantidad_visitas'
            },
            {
                Header: 'NRO IMAGENES',
                accessor: 'nro_imagenes'
            },
        ],
        []
    );

    const fetchData = () => dispatch(getCollection(selReportControlSKU(getDateCleaned(dateRange.startDate!!), getDateCleaned(dateRange.endDate!!))));

    useEffect(() => {
        fetchData();
        // dispatch(getCurrencyList())
        dispatch(getMultiCollection([
            getValuesFromDomain("ESTADOGENERICO"),
            getValuesFromDomain("TIPOORG"),
            getCorpSel(0)
        ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    const onExport = () => {
        dispatch(exportData(selReportControlSKU(getDateCleaned(dateRange.startDate!), getDateCleaned(dateRange.endDate!)), "", "excel", true));
    }

    useEffect(() => {
        if (!exportResult.loading && !exportResult.error && exportResult.url) {
            window.open(exportResult.url, '_blank');
        } else if (exportResult.error) {
            const errormessage = t(exportResult.code || "error_unexpected_error")
            dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
        }
    }, [exportResult])

    const onSearch = () => {
        fetchData();
    }

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 500, fontSize: 20, marginBottom: 15 }}>Reporte de control SKU</div>
            <div className={classes.itemFlex}>
                <DateRangePicker
                    open={openDateRange}
                    setOpen={setOpenDateRange}
                    range={dateRange}
                    onSelect={setdateRange}
                >
                    <Button
                        className={classes.itemDate}
                        startIcon={<CalendarIcon />}
                        onClick={() => setOpenDateRange(!openDateRange)}
                    >
                        {getDateCleaned(dateRange.startDate!) + " - " + getDateCleaned(dateRange.endDate!)}
                    </Button>
                </DateRangePicker>
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SearchIcon style={{ color: 'white' }} />}
                        style={{ backgroundColor: '#55BD84', width: 120 }}
                        onClick={() => onSearch()}
                    >
                        {t(langKeys.search)}
                    </Button>
                </div>
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onExport()}
                        // onClick={() => exportExcel(String(titlemodule) + "Report", data, columns.filter((x: any) => (!x.isComponent && !x.activeOnHover)))}
                        startIcon={<DownloadIcon />}
                    >{t(langKeys.download)}
                    </Button>
                </div>
            </div>
            <TableZyx
                columns={columns}
                // titlemodule="Manifiestos"
                data={mainResult.mainData.data.map((x: Dictionary) => ({ ...x, drivername: `${x.first_name} ${x.last_name}` }))}
                download={false}
                filterGeneral={false}
                loading={mainResult.mainData.loading}
                register={false}
            />
        </div>
    )
}

export default ReportControl;