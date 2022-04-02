import React, { FC, Fragment, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dictionary, IFetchData, IUserVisits } from '@types';
import { DateRangePicker, FieldSelect, TemplateIcons } from 'components';
import { langKeys } from 'lang/keys';
import {
    getCollection, resetAllMain, getMultiCollection, getCollectionPaginated, execute, exportData,
} from 'store/main/actions';
import TableZyx from 'components/fields/table-simple';
import { getVisitExport, getDateCleaned, getPaginatedVisits, getUserLst, getVisitUserSel, updateVisit, freeVisit, getTypeUserSel } from 'common/helpers';
import { AppBar, Avatar, Box, Button, Divider, Drawer, Fab, IconButton, ListItemIcon, makeStyles, Menu, MenuItem, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Typography } from '@material-ui/core';
import { Range } from 'react-date-range';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Favorite as FavoriteIcon,
    Navigation as NavigationIcon,
    MoreVert as MoreVertIcon,
    RestorePage
} from '@material-ui/icons';
import { CalendarIcon, CloseTicketIcon, ReassignIcon, TipifyIcon } from 'icons';
import Lightbox from "react-image-lightbox";
import { TabPanel } from '@material-ui/lab';
import TablePaginated from 'components/fields/table-paginated';
import { manageConfirmation, showBackdrop, showSnackbar } from 'store/popus/actions';
import ReassignVisitModal from './Modals/ReassignVisitModal';
import CreateVisitModal from './Modals/CreateVisitModal';

const serviceType = [{desc: 'MERCADERISTA', value: 5}, {desc: 'IMPULSADOR', value: 6}]
const selectionKey = 'visitid';

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
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}));

const initialRange = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    key: 'selection'
}

