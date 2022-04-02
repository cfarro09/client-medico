/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useCallback, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dictionary, MultiData, IMarket, IDistributor, IUserSelType } from '@types';
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TemplateIcons, TitleDetail } from 'components';
import { langKeys } from 'lang/keys';
import {
    getCollection, resetAllMain, getMultiCollection,
    execute, getCollectionAux, resetMainAux, getMultiCollectionAux
} from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
import TableZyx from 'components/fields/table-simple';
import { getClientSel, getRoles, getValuesFromDomain, insCostumer } from 'common/helpers';
import { useForm } from 'react-hook-form';
import { Box, Button, Divider, Grid, IconButton, InputAdornment, InputBase, makeStyles, Paper, TextField } from '@material-ui/core';
import {
    Save as SaveIcon,
    Clear as ClearIcon,
    Menu as MenuIcon,
    Search as SearchIcon,
    Directions as DirectionsIcon,
} from '@material-ui/icons';
import SelectMarketModal from './Modals/SelectMarketModal';
import SelectDistributorModal from './Modals/SelectDistributorModal';
import SelectMerchantUserModal from './Modals/SelectMerchantUserModal';
import SelectImpellerUserModal from './Modals/SelectImpellerUserModal';

interface RowSelected {
    row: Dictionary | null,
    edit: boolean
}

interface DetailProps {
    data: RowSelected;
    setViewSelected: (view: string) => void;
    multiData: MultiData[];
    fetchData?: () => void
}

const arrayBread = [
    { id: "view-1", name: "Clients" },
    { id: "view-2", name: "Client detail" }
];

const useStyles = makeStyles((theme) => ({
    containerDetail: {
        marginTop: theme.spacing(2),
        // maxWidth: '80%',
        padding: theme.spacing(2),
        background: '#fff',
    },
    mb2: {
        marginBottom: theme.spacing(4),
    },
    title: {
        fontSize: '22px',
        color: theme.palette.text.primary,
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: '14px',
        textTransform: 'initial'
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
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 400,
      },
      margin: {
        margin: theme.spacing(1),
      },
    table: {
        height: '200px'
    }
}));

