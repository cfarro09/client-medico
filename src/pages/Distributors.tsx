import React, { FC, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dictionary, MultiData, IDistributor } from '@types';
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TemplateIcons, TitleDetail } from 'components';
import { langKeys } from 'lang/keys';
import {
    getCollection, resetAllMain, getMultiCollection,
    execute
} from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
import TableZyx from 'components/fields/table-simple';
import { getDistributorSel, getValuesFromDomain, insDistributor } from 'common/helpers';
import { useForm } from 'react-hook-form';
import { Button, makeStyles } from '@material-ui/core';
import {
    Save as SaveIcon,
    Clear as ClearIcon,
} from '@material-ui/icons';

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
    { id: "view-1", name: "Distributors" },
    { id: "view-2", name: "Distributor detail" }
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

const DetailDistibutor: React.FC<DetailProps> = ({ data: { row, edit }, setViewSelected, multiData, fetchData }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);

    const dataStatus = multiData[0] && multiData[0].success ? multiData[0].data : [];

    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: {
            id: row ? row.distributorid: 0,
            distributor_name: row?.distributor_name || '',
            status: row ? row.status : 'ACTIVO',
            type: 'NINGUNO',
            code: row?.code || '',
            area: row?.area || '',
            operation: row ? "UPDATE" : "INSERT",
        }
    });

    React.useEffect(() => {
        register('distributor_name', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('status', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('code');
        register('area');
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

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(execute(insDistributor({...data, description: data.distributor_name})));
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
                            title={row ? `${row.distributor_name}` : t(langKeys.newdistributor)}
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
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.description)}
                            style={{ marginBottom: 8 }}
                            valueDefault={getValues('distributor_name')}
                            onChange={(value) => setValue('distributor_name', value)}
                            error={errors?.distributor_name?.message}
                        />
                        <FieldSelect
                            label={t(langKeys.status)}
                            className="col-6"
                            valueDefault={getValues('status')}
                            onChange={(value) => setValue('status', value ? value.domainvalue : '')}
                            uset={true}
                            error={errors?.status?.message}
                            data={dataStatus}
                            prefixTranslation="status_"
                            optionDesc="domaindesc"
                            optionValue="domainvalue"
                        />
                    </div>

                    <div className="row-zyx">
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.code)}
                            style={{ marginBottom: 8 }}
                            valueDefault={getValues('code')}
                            onChange={(value) => setValue('code', value)}
                            error={errors?.code?.message}
                        />
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.area)}
                            style={{ marginBottom: 8 }}
                            valueDefault={getValues('area')}
                            onChange={(value) => setValue('area', value)}
                            error={errors?.area?.message}
                        />
                    </div>
                </div>
            </form>
        </div>
    )
}

const Distributors: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector(state => state.main.mainData);
    const mainMultiResult = useSelector(state => state.main.multiData);
    const executeResult = useSelector(state => state.main.execute);
    const [dataDistributor, setDataDistributor] = useState<Dictionary[]>([]);
    
    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<RowSelected>({ row: null, edit: false });
    const [waitSave, setWaitSave] = useState(false);

    const columns = React.useMemo(
        () => [
            {
                accessor: 'distributorid',
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
                Header: t(langKeys.name),
                accessor: 'distributor_name' as keyof IDistributor,
                NoFilter: true
            },
            {
                Header: t(langKeys.status),
                accessor: 'status' as keyof IDistributor,
                NoFilter: true,
            },
            {
                Header: t(langKeys.code),
                accessor: 'code' as keyof IDistributor,
                NoFilter: true
            },
            {
                Header: t(langKeys.area),
                accessor: 'area' as keyof IDistributor,
                NoFilter: true
            },
        ],
        []
    );

    const fetchData = () => dispatch(getCollection(getDistributorSel(0)));

    useEffect(() => {
        // if (!mainResult.error && !mainResult.loading && mainResult.key === 'UFN_DISTRIBUTOR_SEL') {
        //     console.log('aca')
        //     setDataDistributor(mainResult.data);
        // }
        mainResult.data && setDataDistributor(mainResult.data);
    }, [mainResult]);

    useEffect(() => {
        fetchData();
        dispatch(getMultiCollection([
            getValuesFromDomain("ESTADOGENERICO"), //0
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
            dispatch(execute(insDistributor({ ...row, operation: 'DELETE', status: 'ELIMINADO', id: row.distributorid, description: row.distributor_name })));
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
                titlemodule={t(langKeys.distributors, { count: 2 })}
                data={dataDistributor}
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
            <DetailDistibutor
                data={rowSelected}
                setViewSelected={setViewSelected}
                multiData={mainMultiResult.data}
                fetchData={fetchData}
            />
        )
}

export default Distributors;