/* eslint-disable react-hooks/exhaustive-deps */
import SearchIcon from '@material-ui/icons/Search';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import React, { FC, useEffect, useState, useCallback } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import { FieldMultiSelect, DialogZyx, FieldSelect, FieldEdit } from 'components';
import { getCollection, uploadData, getMultiCollection, resetAllMain, execute, processLoad } from 'store/main/actions';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { getTemplates, getMassiveLoads, insertShippingOrder } from 'common/helpers';
import { Dictionary } from "@types";
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { getDataInitial, setGuidesByDistrict, addRoute, selectRoute, setDriverToRoute, removeRoute, addGuideToRoute } from 'store/assignment/actions';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
// import { FileUploader } from "react-drag-drop-files";
import * as XLSX from 'xlsx';
import { IconButton, InputAdornment, Tabs } from '@material-ui/core';
import { useForm, useFieldArray } from 'react-hook-form';

const optionsFilterBy = [
    { filterby: 'client_barcode', description: 'Codigo de barras' },
    { filterby: 'seg_code', description: 'CUD' },
    { filterby: 'alt_code1', description: 'Codigo alt 1' },
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
}));



const DiagloVehicle: React.FC<{ setOpenModal: (param: any) => void, openModal: boolean }> = ({ setOpenModal, openModal }) => {
    const { t } = useTranslation();
    const driverList = useSelector(state => state.assignment.driverList);
    const selectedRoute = useSelector(state => state.assignment.selectedRoute);

    const dispatch = useDispatch();
    const { register, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm<{
        driverid: number;
        vehicleid: number;
        plate_number: string;
        description: string;
    }>();


    useEffect(() => {
        if (openModal) {
            reset({
                driverid: 0,
                vehicleid: 0,
                plate_number: '',
                description: '',
            })
            register('vehicleid', { validate: (value) => ((value && value > 0) ? true : t(langKeys.field_required) + "") });
            register('driverid', { validate: (value) => ((value && value > 0) ? true : t(langKeys.field_required) + "") });
            register('plate_number', { validate: (value) => ((value && value.length) ? true : t(langKeys.field_required) + "") });
        }
    }, [openModal])

    const onSubmit = handleSubmit((data) => {
        dispatch(setDriverToRoute({ ...data, id: selectedRoute }))
        setOpenModal(false)
    });

    return (
        <DialogZyx
            open={openModal}
            title={`Asignar conductor a la ruta ${selectedRoute + 1}`}
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.continue)}
            handleClickButton1={() => setOpenModal(false)}
            handleClickButton2={onSubmit}
            button2Type="submit"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                    <FieldSelect
                        label="Vehiculo"
                        valueDefault={getValues('driverid')}
                        // loading={mainResult.loading}
                        optionValue="driverid"
                        optionDesc="description"
                        onChange={(value) => {
                            setValue('driverid', value ? value.driverid : 0);
                            setValue('vehicleid', value ? value.vehicleid : 0);
                            setValue('plate_number', value ? value.plate_number : '');
                            setValue('description', value ? value.description : '');
                        }}
                        error={errors?.driverid?.message}
                        data={driverList.data}
                    />
                </div>
            </div>
        </DialogZyx>)
}