const DetailClient: React.FC<DetailProps> = ({ data: { row, edit }, setViewSelected, multiData, fetchData }) => {
    const [openMarketModal, setOpenMarketModal] = useState(false);
    const [openDistributorModal, setOpenDistributorModal] = useState(false);
    const [openMerchantUserModal, setOpenMerchantUserModal] = useState(false);
    const [openImpellerUserModal, setOpenImpellerUserModal] = useState(false);
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const dataStatus = multiData[0] && multiData[0].success ? multiData[0].data : [];
    const dataType = multiData[1] && multiData[1].success ? multiData[1].data : [];
    const dataStatusUsers = multiData[2] && multiData[2].success ? multiData[2].data : [];

    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: {
            id: row ? row.customerid : 0,
            marketid: row ? row.marketid : 0,
            market_name: row?.market_name || '',
            distributorid: row ? row.distributorid : 0,
            distributor_name: row?.distributor_name || '',
            merchant_user_id: row ? row.merchant_user_id : 0,
            merchant_name: row?.merchant_name || '',
            impeller_user_id: row ? row.impeller_user_id : 0,
            impeller_name: row?.impeller_name || '',
            description: row?.description || '',
            address: row?.address || '',
            stand: row?.stand || '',
            status: row ? row.status : 'ACTIVO',
            frecuency: row?.frecuency || '',
            business_turn: row?.business_turn || '',
            semaphore: row?.semaphore || '',
            color: row?.color || '',
            code: row?.code || 0,
            operation: row ? "UPDATE" : "INSERT",
        }
    });

    React.useEffect(() => {
        register('description', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('address', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('stand', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('status', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('frecuency', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('marketid', { validate: (value) => ((value && value > 0) ? true : t(langKeys.field_required) + "") });
        register('code', { validate: (value) => ((value && value > 0) ? true : t(langKeys.field_required) + "") });
        register('market_name', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('distributorid', { validate: (value) => ((value && value > 0) ? true : t(langKeys.field_required) + "") });
        register('distributor_name', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('merchant_user_id');
        register('merchant_name');
        register('impeller_user_id');
        register('impeller_name');
        register('business_turn');
        register('semaphore');
        register('color');
    }, [edit, register]);

    useEffect(() => {
        if (waitSave) {
            if (!executeRes.loading && !executeRes.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(row ? langKeys.successful_edit : langKeys.successful_register) }))
                fetchData && fetchData();
                dispatch(showBackdrop(false));
                setViewSelected("view-1")
            } else if (executeRes.error) {
                const errormessage = t(executeRes.code || "error_unexpected_error", { module: t(langKeys.organization_plural).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                setWaitSave(false);
                dispatch(showBackdrop(false));
            }
        }
    }, [executeRes, waitSave])

    const onClickSelectMarket = useCallback((modalValue: IMarket) => {
        setValue('marketid', modalValue.marketid)
        setValue('market_name', modalValue.market_name)
    }, [setValue]);

    const onClickSelectDistributor = useCallback((modalValue: IDistributor) => {
        setValue('distributorid', modalValue.distributorid)
        setValue('distributor_name', modalValue.distributor_name)
    }, [setValue]);

    const onClickSelectMerchantUser = useCallback((modalValue: IUserSelType) => {
        setValue('merchant_user_id', modalValue.userid)
        setValue('merchant_name', modalValue.description)
    }, [setValue]);

    const onClickSelectImpellerUser = (modalValue: IUserSelType) => {
        setValue('impeller_user_id', modalValue.userid)
        setValue('impeller_name', modalValue.description)
    };

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(execute(insCostumer(data)));
            dispatch(showBackdrop(true));
            setWaitSave(true)
        }

        dispatch(manageConfirmation({
            visible: true,
            question: t(langKeys.confirmation_save),
            callback
        }))
    });

    return (
        <div style={{ width: '100%' }}>
            <form onSubmit={onSubmit}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <TemplateBreadcrumbs
                            breadcrumbs={arrayBread}
                            handleClick={setViewSelected}
                        />
                        <TitleDetail
                            title={row ? `${row.description}` : t(langKeys.newclient)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            type="button"
                            color="primary"
                            startIcon={<ClearIcon color="secondary" />}
                            style={{ backgroundColor: "#FB5F5F" }}
                            onClick={() => setViewSelected("view-1")}
                        >{t(langKeys.back)}</Button>
                        {edit &&
                            <Button
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                type="submit"
                                startIcon={<SaveIcon color="secondary" />}
                                style={{ backgroundColor: "#55BD84" }}
                            >{t(langKeys.save)}
                            </Button>
                        }
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <div className="row-zyx">
                        <div className="col-6">
                            <Grid container spacing={1} alignItems="flex-end">
                                <Grid item xs={11}>
                                    <FieldEdit
                                        className="col-6"
                                        label={t(langKeys.market)}
                                        // valueDefault={row?.marketid || ""}
                                        valueDefault={getValues('market_name')}
                                        onChange={(value) => setValue('marketid', value) }
                                        error={errors?.marketid?.message}
                                        disabled= {true}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={1}>
                                    <IconButton
                                        color="primary"
                                        className={classes.iconButton}
                                        aria-label="directions"
                                        onClick={() => setOpenMarketModal(true)}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </div>
                        
                        <SelectMarketModal
                            openMarketModal={openMarketModal}
                            setOpenMarketModal={setOpenMarketModal}
                            onClick={onClickSelectMarket}
                        />

                        <div className="col-6">
                            <Grid container spacing={1} alignItems="flex-end">
                                <Grid item xs={11}>
                                    <FieldEdit
                                        className="col-6"
                                        label={t(langKeys.distributor)}
                                        valueDefault={getValues('distributor_name')}
                                        onChange={(value) => setValue('distributor_name', value) }
                                        error={errors?.distributor_name?.message}
                                        disabled= {true}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={1}>
                                    <IconButton
                                        color="primary"
                                        className={classes.iconButton}
                                        aria-label="distributor"
                                        onClick={() => setOpenDistributorModal(true)}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </div>
                    </div>

                    <SelectDistributorModal
                        openDistributorModal={openDistributorModal}
                        setOpenDistributorModal={setOpenDistributorModal}
                        onClick={onClickSelectDistributor}
                    />

                    <div className="row-zyx">
                        <div className="col-6">
                            <Grid container spacing={1} alignItems="flex-end">
                                <Grid item xs={11}>
                                    <FieldEdit
                                        className="col-6"
                                        label={t(langKeys.merchant_user)}
                                        valueDefault={getValues('merchant_name')}
                                        onChange={(value) => setValue('merchant_name', value) }
                                        error={errors?.merchant_name?.message}
                                        disabled= {true}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={1}>
                                    <IconButton
                                        color="primary"
                                        className={classes.iconButton}
                                        aria-label="merchant_name"
                                        onClick={() => setOpenMerchantUserModal(true)}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </div>

                        <SelectMerchantUserModal
                            openMerchantUserModal={openMerchantUserModal}
                            setOpenMerchantUserModal={setOpenMerchantUserModal}
                            onClick={onClickSelectMerchantUser}
                        />

                        <div className="col-6">
                            <Grid container spacing={1} alignItems="flex-end">
                                <Grid item xs={11}>
                                    <FieldEdit
                                        className="col-6"
                                        label={t(langKeys.impeller_user)}
                                        valueDefault={getValues('impeller_name')}
                                        onChange={(value) => setValue('impeller_name', value) }
                                        error={errors?.impeller_name?.message}
                                        disabled= {true}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={1}>
                                    <IconButton
                                        color="primary"
                                        className={classes.iconButton}
                                        aria-label="merchant_name"
                                        onClick={() => setOpenImpellerUserModal(true)}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </div>
                    </div>

                    <SelectImpellerUserModal
                        openImpellerUserModal={openImpellerUserModal}
                        setOpenImpellerUserModal={setOpenImpellerUserModal}
                        onClick={onClickSelectImpellerUser}
                    />

                    <div className="row-zyx">
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.code)}
                            style={{ marginBottom: 8 }}
                            valueDefault={row?.code || ""}
                            onChange={(value) => setValue('code', value)}
                            error={errors?.code?.message}
                        />
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.description)}
                            style={{ marginBottom: 8 }}
                            valueDefault={row?.description || ""}
                            onChange={(value) => setValue('description', value)}
                            error={errors?.description?.message}
                        />
                    </div>

                    <div className="row-zyx">
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.stand)}
                            style={{ marginBottom: 8 }}
                            valueDefault={row?.stand || ""}
                            onChange={(value) => setValue('stand', value)}
                            error={errors?.stand?.message}
                        />
                        <FieldSelect
                            label={t(langKeys.status)}
                            className="col-6"
                            valueDefault={getValues('status')}
                            onChange={(value) => setValue('status', value ? value.domainvalue : '')}
                            uset={true}
                            error={errors?.status?.message}
                            data={dataStatusUsers}
                            prefixTranslation="status_"
                            optionDesc="domaindesc"
                            optionValue="domainvalue"
                        />
                    </div>

                    <div className="row-zyx">
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.frecuency)}
                            style={{ marginBottom: 8 }}
                            valueDefault={row?.frecuency || ""}
                            onChange={(value) => setValue('frecuency', value)}
                            error={errors?.frecuency?.message}
                        />
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.business_turn)}
                            valueDefault={row?.business_turn || ""}
                            onChange={(value) => setValue('business_turn', value)}
                            error={errors?.business_turn?.message}
                        />
                    </div>

                    <div className="row-zyx">
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.semaphore)}
                            style={{ marginBottom: 8 }}
                            valueDefault={row?.semaphore || ""}
                            onChange={(value) => setValue('semaphore', value)}
                            error={errors?.semaphore?.message}
                        />
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.color)}
                            valueDefault={row?.color || ""}
                            onChange={(value) => setValue('color', value) }
                            error={errors?.color?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.address)}
                            valueDefault={row?.address || ""}
                            onChange={(value) => setValue('address', value)}
                            error={errors?.address?.message}
                        />
                    </div>
                    
                </div>
            </form>
        </div>
    )
}

