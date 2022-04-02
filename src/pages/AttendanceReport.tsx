import React, { FC, Fragment, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dictionary, IAssistanceReport } from '@types';
import { DateRangePicker, FieldSelect, TemplateIcons } from 'components';
import { langKeys } from 'lang/keys';
import {
    getCollection, resetAllMain, getMultiCollection,
} from 'store/main/actions';
import TableZyx from 'components/fields/table-simple';
import { getAssistanceSel2, getClientLst, getDateCleaned, getMarketSel, getTypeUserSel, getUserLst, getVisitUserSel } from 'common/helpers';
import { AppBar, Avatar, Box, Button, Divider, Drawer, makeStyles, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Typography } from '@material-ui/core';
import { Range } from 'react-date-range';
import {
    Save as SaveIcon,
    Clear as ClearIcon,
    Search as SearchIcon
} from '@material-ui/icons';
import { CalendarIcon } from 'icons';
import Lightbox from "react-image-lightbox";
import { TabPanel } from '@material-ui/lab';


interface RowSelected {
    row: Dictionary | null,
    edit: boolean
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
  }

const drawerWidth = 600;
const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%'
    },
    containerDetails: {
        marginTop: theme.spacing(3)
    },
    media: {
        objectFit: "contain"
    },
    containerSearch: {
        width: '100%',
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'center',
        [theme.breakpoints.up('sm')]: {
            width: '50%',
        },
    },
    containerFilter: {
        width: '100%',
        marginBottom: theme.spacing(2),
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap'
    },
    filterComponent: {
        minWidth: '220px',
        maxWidth: '320px',
    },
    filterComponent2: {
        width: '400px'
    },
    containerFilterGeneral: {
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: theme.spacing(1),
    },
    title: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: theme.palette.text.primary,
    },
    containerHeader: {
        display: 'block',
        marginBottom: 0,
        [theme.breakpoints.up('sm')]: {
            display: 'flex',
        },
    },
    // mb2: {
    //     marginBottom: theme.spacing(4),
    // },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: '14px',
        textTransform: 'initial'
    },
    itemDate: {
        minHeight: 40,
        height: 40,
        border: '1px solid #bfbfc0',
        borderRadius: 4,
        color: 'rgb(143, 146, 161)'
    },
    contentHeader: {
        
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawer_header: {
        padding: '14px 21px 0 21px'
    },
    hr: {
        margin: '14px 0'
    },
    px2: {
        padding: '0px 21px'
    },
    mb2: {
        marginBottom: '21px'
    },
    mb1: {
        marginBottom: '11px'
    },
    fw_bold: {
        fontWeight: 500
    },
    drawer_content: {
        '& p': {
            margin: '0 0 14px 0'
        }
    },
    table: {
        width: '100%',
        '& thead': {
            background: '#dddddd'
        },
        '& thead th': {
            padding: '7px'
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
    p1: {
        padding: '10px'
    },
    img_avatar: {
        cursor: 'Pointer',
    }
}));

const initialRange = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    key: 'selection'
}