const CountTicket: FC<{ label: string, count: number, color: string }> = ({ label, count, color }) => (
    <div style={{ position: 'relative' }}>
        <div style={{ color: color, padding: '3px 4px', whiteSpace: 'nowrap', fontSize: '12px' }}>{label}: <span style={{ fontWeight: 'bold' }}>{count}</span></div>
        <div style={{ backgroundColor: color, width: '100%', height: '24px', opacity: '0.1', position: 'absolute', top: 0, left: 0 }}></div>
    </div>
)
// selectRoute
const ItemRoute: FC<{ route: Dictionary, setOpenModal: (param: any) => void }> = ({ route, setOpenModal }) => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const selectedRoute = useSelector(state => state.assignment.selectedRoute);

    return (
        <div
            onClick={() => dispatch(selectRoute(route.id))}
            className={clsx(classes.containerItemAgent, {
                [classes.itemSelected]: (selectedRoute === route.id)
            })}
        >
            <Button
                type="button"
                style={{ padding: 0 }}
                color="primary"
                onClick={() => setOpenModal(true)}
            >Asignar chofer</Button>
            <div>Ruta {route.id + 1}</div>
            {route.plate_number && (
                <div>{route.description}</div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
                <CountTicket
                    label="Guias"
                    count={route.guides.length}
                    color="#55BD84"
                />
                <CountTicket
                    label="Bultos"
                    count={Array.from(new Set(route.guides.map((x: Dictionary) => x.guide_number))).length}
                    color="#55BD84"
                />
                <CountTicket
                    label="Paradas"
                    count={Array.from(new Set(route.guides.map((x: Dictionary) => x.address))).length}
                    color="#55BD84"
                />
            </div>
            <IconButton
                style={{ position: 'absolute', top: 0, right: '0' }}
                onClick={() => dispatch(removeRoute(route.id))}
                edge="end"
            >
                <CloseIcon />
            </IconButton>
        </div>
    )
}

const ResumeAssignment: FC = () => {
    const dispatch = useDispatch();
    const [openModal, setOpenModal] = useState(false)
    const routeList = useSelector(state => state.assignment.routeList);
    const executeResult = useSelector(state => state.main.execute);
    const [waitSave, setWaitSave] = useState(false);
    const { t } = useTranslation();

    const processData = () => {
        const notvehicle = routeList.data.some(x => !x.driverid);

        if (notvehicle) {
            dispatch(showSnackbar({ show: true, success: false, message: "Tiene que asignar un vehiculo" }))
            return;
        }

        const nothaveguide = routeList.data.some(x => x.guides.length === 0);

        if (nothaveguide) {
            dispatch(showSnackbar({ show: true, success: false, message: "Las rutas debe tener mas de una guia asignada" }));
            return;
        }
        const resaa = routeList.data.map(x => insertShippingOrder({
            quadrant_name: "CUADRANTE" + x.id,
            vehicleid: x.vehicleid,
            driverid: x.driverid,
            guide_ids: `[${x.guides.map((y: Dictionary) => y.guideid).join(',')}]`,
        }))
        const callback = () => {
            dispatch(execute({
                header: null,
                detail: resaa
            }, true));
            setWaitSave(true)
            dispatch(showBackdrop(true));
        }
        dispatch(manageConfirmation({
            visible: true,
            question: "¿Está seguro de procesar las " + routeList.data.length + " rutas?",
            callback
        }))
    }

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: 'Asignación correcta' }));
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

    return (
        <div style={{ width: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #EBEAED' }}>
                <Button
                    variant="contained"
                    type="button"
                    color="secondary"
                    onClick={() => processData()}
                >Procesar</Button>

                <Button
                    variant="contained"
                    type="button"
                    color="primary"
                    onClick={() => dispatch(addRoute())}
                >Agregar ruta</Button>

            </div>
            {routeList.data.map(route => (
                <ItemRoute key={route.id} route={route} setOpenModal={setOpenModal} />
            ))}
            <DiagloVehicle
                openModal={openModal}
                setOpenModal={setOpenModal}
            />
        </div>
    )
}

const Search = () => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const guideListToShow = useSelector(state => state.assignment.guideListToShow);
    const selectedRoute = useSelector(state => state.assignment.selectedRoute);
    const routeList = useSelector(state => state.assignment.routeList);

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

    const handlersubmit = (e: any) => {
        e.preventDefault();
        searchbarcode();
    }
    
    const searchbarcode = () => {
        const route = routeList.data.find(x => x.id === selectedRoute);
        if (route) {
            const posibleslist = Array.from(new Set(textsearch.split(" ")))
            posibleslist.forEach(text => {
                const existeinallroutes = routeList.data.some(x => x.guides.some((x: Dictionary) => x[filterby.filterby] === text))
                if (existeinallroutes) {
                    if (posibleslist.length === 1) {
                        dispatch(showSnackbar({ show: true, success: false, message: "La guía ya fue asignada" }))
                    }
                    return;
                }
                const guides = guideListToShow.data.filter(x => x[filterby.filterby] === text);
    
                if (guides.length === 0) {
                    if (posibleslist.length === 1) {
                        dispatch(showSnackbar({ show: true, success: false, message: "No existe la guia" }))
                    }
                } else {
                    settextsearch('')
                    if (posibleslist.length === 1) {
                        dispatch(showSnackbar({ show: true, success: true, message: "Guia asignada" }))
                    }
                    dispatch(addGuideToRoute({
                        id: route.id,
                        guides
                    }))
                }
            })
        }
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

    const distictList = useSelector(state => state.assignment.districts);
    const guideList = useSelector(state => state.assignment.guideList);
    const guideListToShow = useSelector(state => state.assignment.guideListToShow);
    const loading = useSelector(state => state.assignment.loadingInitial);

    useEffect(() => {
        dispatch(getDataInitial())
    }, [])

    const selectDistrict = (districts: string[]) => {
        if (districts.includes("TODOS")) {
            dispatch(setGuidesByDistrict(guideList.data))
        } else {
            dispatch(setGuidesByDistrict(guideList.data.filter(guide => districts.includes(guide.district))))
        }
    }

    return (
        <div style={{ width: '100%', display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
                <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <FieldMultiSelect
                        label="Distrito"
                        style={{ width: '200px' }}
                        loading={loading}
                        optionValue="district"
                        optionDesc="district"
                        onChange={(value) => selectDistrict(value.map((v: Dictionary) => v.district))}
                        data={distictList.data}
                    />
                    <div style={{ flex: 1 }}>
                        <Search />
                    </div>
                </div>
            </div>
            <ResumeAssignment />
        </div>
    )
}

export default MassiveLoad;