const IconOptions: React.FC<{
    disabled?: boolean,
    fetchData: () => void,
    onHandlerFreeVisit?: (e?: any) => void;
    rowData?: Dictionary[];
}> = ({ onHandlerFreeVisit, disabled, rowData, fetchData }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);

    const handleClose = () => setAnchorEl(null);
    useEffect(() => {
        if (waitSave) {
            if (!executeRes.loading && !executeRes.error) {
                dispatch(showSnackbar({ show: true, success: true, message: 'Visita liberada correcatmente' }))
                fetchData();
                dispatch(showBackdrop(false));
                setWaitSave(false);
            } else if (executeRes.error) {
                const errormessage = t(executeRes.code || "error_unexpected_error", { module: t(langKeys.user).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                setWaitSave(false);
                dispatch(showBackdrop(false));
            }
        }
    }, [executeRes, waitSave])

    const handleFreeVisit = (rowData: any) => {
        const callback = () => {
            dispatch(execute(freeVisit({ visitid: rowData.visitid })));
            dispatch(showBackdrop(true));
            setWaitSave(true);
        }

        dispatch(manageConfirmation({
            visible: true,
            question: 'Esta seguro de liberar la visita?',
            callback
        }))
    }

    return (
        <>
            <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                size="small"
                disabled={disabled}
                onClick={(e) => setAnchorEl(e.currentTarget)}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {onHandlerFreeVisit &&
                    <MenuItem onClick={() => {
                        setAnchorEl(null);
                        handleFreeVisit(rowData);
                        console.log('rowData', rowData)
                    }}>
                        <ListItemIcon color="inherit">
                            <RestorePage width={18} style={{ fill: '#7721AD' }} />
                        </ListItemIcon>
                        {'Liberar Visita'}
                    </MenuItem>
                }
            </Menu>
        </>
    )
}


const VisitDetail: FC<any> = ({ data: { row, edit }, open, toggleDrawer, handleDrawerClose }) => {
    const classes = useStyles();
    const [selfieOpen, setSelfieOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const { t } = useTranslation();
    const [value, setValue] = React.useState(0);
    
    const handleImageClick = (image_url: string) => {
        setImageUrl(image_url)
        setSelfieOpen(true)
    }

    function a11yProps(index: any) {
        return {
          id: `simple-tab-${index}`,
          'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    function TabPanel(props: TabPanelProps) {
        const { children, value, index, ...other } = props;
      
        return (
          <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
          >
            {value === index && (
              <Box p={3}>
                <Typography>{children}</Typography>
              </Box>
            )}
          </div>
        );
    }

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Drawer
            className={classes.drawer}
            anchor="right"
            open={open}
            onClose={toggleDrawer(false)}
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            <div className={classes.drawer_header}>
                <Typography variant="h6" component="div">
                    Detalle Visita
                </Typography>
            </div>
            <Divider classes={{root: classes.hr}}/>
            <div className={[classes.px2].join('')}>
                <div className={classes.mb2}>
                    <p className={classes.fw_bold} style={{margin:'0 0 14px 0'}}>{t(langKeys.generalinformation)}</p>
                    <Table className={[classes.table, classes.tableNoBorder].join(' ')} size="small" aria-label="a dense table">
                        <TableBody>
                            <TableRow>
                                <TableCell align="left" style={{width: '30px'}}>Hora Inicio:</TableCell>
                                <TableCell align="left" style={{width: '80px'}}>{row?.hour_start}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" style={{width: '30px'}}>Hora Fin:</TableCell>
                                <TableCell align="left" style={{width: '80px'}}>{row?.hour_finish}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" style={{width: '30px'}}>Comenzó:</TableCell>
                                <TableCell align="left" style={{width: '80px'}}>{row?.start_date_visit}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" style={{width: '30px'}}>Terminó:</TableCell>
                                <TableCell align="left" style={{width: '80px'}}>{row?.finish_date_visit}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" style={{width: '30px'}}>Foto Selfie:</TableCell>
                                <TableCell align="left" style={{width: '80px'}}>
                                    { row?.photo_selfie &&
                                        <a href="#" onClick={() => handleImageClick(row?.photo_selfie)}>
                                            <img 
                                                src={row?.photo_selfie}
                                                alt=''
                                                width={100}
                                            />
                                        </a>
                                    }
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
            { row?.roleid === 5 && (
                <Fragment>
                    <div className={classes.tabRoot}>
                        <AppBar position="static">
                            <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                                <Tab label={'Material Instalado'} {...a11yProps(0)} />
                                <Tab label="Fotos" {...a11yProps(1)} />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={value} index={0}>
                            { row?.material && (
                                <Table className={classes.table} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{paddingLeft: '15px'}}>{t(langKeys.product)}</TableCell>
                                            <TableCell align="center" style={{width: '80px'}}>{t(langKeys.brand)}</TableCell>
                                            <TableCell align="center">{t(langKeys.quantity)}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    { row?.material.map((item: Dictionary, index: any) => (
                                        <TableRow key={index}>
                                            <TableCell component="td" scope="row">
                                                {item.brand}
                                            </TableCell>
                                            <TableCell align="center">{item.description}</TableCell>
                                            <TableCell align="center">{item.quantity || item.type }</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            <Table className={[classes.table, classes.tableNoBorder].join(' ')} size="small" aria-label="a dense table">
                                <TableBody>
                                    <TableRow>
                                        <TableCell align="left" style={{width: '30px'}}>Foto Antes:</TableCell>
                                        <TableCell align="left" style={{width: '80px'}}>
                                            { row?.image_before &&
                                                <a href="#" onClick={() => handleImageClick(row?.image_before)}>
                                                    <img 
                                                        src={row?.image_before}
                                                        alt=''
                                                        width={100}
                                                    />
                                                </a>
                                            }
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell align="left" style={{width: '30px'}}>Foto Despues:</TableCell>
                                        <TableCell align="left" style={{width: '80px'}}>
                                            { row?.image_after &&
                                                    <a href="#" onClick={() => handleImageClick(row?.image_after)}>
                                                        <img 
                                                            src={row?.image_after}
                                                            alt=''
                                                            width={100}
                                                        />
                                                    </a>
                                            }
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TabPanel>
                    </div>
                </Fragment>
            )}
            { row?.roleid === 6 && (
                <Fragment>
                    <div className={classes.tabRoot}>
                        <AppBar position="static">
                            <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                                <Tab label={t(langKeys.inventory_relief)} {...a11yProps(0)} />
                                <Tab label="Ventas" {...a11yProps(1)} />
                            </Tabs>
                        </AppBar>
                        <TabPanel value={value} index={0}>
                            { row?.replace_stock && (
                                <Table className={classes.table} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{paddingLeft: '15px'}}>{t(langKeys.product)}</TableCell>
                                            <TableCell align="center" style={{width: '80px'}}>{t(langKeys.brand)}</TableCell>
                                            <TableCell align="center">{t(langKeys.category)}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    { row?.replace_stock.map((item: Dictionary, index: any) => (
                                        <TableRow key={index}>
                                            <TableCell component="td" scope="row">
                                                {item.product}
                                            </TableCell>
                                            <TableCell align="center">{item.brand}</TableCell>
                                            <TableCell align="center">{item.category || item.type }</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            { row?.sale && (
                                <Table className={classes.table} size="small" aria-label="a dense table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{paddingLeft: '15px'}}>{t(langKeys.brand)}</TableCell>
                                                <TableCell align="center">{'Unidad'}</TableCell>
                                                <TableCell align="center" style={{width: '80px'}}>{t(langKeys.quantity)}</TableCell>
                                                <TableCell align="center">{t(langKeys.image)}</TableCell>
                                                <TableCell align="center">{t(langKeys.merchandise)}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        { row.sale.map((item: Dictionary, index: any) => (
                                            <TableRow key={index}>
                                                <TableCell component="td" scope="row">
                                                    {item.saledetail_description}
                                                </TableCell>
                                                <TableCell align="center">{item.measure_unit}</TableCell>
                                                <TableCell align="center">{item.quantity}</TableCell>
                                                <TableCell>
                                                    { item?.url_evidence && (
                                                        <Avatar 
                                                            alt="evidence"
                                                            onClick={() => handleImageClick(item.url_evidence)}
                                                            className={classes.img_avatar}
                                                            src={item.url_evidence}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">{item.merchant || item.type }</TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                </Table>
                            )}
                        </TabPanel>
                    </div>
                </Fragment>
            )}
            { selfieOpen && <Lightbox
                mainSrc={imageUrl}
                onCloseRequest={() => setSelfieOpen(false)}
            />}
        </Drawer>
    )
}

const Visits: FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [waitSave, setWaitSave] = useState(false);
    const mainResult = useSelector(state => state.main.mainData);
    const mainMultiResult = useSelector(state => state.main.multiData);
    const [dataVisitUser, setDataVisitUser] = useState<Dictionary[]>([]);
    const [dataUser, setDataUser] = useState<Dictionary[]>([]);
    const [userFilter, setUserFilter] = useState<Dictionary[]>([]);
    const [rowSelected, setRowSelected] = useState<RowSelected>({ row: null, edit: false });
    const [open, setOpen] = React.useState(false);
    const [fetchDataAux, setfetchDataAux] = useState<IFetchData>({ pageSize: 0, pageIndex: 0, filters: {}, sorts: {}, daterange: null })
    const [allParameters, setAllParameters] = useState<Dictionary>({});
    const mainPaginated = useSelector(state => state.main.mainPaginated);
    const [pageCount, setPageCount] = useState(0);
    const [totalrow, settotalrow] = useState(0);
    const [selectedRows, setSelectedRows] = useState<any>({});
    const [rowWithDataSelected, setRowWithDataSelected] = useState<Dictionary[]>([]);
    const executeResult = useSelector(state => state.main.execute);
    const [rowToSend, setRowToSend] = useState<Dictionary[]>([]);
    const [openDialogReassign, setOpenDialogReassign] = useState(false);
    const [openDialogCreate, setOpenDialogCreate] = useState(false);
    const resExportData = useSelector(state => state.main.exportData);
    const [waitExport, setWaitExport] = useState(false);
    const applications = useSelector(state => state.login?.validateToken?.user?.menu);
    const [pagePermissions, setPagePermissions] = useState<Dictionary>({});
    const [dataSupervisor, setDataSupervisor] = useState<Dictionary[]>([]);

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                ['view']: applications['/visits'][0],
                ['modify']: applications['/visits'][1],
                ['insert']: applications['/visits'][2],
                ['delete']: applications['/visits'][3],
            })
        }
    },[applications])

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_delete) }))
                fetchData(fetchDataAux);
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

    useEffect(() => {
        if (waitExport) {
            if (!resExportData.loading && !resExportData.error) {
                dispatch(showBackdrop(false));
                setWaitExport(false);
                window.open(resExportData.url, '_blank');
            } else if (resExportData.error) {
                const errormessage = t(resExportData.code || "error_unexpected_error", { module: t(langKeys.property).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitExport(false);
            }
        }
    }, [resExportData, waitExport])

    const handleDelete = () => {
        if (rowWithDataSelected.length === 0) return
        const callback = () => {
            dispatch(execute(updateVisit({ ids: rowWithDataSelected.map(e => e.visitid).join(',')})));
            dispatch(showBackdrop(true));
            setWaitSave(true);
        }

        dispatch(manageConfirmation({
            visible: true,
            question: t(langKeys.confirmation_delete),
            callback
        }))
    }

    const handleReassign = () => {
        if (rowWithDataSelected.length === 0) return
        console.log('reasignar')
        setRowToSend(rowWithDataSelected);
        setOpenDialogReassign(true);
    }

    const handleRegister = () => {
        setOpenDialogCreate(true);
    }

    const triggerExportData = ({filters, sorts, daterange}: IFetchData) => {
        // const columnsExport = columns.filter(x => !x.isComponent).map(x => ({
        //     key: x.accessor,
        //     alias: x.Header
        // }))
        dispatch(exportData(getVisitExport({
            filters: {
                ...filters,
            },
            sorts,
            startdate: daterange.startDate!,
            enddate: daterange.endDate!,
            ...allParameters
        })));
        dispatch(showBackdrop(true));
        setWaitExport(true);
    }

    const setValue = (parameterName: any, value: any) => {
        if (parameterName === 'service') {
            setUserFilter(dataUser.filter(i => i.roleid === value))
        }
        setAllParameters({ ...allParameters, [parameterName]: value });
    }

    useEffect(() => {
        if (!(Object.keys(selectedRows).length === 0 && rowWithDataSelected.length === 0)) {
            setRowWithDataSelected(p => Object.keys(selectedRows).map(x => mainPaginated.data.find(y => y.visitid === parseInt(x)) || p.find(y => y.visitid === parseInt(x)) || {}))
        }
    }, [selectedRows])

    const columns = React.useMemo(
        () => [
            {
                accessor: 'visitid',
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: '1%',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    if (pagePermissions.modify) {
                        return (
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <TemplateIcons
                                    viewFunction={() => console.log('aca')}
                                    editFunction={() => handleView(row)}
                                />
                                {row.management === 'VISITADO' && (
                                    <IconOptions
                                            fetchData={fetchDataAux2}
                                            rowData={row}
                                            onHandlerFreeVisit={() => {
                                            setRowToSend([row]);
                                        }}
                                    />
                                )}
                            </div>
                        )
                    } else {
                        return (<div></div>)
                    }
                }
            },
            {
                Header: t(langKeys.visitDate),
                accessor: 'visit_date' as keyof IUserVisits,
                NoFilter: false
            },
            {
                Header: t(langKeys.client),
                accessor: 'customer_name' as keyof IUserVisits,
                NoFilter: false
            },
            {
                Header: t(langKeys.name),
                accessor: 'user_fullname' as keyof IUserVisits,
                NoFilter: false
            },
            {
                Header: t(langKeys.user),
                accessor: 'username' as keyof IUserVisits,
                NoFilter: false
            },
            {
                Header: t(langKeys.selfiehour),
                accessor: 'start_date_visit' as keyof IUserVisits,
                NoFilter: false
            },
            {
                Header: t(langKeys.status),
                accessor: 'management' as keyof IUserVisits,
                NoFilter: false,
            },
            {
                Header: t(langKeys.type_service),
                accessor: 'service' as keyof IUserVisits,
                NoFilter: false
            },
        ],
        [fetchDataAux, pagePermissions]
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
            getTypeUserSel(4),
        ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainPaginated.loading && !mainPaginated.error) {
            setPageCount(fetchDataAux.pageSize ? Math.ceil(mainPaginated.count / fetchDataAux.pageSize) : 0);
            settotalrow(mainPaginated.count);
        }
    }, [mainPaginated])

    useEffect(() => {
        if (!mainMultiResult.loading && !mainMultiResult.error) {
            const found = mainMultiResult.data.find(x => x.key === 'UFN_USER_LST');
            if (found) {
                setDataUser(found.data.map(i => ({...i, description: i.docnum + ' - ' + i.description})))
            }
            const found4 = mainMultiResult.data.find(x => x.key === 'UFN_TYPE_USERS_SEL');
            if (found4) {
                setDataSupervisor(found4.data)
            }
        }
    }, [mainMultiResult]);

    const fetchData = ({ pageSize, pageIndex, filters, sorts, daterange }: IFetchData) => {
        setfetchDataAux({ pageSize, pageIndex, filters, sorts, daterange })
        dispatch(getCollectionPaginated(getPaginatedVisits({
            startdate: daterange.startDate!,
            enddate: daterange.endDate!,
            take: pageSize,
            skip: pageIndex * pageSize,
            sorts: sorts,
            filters: {
                ...filters,
            },
            ...allParameters
        })))
    };

    const fetchDataAux2 = () => {
        fetchData(fetchDataAux);
    };

    return (
        <div className={classes.container}>
            { !!pagePermissions.insert && (
                <Fab onClick={handleRegister} color="primary" aria-label="add" style={{position:'absolute', bottom: '10px', right: '10px', zIndex: 999}} >
                    <AddIcon />
                </Fab>
            )}

            <div style={{ height: 10 }}></div>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
                <div className={classes.title}>
                {t(langKeys.visits)}
                </div>
            </Box>
            <br />
            <TablePaginated
                columns={columns}
                data={mainPaginated.data}
                totalrow={totalrow}
                loading={mainPaginated.loading}
                pageCount={pageCount}
                filterrange={true}
                download={!!pagePermissions.modify}
                deleteReg={!!pagePermissions.delete}
                delVisible={true}
                reassign={!!pagePermissions.modify}
                handleDelete={handleDelete}
                handleReassign={handleReassign}
                fetchData={fetchData}
                useSelection={!!pagePermissions.modify}
                selectionKey={selectionKey}
                setSelectedRows={setSelectedRows}
                exportPersonalized={triggerExportData}
                // selectionFilter={{ key: 'estadoconversacion', value: 'ASIGNADO' }}
                // filterRangeDate="today"
                FiltersElement={React.useMemo(() => (
                    <>
                        <div className={classes.containerHeader} style={{display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between'}}>
                            <div style={{display: 'flex', gap: 8}}>
                                <FieldSelect
                                    label={t(langKeys.type_service)}
                                    className={classes.filterComponent}
                                    disabled={mainMultiResult.loading}
                                    valueDefault={allParameters["service"] || 0}
                                    onChange={(value) => setValue('service', value ? value.value : 0)}
                                    uset={true}
                                    variant="outlined"
                                    data={serviceType}
                                    optionDesc="desc"
                                    optionValue="value"
                                />
                                <FieldSelect
                                    label={t(langKeys.supervisor)}
                                    className={classes.filterComponent}
                                    disabled={mainMultiResult.loading}
                                    valueDefault={allParameters["supervisorid"] || 0}
                                    onChange={(value) => setValue('supervisorid', value ? value.userid : 0)}
                                    uset={true}
                                    variant="outlined"
                                    data={dataSupervisor.map(i => ({...i, filter: i.docnum + '-' + i.description}))}
                                    optionDesc="filter"
                                    optionValue="userid"
                                />
                                <FieldSelect
                                    label={t(langKeys.user)}
                                    disabled={!allParameters["service"]}
                                    className={classes.filterComponent2}
                                    valueDefault={allParameters["userid"] || 0}
                                    onChange={(value) => setValue('userid', value ? value.userid : 0)}
                                    uset={true}
                                    variant="outlined"
                                    data={userFilter}
                                    optionDesc="description"
                                    optionValue="userid"
                                />
                            </div>
                        </div>
                    </>
                ), [allParameters, mainResult, mainPaginated, userFilter, selectedRows, dataUser, pagePermissions])}
            />
            <VisitDetail
                open={open}
                data={rowSelected}
                toggleDrawer={toggleDrawer}
                handleDrawerClose={handleDrawerClose}
            />
            <ReassignVisitModal
                fetchData={fetchDataAux2}
                rowWithDataSelected={rowToSend}
                openModal={openDialogReassign}
                setOpenModal={setOpenDialogReassign}
                userFilter={userFilter}
                allParameters={allParameters}
            />
            <CreateVisitModal
                fetchData={fetchDataAux2}
                rowWithDataSelected={rowToSend}
                openModal={openDialogCreate}
                setOpenModal={setOpenDialogCreate}
                userData={dataUser}
                allParameters={allParameters}
            />
        </div>
    )
}

export default Visits;