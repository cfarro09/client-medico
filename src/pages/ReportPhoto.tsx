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
import { getAssistanceSel, getDateCleaned, getMarketSel, getUserLst, getSalesReport, getPhotoReport, getClientLst, getTypeUserSel } from 'common/helpers';
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

const serviceType = [{ desc: 'MERCADERISTA', value: 5 }, { desc: 'IMPULSADOR', value: 6 }]

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

const ReportPhoto: FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const mainResult = useSelector(state => state.main.mainData);
    const mainMultiResult = useSelector(state => state.main.multiData);
    const [openDateRangeModal, setOpenDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialRange);
    const [dataPhoto, setDataPhoto] = useState<Dictionary[]>([]);
    const [dataUser, setDataUser] = useState<Dictionary[]>([]);
    const [dataClient, setDataClient] = useState<Dictionary[]>([]);
    // const [userFilter, setUserFilter] = useState<Dictionary[]>([]);
    const [userSelected, setUserSelected] = useState(0);
    const [serviceSelected, setServiceSelected] = useState(0);
    const [dataMarket, setDataMarket] = useState<Dictionary[]>([]);
    const [marketSelected, setMarketSelected] = useState(0);
    const [clientSelected, setClientSelected] = useState(0);
    const [dataSupervisor, setDataSupervisor] = useState<Dictionary[]>([]);
    const [supervisorSelected, setSupervisorSelected] = useState(0);
    const [rowSelected, setRowSelected] = useState<RowSelected>({ row: null, edit: false });
    const [open, setOpen] = React.useState(false);

    const getUserFiltered = () => {
        return dataUser.filter((x: any) => x.roleid === serviceSelected) as Dictionary[]
    }

    const search = () => {
        dispatch(getCollection(getPhotoReport({
            marketid: marketSelected,
            customerid: clientSelected,
            supervisorid: supervisorSelected,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            userid: userSelected,
        })));
    }

    const columns = React.useMemo(
        () => [
            {
                Header: 'market',
                accessor: 'market',
            },
            {
                Header: 'customer_name',
                accessor: 'customer_name',
            },
            {
                Header: 'date',
                accessor: 'date',
            },
            {
                Header: 'week',
                accessor: 'week',
            },
            {
                Header: 'semaphore',
                accessor: 'semaphore',
            },
            {
                Header: 'code',
                accessor: 'code',
            },
            {
                Header: 'supervisor',
                accessor: 'supervisor',
            },
            {
                Header: 'user_name',
                accessor: 'user_name',
            },
        ],
        []
    );

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_PHOTOGRAPHIC_REPORT_SEL") {
            setDataPhoto(mainResult.data)
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

    // useEffect(() => {
    //     setUserFilter(dataUser.filter(i => i.roleid === serviceType))
    // }, [serviceType])

    return (
        <div className={classes.container}>
            <div style={{ height: 10 }}></div>
            <div className={classes.contentHeader}>
                <Typography variant="h5" component="div">
                    Reporte Fotográfico
                </Typography>
            </div>
            <br />
            <TableZyx
                columns={columns}
                data={dataPhoto}
                ButtonsElement={() => (
                    <div className={classes.containerHeader} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                                disabled={mainResult.loading}
                                label={t(langKeys.user)}
                                className={classes.filterComponent2}
                                valueDefault={userSelected}
                                onChange={(value) => setUserSelected(value ? value.userid : 0)}
                                uset={true}
                                variant="outlined"
                                data={dataUser.filter(i => i.roleid === 5 || i.roleid === 6).map(i => ({...i, filter: i.docnum + '-' + i.description}))}
                                optionDesc="filter"
                                optionValue="userid"
                            />
                            <FieldSelect
                                disabled={mainResult.loading}
                                label={t(langKeys.market)}
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
                                    // disabled={!serviceType || mainResult.loading}
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
export default ReportPhoto;