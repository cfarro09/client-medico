/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, Fragment, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import { DateRangePicker } from 'components';
import { getCorpSel, selShippingOrder, getValuesFromDomain, insOrg, selReportControlProvider, getDateCleaned } from 'common/helpers';
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
                accessor: 'numero_guia'
            },
            {
                Header: 'Estado pedido',
                accessor: 'estado_pedido'
            },
            {
                Header: 'Fecha pedido',
                accessor: 'fecha_pedido',
            },
            {
                Header: 'Fecha envío',
                accessor: 'fecha_envio',
            },
            {
                Header: 'Conductor',
                accessor: 'nombre_conductor'
            },
            {
                Header: 'Vehiculo',
                accessor: 'tipo_vehiculo'
            },
            {
                Header: 'Placa',
                accessor: 'nro_placa'
            },
            {
                Header: 'Proveedor',
                accessor: 'proveedor'
            },
            {
                Header: 'Último estado',
                accessor: 'ultimo_estado'
            },
            {
                Header: 'Cliente',
                accessor: 'nombre_cliente'
            },
            {
                Header: 'Teléfono 1',
                accessor: 'telefono_1'
            },
            {
                Header: 'Teléfono 2',
                accessor: 'telefono_2'
            },
            {
                Header: 'Dirección',
                accessor: 'direccion'
            },
            {
                Header: 'Departamento',
                accessor: 'departamento'
            },
            {
                Header: 'Provincia',
                accessor: 'provincia'
            },
            {
                Header: 'Distrito',
                accessor: 'distrito'
            },
            {
                Header: 'Fecha asignado',
                accessor: 'fecha_asignado'
            },
            {
                Header: 'Ult fecha estado',
                accessor: 'ultfecha_estado'
            },
            {
                Header: 'Estado descarga',
                accessor: 'estado_descarga'
            },
            {
                Header: 'Observaciones',
                accessor: 'observaciones'
            },

            {
                Header: 'Visita',
                accessor: 'visita'
            },

        ],
        []
    );

    const fetchData = () => dispatch(getCollection(selReportControlProvider(getDateCleaned(dateRange.startDate!!), getDateCleaned(dateRange.endDate!!))));

    useEffect(() => {
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    const onExport = () => {
        dispatch(exportData(selReportControlProvider(getDateCleaned(dateRange.startDate!), getDateCleaned(dateRange.endDate!)), "", "excel", true));
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
            <div style={{ fontWeight: 500, fontSize: 20, marginBottom: 15 }}>Reporte de control proveedor</div>
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