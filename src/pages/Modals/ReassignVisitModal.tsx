import React, { FC, useEffect, useMemo, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { useDispatch } from 'react-redux';
import { Dictionary, IDistributor } from '@types';
import { execute, getMultiCollectionAux } from 'store/main/actions';
import { DialogZyx, FieldSelect } from 'components';
import { Button, Checkbox, CircularProgress, Divider, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { getClientLst, reassignVisitUser } from 'common/helpers';
import TableZyx from 'components/fields/table-simple';
import { Autorenew } from '@material-ui/icons';
import { manageConfirmation, showBackdrop, showSnackbar } from 'store/popus/actions';

interface ReassignVisitModalProps {
    fetchData: () => void;
    setOpenModal: (param: any) => void;
    openModal: boolean;
    rowWithDataSelected: Dictionary[],
    userFilter: Dictionary[],
    allParameters: Dictionary,
}

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
    modal_content: {

    },
    px2: {
        padding: '0px 21px'
    },
    mt2: {
        marginTop: '1.2rem'
    },
    px5: {
        paddingRight: '4rem',
        paddingLeft: '4rem'
    },
    mb2: {
        marginBottom: '21px'
    },
    mb1: {
        marginBottom: '11px'
    },
    pb2: {
        paddingBottom: '21px'
    },
    modal_body: {
        padding: '.8rem 1.4rem'
    },
    modal_detail: {
        padding: '.8rem 1.4rem',
        height: '500px',
        overflow: 'auto'
    },
    text_center: {
        textAlign: 'center',
    },
    pt50: {
        paddingT: '0.5rem',
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: '14px',
        textTransform: 'initial',
        width: '60%'
    },
    table: {
        width: '100%',
        '& thead': {
            background: '#dddddd'
        },
        '& thead th': {
            padding: '7px'
        },
        '& tbody td': {
            fontSize: '13px'
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
}));

const ReassignVisitModal: React.FC<ReassignVisitModalProps> = ({ setOpenModal, openModal, rowWithDataSelected, fetchData, userFilter, allParameters}) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const dispatch = useDispatch();
    const multiResultAux = useSelector(state => state.main.multiDataAux);
    const [dataClient, setClientData] = useState<Dictionary[]>([]);
    const [newUser, setNewUser] = useState(0);
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector(state => state.main.execute);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_reasign_visit) }))
                fetchData();
                dispatch(showBackdrop(false));
                setWaitSave(false);
                setOpenModal(false);
            } else if (executeResult.error) {
                const errormessage = t(executeResult.code || "error_unexpected_error", { module: t(langKeys.user).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeResult, waitSave])

    const handleClick = () => {
        if (newUser === 0) return
        const callback = () => {
            dispatch(execute(reassignVisitUser({ userid: newUser, ids: rowWithDataSelected.map(e => e.visitid).join(',')})));
            dispatch(showBackdrop(true));
            setWaitSave(true);
        }

        dispatch(manageConfirmation({
            visible: true,
            question: t(langKeys.confirmation_reasign_visit),
            callback
        }))

    }

    useEffect(() => {
        if (openModal) {
            dispatch(getMultiCollectionAux([getClientLst()]));
        }
    }, [openModal])

    useEffect(() => {
        if (!multiResultAux.loading && !multiResultAux.error) {
            const found = multiResultAux.data.find(x => x.key === 'QUERY_CLIENT_LST');
            if (found) {
                setClientData(found.data)
            }
        }
    }, [multiResultAux]);

    return (
        <DialogZyx
            open={openModal}
            title=""
            buttonText1={t(langKeys.cancel)}
            handleClickButton1={() => setOpenModal(false)}
            button2Type="submit"
            maxWidth={'md'}
        >
            <div>
                {multiResultAux.loading ? (
                    <div style={{ textAlign: 'center' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <div className='modal_content'>
                        <div className={[classes.pb2, classes.px5, classes.modal_body].join(' ')}>
                            <div className={[classes.text_center, classes.mb2].join(' ')}>
                                <h2 className='mb1'>Reasignar visita</h2>
                                <p>Elije el usuario o cliente.</p>
                            </div>
                            <div className="row-zyx">
                                <div className="col-6">
                                    <label >Elige al Usuario</label>
                                    <FieldSelect
                                        label={''}
                                        // className={classes.filterComponent}
                                        // disabled={mainMultiResult.loading}
                                        // valueDefault={allParameters["service"] || 0}
                                        valueDefault={allParameters["userid"] || 0}
                                        // onChange={(value) => setValue('service', value ? value.value : 0)}
                                        onChange={(value) => setNewUser(value.userid)}
                                        uset={true}
                                        variant="outlined"
                                        data={userFilter}
                                        optionDesc="description"
                                        optionValue="userid"
                                    />
                                </div>
                                <div className={[classes.mt2, 'col-3'].join(' ')}>
                                    <Button
                                        className={classes.button}
                                        variant="contained"
                                        color="primary"
                                        // type="submit"
                                        startIcon={<Autorenew color="secondary" />}
                                        style={{ backgroundColor: "#55BD84" }}
                                        onClick={handleClick}
                                    >{'Reasignar'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <Divider />
                        <div className={[classes.mt2, classes.modal_detail].join(' ')}>
                            <h3>Detalle de las visitas ( {rowWithDataSelected.length} )</h3>
                            { rowWithDataSelected  && (
                                <Table className={classes.table} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">{t(langKeys.visitDate)}</TableCell>
                                            <TableCell align="left">{t(langKeys.client)}</TableCell>
                                            <TableCell align="left" style={{width: '80px'}}>{t(langKeys.name)}</TableCell>
                                            <TableCell align="center">{t(langKeys.status)}</TableCell>
                                            <TableCell align="center">{t(langKeys.type_service)}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    { rowWithDataSelected.map((item: Dictionary, index: any) => (
                                        <TableRow key={index}>
                                            <TableCell style={{ width: '15%', textAlign: 'center'}}>{item.visit_date}</TableCell>
                                            <TableCell style={{ width: '29%', textAlign: 'left'}}>{item.customer_name}</TableCell>
                                            <TableCell style={{ width: '29%', textAlign: 'left'}}>{item.user_fullname}</TableCell>
                                            <TableCell style={{ width: '13%', textAlign: 'center'}}>{item.management}</TableCell>
                                            <TableCell style={{ width: '14%', textAlign: 'center'}}>{item.service}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DialogZyx>
    )
}

export default ReassignVisitModal;