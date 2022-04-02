/* eslint-disable react-hooks/exhaustive-deps */
import SearchIcon from '@material-ui/icons/Search';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import React, { FC, useEffect, useState, useCallback } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import { FieldMultiSelect, DialogZyx, FieldSelect, FieldEdit } from 'components';
import { getCollection, getMultiCollectionAux, getMultiCollection, resetAllMain, execute, processLoad } from 'store/main/actions';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { getGuideByBarcode, getInfoGuide, getInfoTracking, getImageGuide } from 'common/helpers';
import { Dictionary } from "@types";
import Timeline from '@material-ui/lab/Timeline';
import TableZyx from '../components/fields/table-simple';
import DoneIcon from '@material-ui/icons/Done';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import { makeStyles } from '@material-ui/core/styles';
import TimelineDot from '@material-ui/lab/TimelineDot';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { cleanAll, selectGuide, addGuideConsulted } from 'store/assignment/actions';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
// import { FileUploader } from "react-drag-drop-files";
import * as XLSX from 'xlsx';
import { IconButton } from '@material-ui/core';
import BusinessIcon from '@material-ui/icons/Business';
import PhoneIcon from '@material-ui/icons/Phone';
import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import { AccountBox, AccountCircle, AddRounded, CropFree, LocalShipping, RadioButtonChecked } from '@material-ui/icons';
import CropFreeIcon from '@material-ui/icons/CropFree';
const optionsFilterBy = [
    { description: 'Codigo de Barras', filterby: 'client_barcode' },
    { description: 'Codigo de Seguimiento', filterby: 'seg_code' },
    { description: 'N° de Guia', filterby: 'guide_number' },
    { description: 'DNI Cliente', filterby: 'client_dni' },
]


const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        width: '100%'
    },
    containerAgents: {
        flex: '0 0 300px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRight: '1px solid #EBEAED'
    },
    containerPanel: {
        flex: '1'
    },
    agentName: {
        fontWeight: 500,
        fontSize: '16px',
        lineHeight: '22px',
        wordBreak: 'break-word'
    },
    agentUp: {
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'center',
        marginBottom: theme.spacing(1)
    },
    counterCount: {
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap'
    },
    containerItemAgent: {
        padding: `14px ${theme.spacing(2)}px`,
        borderBottom: '1px solid #EBEAED',
        position: 'relative',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'rgb(235, 234, 237, 0.18)'
        }
    },
    itemSelected: {
        backgroundColor: 'rgb(235, 234, 237, 0.50)'
    },
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',

        width: '100%'

    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
    card: {
        flex: '1 1 300px',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
    },
    headercard: {
        textAlign: 'center',
        fontWeight: 500,
        borderBottom: '1px solid #e1e1e1',
        paddingBottom: '8px',
        marginBottom: 8
    }
}));

const ItemTicket: FC<{ guide: Dictionary }> = ({ guide }) => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const selectedGuide = useSelector(state => state.assignment.selectedGuide);

    const handleClick = () => {
        dispatch(selectGuide(guide.guideid));
        dispatch(getMultiCollectionAux([
            getInfoGuide({ guideid: guide.guideid }),
            getInfoTracking({ guideid: guide.guideid }),
            getImageGuide({ guideid: guide.guideid })
        ]))
    }

    return (
        <div
            onClick={handleClick}
            className={clsx(classes.containerItemAgent, {
                [classes.itemSelected]: (selectedGuide === guide.guideid)
            })}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div>N° Guia {guide.guide_number} (<span style={{ fontWeight: 500 }}>{guide.status}</span>)</div>
                    <div>DNI Cliente: {guide.client_dni}</div>
                </div>
                <div>
                    {guide.driver_name &&
                        <div>Conductor: {guide.driver_name}</div>
                    }
                    {guide.plate_number &&
                        <div>Placa: {guide.plate_number}</div>
                    }
                </div>
            </div>
        </div>
    )
}