const AttendanceReport: FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const mainResult = useSelector(state => state.main.mainData);
    const mainMultiResult = useSelector(state => state.main.multiData);
    const [openDateRangeModal, setOpenDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialRange);
    const [dataVisitUser, setDataVisitUser] = useState<Dictionary[]>([]);
    const [dataUser, setDataUser] = useState<Dictionary[]>([]);
    const [serviceType, setServiceType] = useState(0);
    const [userFilter, setUserFilter] = useState<Dictionary[]>([]);
    const [userSelected, setUserSelected] = useState(0);
    const [dataMarket, setDataMarket] = useState<Dictionary[]>([]);
    const [marketSelected, setMarketSelected] = useState(0);
    const [rowSelected, setRowSelected] = useState<RowSelected>({ row: null, edit: false });
    const [supervisorSelected, setSupervisorSelected] = useState(0);
    const [dataClient, setDataClient] = useState<Dictionary[]>([]);
    const [dataSupervisor, setDataSupervisor] = useState<Dictionary[]>([]);
    const [clientSelected, setClientSelected] = useState(0);
    const [open, setOpen] = React.useState(false);

    const search = () => {
        dispatch(getCollection(getAssistanceSel2({
            service: ( serviceType === 6 ) ? 'IMPULSADOR' : 'MERCADERISMO',
            marketid: marketSelected,
            userid: userSelected,
            customerid: clientSelected,
            supervisorid: supervisorSelected,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        })));
    }

    const columns = React.useMemo(
        () => [
            {
                Header: t(langKeys.visitDate),
                accessor: 'visit_date' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: 'Asistencia',
                accessor: 'assistance' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.market),
                accessor: 'market' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: 'COD_LIVE',
                accessor: 'code' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.client),
                accessor: 'customer_name' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.user),
                accessor: 'user_name' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.status),
                accessor: 'management' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: 'Hora Entrada',
                accessor: 'hour_entry' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: 'Nº DOC',
                accessor: 'docnum' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: 'Supervisor',
                accessor: 'supervisor_name' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: 'Supervisor Doc Num',
                accessor: 'docnum_supervisor' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.hourstart),
                accessor: 'hour_start' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.hourend),
                accessor: 'hour_finish' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.selfiehour),
                accessor: 'start_hour_visit' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.stand),
                accessor: 'stand' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.finishdatevisit),
                accessor: 'finish_hour_visit' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.description),
                accessor: 'description' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.observation),
                accessor: 'observations' as keyof IAssistanceReport,
                NoFilter: true
            },
            {
                Header: t(langKeys.type_service),
                accessor: 'service' as keyof IAssistanceReport,
                NoFilter: true
            },
        ],
        []
    );

    const handleView = (row: Dictionary) => {
        setOpen(true);
        setRowSelected({ row, edit: false });
    }

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const toggleDrawer = (open: boolean) => (
        event: React.KeyboardEvent | React.MouseEvent,
    ) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setOpen(open);
    };


    useEffect(() => {
        if (!mainResult.loading && !mainResult.error) {
            setDataVisitUser(mainResult.data)
        }
    }, [mainResult]);

    useEffect(() => {
        dispatch(getMultiCollection([
            getUserLst(0), // sel de usuarios
            getMarketSel(0), // sel de usuarios
            getClientLst(), // sel de clients
            getTypeUserSel(4),
        ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainMultiResult.loading && !mainMultiResult.error) {
            const found = mainMultiResult.data.find(x => x.key === 'UFN_USER_LST');
            if (found) {
                setDataUser(found.data)
            }
            const found2 = mainMultiResult.data.find(x => x.key === 'UFN_MARKET_SEL');
            if (found2) {
                setDataMarket(found2.data)
            }
            const found3 = mainMultiResult.data.find(x => x.key === 'QUERY_CLIENT_LST');
            if (found3) {
                setDataClient(found3.data)
            }
            const found4 = mainMultiResult.data.find(x => x.key === 'UFN_TYPE_USERS_SEL');
            if (found4) {
                setDataSupervisor(found4.data)
            }
        }
    }, [mainMultiResult]);

    useEffect(() => {
        setUserFilter(dataUser.filter(i => i.roleid === serviceType))
    }, [serviceType])

    return (
        <div className={classes.container}>
            <div style={{ height: 10 }}></div>
            <div className={classes.contentHeader}>
                <Typography variant="h5" component="div">
                    {t(langKeys.assistancereport)}
                </Typography>
            </div>
            <br />
            <TableZyx
                columns={columns}
                data={dataVisitUser}
                ButtonsElement={() => (
                    <div className={classes.containerHeader} style={{display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                            <DateRangePicker
                                open={openDateRangeModal}
                                setOpen={setOpenDateRangeModal}
                                range={dateRange}
                                onSelect={setDateRange}
                            >
                                <Button
                                    className={classes.itemDate}
                                    startIcon={<CalendarIcon />}
                                    onClick={() => setOpenDateRangeModal(!openDateRangeModal)}
                                >
                                    {getDateCleaned(dateRange.startDate!) + " - " + getDateCleaned(dateRange.endDate!)}
                                </Button>
                            </DateRangePicker>
                                <FieldSelect
                                    label={t(langKeys.type_service)}
                                    className={classes.filterComponent}
                                    disabled={mainMultiResult.loading}
                                    valueDefault={serviceType}
                                    onChange={(value) => setServiceType(value ? value.value : 0)}
                                    uset={true}
                                    variant="outlined"
                                    data={[{desc: 'MERCADERISTA', value: 5}, {desc: 'IMPULSADOR', value: 6}]}
                                    optionDesc="desc"
                                    optionValue="value"
                                />
                                <FieldSelect
                                    label={t(langKeys.supervisor)}
                                    className={classes.filterComponent}
                                    disabled={mainResult.loading}
                                    valueDefault={supervisorSelected}
                                    onChange={(value) => setSupervisorSelected(value ? value.userid : 0)}
                                    uset={true}
                                    variant="outlined"
                                    data={dataSupervisor.map(i => ({...i, filter: i.docnum + '-' + i.description}))}
                                    optionDesc="filter"
                                    optionValue="userid"
                                />
                                <FieldSelect
                                    label={t(langKeys.user)}
                                    disabled={!serviceType}
                                    className={classes.filterComponent}
                                    valueDefault={userSelected}
                                    onChange={(value) => setUserSelected(value ? value.userid : 0)}
                                    uset={true}
                                    variant="outlined"
                                    data={userFilter}
                                    optionDesc="description"
                                    optionValue="userid"
                                />
                                <FieldSelect
                                    label={t(langKeys.market)}
                                    disabled={!serviceType}
                                    className={classes.filterComponent}
                                    valueDefault={marketSelected}
                                    onChange={(value) => setMarketSelected(value ? value.marketid : 0)}
                                    uset={true}
                                    variant="outlined"
                                    data={dataMarket}
                                    optionDesc="market_name"
                                    optionValue="marketid"
                                />
                                <FieldSelect
                                    disabled={mainResult.loading}
                                    label={t(langKeys.client)}
                                    className={classes.filterComponent}
                                    valueDefault={clientSelected}
                                    onChange={(value) => setClientSelected(value ? value.customerid : 0)}
                                    uset={true}
                                    variant="outlined"
                                    data={dataClient}
                                    optionDesc="description"
                                    optionValue="customerid"
                                />
                            <div>
                                <Button
                                    disabled={!serviceType || mainResult.loading}
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SearchIcon style={{ color: 'white' }} />}
                                    style={{ width: 120, backgroundColor: "#55BD84" }}
                                    onClick={() => search()}
                                >{t(langKeys.search)}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                download={true}
                filterGeneral={false}
                loading={mainResult.loading}
                register={false}
            />
        </div>
    )
}
export default AttendanceReport;