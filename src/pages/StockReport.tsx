import React, { FC, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dictionary } from '@types';
import { DateRangePicker, FieldSelect } from 'components';
import { langKeys } from 'lang/keys';
import {
    getCollection, resetAllMain, getMultiCollection,
} from 'store/main/actions';
import TableZyx from 'components/fields/table-simple';
import { getDateCleaned, getMarketSel, getUserLst, getProducts, getStockReport, exportExcel } from 'common/helpers';
import { Button, makeStyles, Typography } from '@material-ui/core';
import { Range } from 'react-date-range';
import {
    Search as SearchIcon
} from '@material-ui/icons';
import { CalendarIcon, DownloadIcon } from 'icons';

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

const StockReport: FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const mainResult = useSelector(state => state.main.mainData);
    const mainMultiResult = useSelector(state => state.main.multiData);
    const [openDateRangeModal, setOpenDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialRange);
    const [dataVisitUser, setDataVisitUser] = useState<Dictionary[]>([]);
    const [dataUser, setDataUser] = useState<Dictionary[]>([]);
    const [dataProducts, setDataProducts] = useState<Dictionary[]>([]);
    // const [userFilter, setUserFilter] = useState<Dictionary[]>([]);
    const [userSelected, setUserSelected] = useState(0);
    const [dataMarket, setDataMarket] = useState<Dictionary[]>([]);
    const [marketSelected, setMarketSelected] = useState(0);
    const [consolidado, setconsolidado] = useState<Dictionary[]>([])

    const search = () => {
        dispatch(getCollection(getStockReport({
            service: 'IMPULSADOR',
            marketid: marketSelected,
            userid: userSelected,
            startdate: dateRange.startDate,
            finishdate: dateRange.endDate
        })));
    }

    const triggerconsolidado = () => {
        exportExcel("consolidado-stock", consolidado)
    }

    const columns = React.useMemo(
        () => [
            {
                Header: t(langKeys.client),
                accessor: 'customer_name',
            },
            {
                Header: "Fecha",
                accessor: 'date'
            },
            {
                Header: "Product",
                accessor: 'product',
            },
            {
                Header: "Marca",
                accessor: 'brand',
            },
            {
                Header: "Categoria",
                accessor: 'category',
                Cell: (props: any) => {
                    const category = props.cell.row.original.category || "";
                    return category === "null" ? "" : category;
                }
            },
            {
                Header: "Existe",
                accessor: 'exists'
            },
            {
                Header: "Usuario",
                accessor: 'usr',
            },
            {
                Header: "N° Doc usuario",
                accessor: 'docnum',
            },
            {
                Header: "Mercado",
                accessor: 'market_name',
            },
            {
                Header: "Departamento",
                accessor: 'department',
            },
            {
                Header: "Provincia",
                accessor: 'province',
            },
            {
                Header: "Distrito",
                accessor: 'district',
            },
        ],
        []
    );

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_STOCK_REPORT_SEL2" && dataProducts.length > 0) {
            const p1 = dataProducts.reduce((acc, item) => ({
                ...acc,
                [item.brand + " - " + item.type]: (acc[item.brand + " - " + item.type] || 0) + 1
            }), {})
            const aa = mainResult.data.map(x => ({
                ...x,
                ...p1,
                ...(dataProducts.reduce((acc, item) => ({
                    ...acc,
                    ["SKU: " + item.brand + " - " + item.type + " - " + item.product]: 1
                }), {})),
                ...((x.materials || []).reduce((acc: Dictionary, item: Dictionary) => ({
                    ...acc,
                    [item.brand + " - " + (item.category || item.type)]: (acc[item.brand + " - " + (item.category || item.type)] || p1[item.brand + " - " + (item.category || item.type)]) - 1,
                    ["SKU: " + item.brand + " - " + (item.category || item.type) + " - " + item.product]: 0
                }), {}))
            }))
            setconsolidado(aa)
            const a = mainResult.data.reduce((acc: Dictionary[], item: Dictionary) => [
                ...acc,
                ...(dataProducts.map(product => ({
                    ...item,
                    materials: undefined,
                    product: product.product,
                    brand: product.brand,
                    category: product.type,
                    exists: (item.materials || []).some((m: Dictionary) => m.product === product.product && m.brand === product.brand && (m.category === product.type || m.type === product.type)) ? "SI" : "NO"
                })))
            ], [])
            console.log(a)
            setDataVisitUser(a)
        }
    }, [mainResult, dataProducts]);

    useEffect(() => {
        dispatch(getMultiCollection([
            getUserLst(0), // sel de usuarios
            getMarketSel(0), // sel de usuarios
            getProducts(), // sel de usuarios
        ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainMultiResult.loading && !mainMultiResult.error) {
            const found = mainMultiResult.data.find(x => x.key === 'UFN_USER_LST');
            if (found) {
                setDataUser(found.data.filter(x => x.roleid === 6).map(i => ({ ...i, description: i.docnum + ' - ' + i.description })))
            }
            const found2 = mainMultiResult.data.find(x => x.key === 'UFN_MARKET_SEL');
            if (found2) {
                setDataMarket(found2.data)
            }
            const found3 = mainMultiResult.data.find(x => x.key === 'QUERY_PRODUCT_SEL');
            if (found3) {
                setDataProducts(found3.data)
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
                    Reporte de stock
                </Typography>
            </div>
            <br />
            <TableZyx
                columns={columns}
                data={dataVisitUser}
                ButtonsElement={() => (
                    <div className={classes.containerHeader} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
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
                                label={t(langKeys.user)}
                                className={classes.filterComponent2}
                                valueDefault={userSelected}
                                onChange={(value) => setUserSelected(value ? value.userid : 0)}
                                uset={true}
                                variant="outlined"
                                data={dataUser}
                                optionDesc="description"
                                optionValue="userid"
                            />
                            <FieldSelect
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

                            <Button
                                // disabled={!serviceType || mainResult.loading}
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon style={{ color: 'white' }} />}
                                style={{ width: 120, backgroundColor: "#55BD84" }}
                                onClick={() => search()}
                            >{t(langKeys.search)}
                            </Button>
                            <Button
                                // disabled={!serviceType || mainResult.loading}
                                variant="contained"
                                color="primary"
                                startIcon={<DownloadIcon style={{ color: 'white' }} />}
                                onClick={() => triggerconsolidado()}
                            >{"Consolidado"}
                            </Button>
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
export default StockReport;