const InfoGuide: FC = () => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const dataGuide = useSelector(state => state.main.multiDataAux);
    const [lastattempt, setlastattempt] = useState<Dictionary | null>(null);
    const [trackingselected, settrackingselected] = useState<Dictionary[]>([])
    const [listattempts, setlistattempts] = useState<Dictionary[]>([])
    const infoguide = dataGuide.data.length > 0 ? dataGuide.data[0].data[0] : null;
    const tracking = dataGuide.data.length ? dataGuide.data[1].data : [];
    const [listracking, setlistracking] = useState<Dictionary[]>([]);

    const skus = dataGuide.data.length > 0 ? dataGuide.data[0].data.map(x => ({
        code: x.sku_code, description: x.sku_description, brand: x.sku_brand
    })) : [];


    useEffect(() => {
        if (tracking.length > 0) {
            const attempsres: Dictionary[] = [];
            const listdata = (tracking.map((x: Dictionary) => ({ ...x, attempt: (x.attempt === 0 ? 1 : x.attempt) })) as Dictionary[]).filter(x => !/DESPACHADO|PENDIENTE|DESPACHO|ACEPTADO/gi.test(x.status || ""));
            const attempts = listdata.reduce((repeated, item) => {
                repeated[item.attempt] = item.id_shipping_order;
                return repeated;
            }, {});

            for (const [key, value] of Object.entries(attempts)) {
                attempsres.push({ desc: `Visita ${key}`, attempt: key, id_shipping_order: value })
            }
            setlistattempts(attempsres)
            const lastAttemptObject = attempsres[attempsres.length - 1];
            setlistracking(listdata);

            const posibletracking = listdata.filter(x => x.attempt == lastAttemptObject.attempt);
            settrackingselected(posibletracking[0].status !== "PROCESADO" ? [listdata[0], ...posibletracking] : posibletracking)
            setlastattempt(lastAttemptObject);
        }
    }, [tracking])

    const images = dataGuide.data.length ? dataGuide.data[2].data : [];

    return (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', width: '100%', overflowY: 'auto' }}>
            {trackingselected.length > 0 && (
                <div className={classes.card} style={{ flex: '1 1 50%' }}>
                    <div className={classes.headercard}>Tracking</div>
                    <div>
                        <div style={{ width: 200, marginLeft: 'auto' }}>
                            <FieldSelect
                                label="Visita"
                                className="col-6"
                                valueDefault={lastattempt?.attempt}
                                onChange={(value) => {
                                    if (value) {
                                        settrackingselected(() => {
                                            const newlist = listracking.filter(x => x.attempt == value.attempt)
                                            return newlist[0].status !== "PROCESADO" ? [listracking[0], ...newlist] : newlist;
                                        })
                                    }
                                    else
                                        settrackingselected([])
                                }}
                                data={listattempts}
                                optionDesc="attempt"
                                optionValue="attempt"
                            />
                        </div>
                    </div>

                    <Timeline align="alternate">
                        <TimelineItem>
                            <TimelineOppositeContent>
                                <div>
                                    {trackingselected[3]?.createdate ? new Date(trackingselected[3]?.createdate).toLocaleString() : ''}
                                </div>
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot color={trackingselected[3] ? "primary" : "grey"}>
                                    <RadioButtonChecked />
                                </TimelineDot>
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent>
                                <div>
                                    <Typography color={trackingselected[3] ? "textPrimary" : "textSecondary"}>
                                        {trackingselected[3] ? trackingselected[3].status : "ENTREGADO"}
                                    </Typography>
                                    <Typography>{trackingselected[3]?.motive}</Typography>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                            <TimelineOppositeContent>
                                <div>
                                    {trackingselected[2]?.createdate ? new Date(trackingselected[2]?.createdate).toLocaleString() : ''}
                                </div>
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot color={trackingselected[2] ? "primary" : "grey"}>
                                    <RadioButtonChecked />
                                </TimelineDot>
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent>
                                <div>
                                    <Typography color={trackingselected[2] ? "textPrimary" : "textSecondary"}>EN CURSO</Typography>
                                    <Typography>{trackingselected[2]?.motive}</Typography>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                            <TimelineOppositeContent>
                                <div>
                                    {trackingselected[1]?.createdate ? new Date(trackingselected[1]?.createdate).toLocaleString() : ''}
                                </div>
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot color={trackingselected[1] ? "primary" : "grey"}>
                                    <RadioButtonChecked />
                                </TimelineDot>
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent>
                                <div>
                                    <Typography color={trackingselected[1] ? "textPrimary" : "textSecondary"}>ASIGNADO</Typography>
                                    <Typography>{trackingselected[1]?.motive}</Typography>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                            <TimelineOppositeContent>
                                <div>
                                    {trackingselected[0]?.createdate ? new Date(trackingselected[0]?.createdate).toLocaleString() : ''}
                                </div>
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot color="primary">
                                    <RadioButtonChecked />
                                </TimelineDot>
                            </TimelineSeparator>
                            <TimelineContent>
                                <div>
                                    <Typography>                                             PROCESADO
                                    </Typography>
                                    <Typography>{trackingselected[0].motive}</Typography>
                                </div>
                            </TimelineContent>
                        </TimelineItem>
                    </Timeline>
                </div>

            )}
            <div className={classes.card} style={{ flex: '1 1 200px' }}>
                <div className={classes.headercard}>Unidad asignada</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AccountBox style={{ fontSize: '24px', color: '#00A6D6' }} />
                    <div>{tracking.length > 0 ? tracking[tracking.length - 1].driver_name : ''}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                    <AccountBox style={{ fontSize: '24px', color: '#00A6D6' }} />
                    <div>{tracking.length > 0 ? tracking[tracking.length - 1].doc_number : ''}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                    <LocalShipping style={{ width: 15 }} />
                    <div>Placa: {tracking.length > 0 ? tracking[tracking.length - 1].plate_number : ''}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                    <LocalShipping style={{ width: 15 }} />
                    <div>Tipo vehiculo: {tracking.length > 0 ? tracking[tracking.length - 1].vehicle_type : ''}</div>
                </div>

            </div>
            <div className={classes.card} style={{ flex: '1 1 300px' }}>
                <div className={classes.headercard}>Productos</div>
                <div>
                    {skus.map((sku, index) => (
                        <div key={index} className={classes.containerItemAgent}>
                            <div style={{ fontWeight: 'bold' }}>{sku.code}</div>
                            <div>{sku.description}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={classes.card}>
                <div className={classes.headercard}>Información del cliente</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PersonIcon style={{ width: 15 }} />
                    <div>{infoguide?.client_name || ""}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PhoneIcon style={{ width: 15 }} />
                    <div>{infoguide?.client_phone1 || ""}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <EmailIcon style={{ width: 15 }} />
                    <div>{infoguide?.client_email || ""}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BusinessIcon style={{ width: 15 }} />
                    <div>{infoguide?.address || ""}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CropFreeIcon style={{ width: 15 }} />
                    <div>Codigo de barras: {infoguide?.client_barcode || ""}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CropFreeIcon style={{ width: 15 }} />
                    <div>Codigo Seguimiento: {infoguide?.seg_code || ""}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CropFreeIcon style={{ width: 15 }} />
                    <div>N° Guia: {infoguide?.guide_number || ""}</div>
                </div>

            </div>
            <div className={classes.card} style={{ flex: '1 1 100%' }}>
                <div className={classes.headercard}>Imagenes</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {images.map((image, index) => (
                        <div key={index} style={{ width: 100 }}>
                            <img
                                src={image.url}
                                alt="img"
                                style={{ width: '100%', cursor: 'pointer' }}
                                onClick={() => window.open(image.url)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>

    )
}


const Search = () => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const multiData = useSelector(state => state.main.multiData);
    const guidesConsulted = useSelector(state => state.assignment.guidesConsulted);

    const [textsearch, settextsearch] = useState('');

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [filterby, setfilterby] = useState({ description: 'Codigo de Barras', filterby: 'client_barcode' });

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        if (!multiData.loading && !multiData.error && multiData.data.length > 0) {
            if (multiData.data[0].key === "SP_SEL_GUIDE_BY_BARCODE") {
                // dispatch(addGuideConsulted(multiData.data.filter(x => x.data.length > 0).map(x => x.data[0])));

                dispatch(addGuideConsulted(multiData.data.filter(x => x.data.length > 0).reduce((acc: Dictionary[], item) => [...(acc), ...(item.data)], [])))
            }
        }
    }, [multiData])

    const handlersubmit = (e: any) => {
        e.preventDefault();
        searchbarcode();
    }
    const searchbarcode = () => {
        const posibleslist = Array.from(new Set(textsearch.split(" ")));
        const getguides = posibleslist.filter(x => !guidesConsulted.data.some(y => y[filterby.filterby] === x)).map((x, i) => getGuideByBarcode({ search: x, filterBy: filterby.filterby }, i))

        if (getguides.length > 0)
            dispatch(getMultiCollection(getguides))
    }

    return (
        <form onSubmit={handlersubmit} className={classes.root}>
            <div style={{ width: '100%' }}>
                <FieldEdit
                    label={"Buscar por " + filterby.description} // "Corporation"
                    valueDefault={textsearch}
                    onChange={e => settextsearch(e)}
                />
            </div>
            <IconButton type="button" onClick={searchbarcode} className={classes.iconButton} aria-label="search">
                <SearchIcon />
            </IconButton>
            <IconButton type="button" onClick={handleClick} className={classes.iconButton} aria-label="filterby">
                <MoreVertIcon
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                />
            </IconButton>
            <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 48 * 4.5,
                        width: '25ch',
                    },
                }}
            >
                {optionsFilterBy.map((option) => (
                    <MenuItem key={option.description} selected={option.description === filterby.description} onClick={() => {
                        handleClose();
                        setfilterby(option);
                    }}>
                        {option.description}
                    </MenuItem>
                ))}
            </Menu>
        </form>
    )
}

const MassiveLoad: FC = () => {
    const dispatch = useDispatch();
    const selectedGuide = useSelector(state => state.assignment.selectedGuide);
    const guidesConsulted = useSelector(state => state.assignment.guidesConsulted);

    const multiData = useSelector(state => state.main.multiData);

    useEffect(() => {
        
        return () => {
            dispatch(cleanAll());
        }
    }, [])
    return (
        <div style={{ width: '100%', display: 'flex' }}>
            <div style={{ width: '35%', display: 'flex', flexDirection: 'column' }}>
                <Search />
                <div style={{ overflowY: 'auto', flex: 1, height: '100%' }}>
                    {guidesConsulted.data.map(x => (
                        <ItemTicket guide={x} key={x.guideid} />
                    ))}
                </div>
            </div>
            <div style={{ width: '65%', display: 'flex', flexDirection: 'column' }}>
                {(selectedGuide > 0 && !multiData.loading) &&
                    <InfoGuide />
                }
            </div>
        </div>
    )
}

export default MassiveLoad;