const Clients: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const classes = useStyles();
    const mainResult = useSelector(state => state.main.mainData);
    const mainMultiResult = useSelector(state => state.main.multiData);
    const executeResult = useSelector(state => state.main.execute);
    const [dataClients, setdataClients] = useState<Dictionary[]>([]);

    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<RowSelected>({ row: null, edit: false });
    const [waitSave, setWaitSave] = useState(false);

    const columns = React.useMemo(
        () => [
            {
                accessor: 'customerid',
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: '1%',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <TemplateIcons
                            viewFunction={() => handleView(row)}
                            deleteFunction={() => handleDelete(row)}
                            editFunction={() => handleEdit(row)}
                        />
                    )
                }
            },
            {
                Header: t(langKeys.description),
                accessor: 'description',
                NoFilter: true
            },
            {
                Header: t(langKeys.code),
                accessor: 'code',
                NoFilter: true
            },
            {
                Header: t(langKeys.address),
                accessor: 'address',
                NoFilter: true
            },
            {
                Header: t(langKeys.stand),
                accessor: 'stand',
                NoFilter: true
            },
            {
                Header: t(langKeys.status),
                accessor: 'status',
                NoFilter: true,
            },
            {
                Header: t(langKeys.frecuency),
                accessor: 'frecuency',
                NoFilter: true
            },
            {
                Header: t(langKeys.business_turn),
                accessor: 'business_turn',
                NoFilter: true
            },
            {
                Header: t(langKeys.semaphore),
                accessor: 'semaphore',
                NoFilter: true
            },

        ],
        []
    );

    const fetchData = () => dispatch(getCollection(getClientSel(0)));

    useEffect(() => {
        // mainResult.data && setdataClients(mainResult.data.map(x => ({ ...x, twofactorauthentication: !!x.twofactorauthentication ? t(langKeys.affirmative) : t(langKeys.negative) })));
        mainResult.data && setdataClients(mainResult.data);
    }, [mainResult]);

    useEffect(() => {
        fetchData();
        dispatch(getMultiCollection([
            getValuesFromDomain("TIPODOCUMENTO"), //0
            getValuesFromDomain("ESTADOUSUARIO"), //1
            getValuesFromDomain("ESTADOGENERICO"), //2
            // getOrgsByCorp(0), //formulario orguser 3
            getRoles(), //formulario orguser 4
            // getClients(), //formulario orguser 5
        ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_delete) }))
                fetchData();
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

    const handleRegister = () => {
        setViewSelected("view-2");
        setRowSelected({ row: null, edit: true });
    }

    const handleView = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected({ row, edit: false });
    }

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected({ row, edit: true });
    }

    const handleDelete = (row: Dictionary) => {
        const callback = () => {
            dispatch(execute(insCostumer({ ...row, operation: 'DELETE', status: 'ELIMINADO', id: row.customerid })));
            dispatch(showBackdrop(true));
            setWaitSave(true);
        }

        dispatch(manageConfirmation({
            visible: true,
            question: t(langKeys.confirmation_delete),
            callback
        }))
    }

    if (viewSelected === "view-1") {

        if (mainResult.error) {
            return <h1>ERROR</h1>;
        }

        return (
            <TableZyx
                columns={columns}
                titlemodule={t(langKeys.clients, { count: 2 })}
                data={dataClients}
                download={true}
                loading={mainResult.loading}
                register={true}
                hoverShadow={true}
                handleRegister={handleRegister}
            />
        )
    }
    else
        return (
            <DetailClient
                data={rowSelected}
                setViewSelected={setViewSelected}
                multiData={mainMultiResult.data}
                fetchData={fetchData}
            />
        )

    return (
        <div>hola</div>
    )
}

export default Clients;