/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import { DialogZyx, TemplateIcons, TemplateBreadcrumbs, TitleDetail, FieldView, FieldEdit, FieldSelect, FieldMultiSelect, TemplateSwitch } from 'components';
import { getOrgUserSel, getUserSel, getValuesFromDomain, getOrgsByCorp, getClients, getStoresByClientId, getApplicationsByRole, insUser, insOrgUser, randomText, getRoles, getTypeUserSel, getSectorSel } from 'common/helpers';
import { Dictionary, MultiData } from "@types";
import TableZyx from '../components/fields/table-simple';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { useForm } from 'react-hook-form';
import Avatar from '@material-ui/core/Avatar';
import { uploadFile } from 'store/main/actions';
import {
    getCollection, resetAllMain, getMultiCollection,
    execute, getCollectionAux, resetMainAux, getMultiCollectionAux
} from 'store/main/actions';
import { showSnackbar, showBackdrop, manageConfirmation } from 'store/popus/actions';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import AddIcon from '@material-ui/icons/Add';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import ClearIcon from '@material-ui/icons/Clear';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import { Divider, Grid, ListItem, Box, IconButton } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import DeleteIcon from '@material-ui/icons/Delete';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

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
interface ModalProps {
    data: RowSelected;
    multiData: MultiData[];
    preData: (Dictionary | null)[]; //ORGANIZATIONS
    openModal?: boolean;
    setOpenModal?: (open: boolean) => void;
    updateRecords?: (record: any) => void; //SETDATAORGANIZATION
    triggerSave?: boolean;
    index: number;
    setAllIndex: (index: any) => void;
    handleDelete: (row: Dictionary | null, index: number) => void;
}
const arrayBread = [
    { id: "view-1", name: "Users" },
    { id: "view-2", name: "User detail" }
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
    }
}));
const ListItemSkeleton: FC = () => (
    <ListItem style={{ display: 'flex', paddingLeft: 0, paddingRight: 0, paddingBottom: 8 }}>
        <Box style={{ padding: 20, backgroundColor: 'white', display: 'flex', flexDirection: 'column', flexGrow: 1, }}>
            <Grid container direction="column">
                <Grid container direction="row" spacing={1}>
                    <Grid item sm={12} xl={12} xs={12} md={12} lg={12}>
                        <Skeleton />
                    </Grid>
                </Grid>
                <Divider style={{ margin: '10px 0' }} />
                <Grid container direction="row" spacing={1}>
                    <Grid item sm={12} xl={12} xs={12} md={12} lg={12}>
                        <Skeleton />
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    </ListItem>
)

interface ModalPasswordProps {
    openModal: boolean;
    setOpenModal: (value: boolean) => any;
    data: any;
    parentSetValue: (...param: any) => any;
}

const ModalPassword: React.FC<ModalPasswordProps> = ({ openModal, setOpenModal, data, parentSetValue }) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, setValue, getValues, formState: { errors }, trigger, clearErrors } = useForm({
        defaultValues: {
            password: '',
            confirmpassword: '',
        }
    });

    useEffect(() => {
        setValue('password', data?.password);
        setValue('confirmpassword', data?.password);
        
    }, [data]);

    const validateSamePassword = (value: string): any => {
        return getValues('password') === value;
    }

    useEffect(() => {
        register('password', { validate: (value: any) => (value && value.length) || t(langKeys.field_required) });
        register('confirmpassword', {
            validate: {
                validate: (value: any) => (value && value.length) || t(langKeys.field_required),
                same: (value: any) => validateSamePassword(value) || "Contraseñas no coinciden"
            }
        });
    }, [])

    const handleCancelModal = () => {
        setOpenModal(false);
        setValue('password', data?.password);
        setValue('confirmpassword', data?.password);
        clearErrors();
    }

    const onSubmitPassword = handleSubmit((data) => {
        parentSetValue('password', data.password);
        setOpenModal(false);
    });

    return (
        <DialogZyx
            open={openModal}
            title={t(langKeys.setpassword)}
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.save)}
            handleClickButton1={handleCancelModal}
            handleClickButton2={onSubmitPassword}
        >
            <div className="row-zyx">
                <FieldEdit
                    label={t(langKeys.password)}
                    className="col-6"
                    valueDefault={getValues('password')}
                    type={showPassword ? 'text' : 'password'}
                    onChange={(value) => setValue('password', value)}
                    error={errors?.password?.message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <FieldEdit
                    label={t(langKeys.confirmpassword)}
                    className="col-6"
                    valueDefault={getValues('confirmpassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    onChange={(value) => setValue('confirmpassword', value)}
                    error={errors?.confirmpassword?.message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                >
                                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </div>
        </DialogZyx>
    )
}

const DetailUsers: React.FC<DetailProps> = ({ data: { row, edit }, setViewSelected, multiData, fetchData }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [waitSave, setWaitSave] = useState(false);
    const executeRes = useSelector(state => state.main.execute);
    const detailRes = useSelector(state => state.main.mainAux); //RESULTADO DEL DETALLE

    const [dataOrganizations, setDataOrganizations] = useState<(Dictionary | null)[]>([]);
    const [orgsToDelete, setOrgsToDelete] = useState<Dictionary[]>([]);
    const [openDialogPassword, setOpenDialogPassword] = useState(false);
    const [allIndex, setAllIndex] = useState([])
    const [getOrganizations, setGetOrganizations] = useState(false);
    const [triggerSave, setTriggerSave] = useState(false)
    
    const dataDocType = multiData[0] && multiData[0].success ? multiData[0].data : [];
    const dataStatusUsers = multiData[2] && multiData[2].success ? multiData[2].data : [];
    const roleData = multiData[3] && multiData[3].success ? multiData[3].data : [];
    const supervisorData = multiData[4] && multiData[4].success ? multiData[4].data : [];
    const sectorData = multiData[5] && multiData[5].success ? multiData[5].data : [];

    // useEffect(() => { //RECIBE LA DATA DE LAS ORGANIZACIONES 
    //     if (!detailRes.loading && !detailRes.error && getOrganizations) {
    //         setDataOrganizations(detailRes.data);
    //     }
    // }, [detailRes]);

    // const handleRegister = () => {
    //     setDataOrganizations(p => [...p, null]);
    // }
    // const handleDelete = (row: Dictionary | null, index: number) => {
    //     if (row && row.operation !== "INSERT") {
    //         setOrgsToDelete(p => [...p, { ...row, operation: "DELETE", status: 'ELIMINADO' }]);
    //     }
    //     if (row)
    //         setDataOrganizations(p => p.filter((x) => row.orgid !== x?.orgid));
    //     else
    //         setDataOrganizations(p => p.filter((x, i) => i !== index));
    // }

    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: {
            type: 'NINGUNO',
            id: row ? row.userid : 0,
            operation: row ? "UPDATE" : "INSERT",
            firstname: row?.firstname || '',
            lastname: row?.lastname || '',
            password: row?.password || '',
            usr: row?.usr || '',
            email: row?.email || '',
            doctype: row?.doctype || '',
            docnum: row?.docnum || '',
            status: row?.status || 'ACTIVO',
            roleid: row?.roleid || 0,
            zone: row?.zone || '',
            address: row?.address || '',
            district: row?.district || '',
            phone: row?.phone || '',
            supervisorid : row?.supervisorid || 0,
            sectorid: row?.sectorid || 0
        }
    });

    useEffect(() => {
        if (waitSave) {
            if (!executeRes.loading && !executeRes.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(row ? langKeys.successful_edit : langKeys.successful_register) }))
                fetchData && fetchData();
                dispatch(showBackdrop(false));
                setViewSelected("view-1")
            } else if (executeRes.error) {
                const errormessage = t(executeRes.code || "error_unexpected_error", { module: t(langKeys.user).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                setWaitSave(false);
                dispatch(showBackdrop(false));
            }
        }
    }, [executeRes, waitSave])

    React.useEffect(() => {
        register('type');
        register('id');
        register('password');
        register('supervisorid');
        register('sectorid');
        register('status', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('firstname', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('lastname', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('email', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('usr', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('doctype', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('docnum', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('roleid', { validate: (value) => (value && value > 0) || t(langKeys.field_required) });
        register('zone', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('address', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('district', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register('phone', { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        dispatch(resetMainAux())
    }, [register]);

    useEffect(() => {
        if (allIndex.length === dataOrganizations.length && triggerSave) {
            setTriggerSave(false);
            const error = allIndex.some((x: any) => !x.allOk)
            if (error) {
                return
            }
            const data = getValues();

            const callback = () => {
                dispatch(showBackdrop(true));
                dispatch(execute(insUser(data)));
                setWaitSave(true)
            }

            dispatch(manageConfirmation({
                visible: true,
                question: t(langKeys.confirmation_save),
                callback
            }))
        }
    }, [allIndex, triggerSave])


    const onSubmit = handleSubmit((data) => {
        if (!row && !data.password) {
            dispatch(showSnackbar({ show: true, success: false, message: t(langKeys.password_required) }));
            return;
        }
        setAllIndex([])
        setTriggerSave(true)
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
                            title={row ? `${row.firstname} ${row.lastname}` : t(langKeys.newuser)}
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
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="button"
                                    startIcon={<LockOpenIcon color="secondary" />}
                                    onClick={() => setOpenDialogPassword(true)}
                                >{t(row ? langKeys.changePassword : langKeys.setpassword)}</Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    startIcon={<SaveIcon color="secondary" />}
                                    style={{ backgroundColor: "#55BD84" }}
                                >{t(langKeys.save)}</Button>
                            </>
                        }
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <div className="row-zyx">

                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.firstname)}
                            style={{ marginBottom: 8 }}
                            valueDefault={row?.firstname || ""}
                            onChange={(value) => setValue('firstname', value)}
                            error={errors?.firstname?.message}
                        />
                        <FieldEdit
                            className="col-6"
                            label={t(langKeys.lastname)}
                            valueDefault={row?.lastname || ""}
                            onChange={(value) => setValue('lastname', value)}
                            error={errors?.lastname?.message}
                        />

                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.email)}
                            className="col-6"
                            valueDefault={row?.email || ""}
                            onChange={(value) => setValue('email', value)}
                            error={errors?.email?.message}
                        />
                        <FieldEdit
                            label={t(langKeys.user)}
                            className="col-6"
                            valueDefault={row?.usr || ""}
                            onChange={(value) => setValue('usr', value)}
                            error={errors?.usr?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            label={t(langKeys.docType)}
                            className="col-6"
                            valueDefault={row?.doctype || ""}
                            onChange={(value) => setValue('doctype', value ? value.domainvalue : '')}
                            error={errors?.doctype?.message}
                            data={dataDocType}
                            optionDesc="domaindesc"
                            optionValue="domainvalue"
                        />
                        <FieldEdit
                            label={t(langKeys.docNumber)}
                            className="col-6"
                            valueDefault={row?.docnum || ""}
                            onChange={(value) => setValue('docnum', value)}
                            error={errors?.docnum?.message}
                        />
                    </div>

                    <div className="row-zyx">
                        <FieldSelect
                            label={t(langKeys.status)}
                            className="col-6"
                            valueDefault={row?.status || "ACTIVO"}
                            onChange={(value) => setValue('status', value ? value.domainvalue : '')}
                            uset={true}
                            error={errors?.status?.message}
                            data={dataStatusUsers}
                            prefixTranslation="status_"
                            optionDesc="domaindesc"
                            optionValue="domainvalue"
                        />
                        <FieldSelect
                            label={t(langKeys.role)}
                            className="col-6"
                            valueDefault={row?.roleid || ""}
                            onChange={(value) => setValue('roleid', value ? value.roleid : '')}
                            error={errors?.roleid?.message}
                            data={roleData}
                            optionDesc="roldesc"
                            optionValue="roleid"
                        />
                    </div>

                    <div className="row-zyx">
                        <FieldSelect
                            label={t(langKeys.supervisor)}
                            className="col-6"
                            valueDefault={getValues('supervisorid')}
                            onChange={(value) => setValue('supervisorid', value ? value.userid : 0)}
                            error={errors?.supervisorid?.message}
                            data={supervisorData.map(i => ({...i, filter: i.docnum + '-' + i.description}))}
                            optionDesc="filter"
                            optionValue="userid"
                        />
                        <FieldEdit
                            label={t(langKeys.address)}
                            className="col-6"
                            valueDefault={row?.address || ""}
                            onChange={(value) => setValue('address', value)}
                            error={errors?.address?.message}
                        />
                    </div>

                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.district)}
                            className="col-6"
                            valueDefault={row?.district || ""}
                            onChange={(value) => setValue('district', value)}
                            error={errors?.district?.message}
                        />
                        <FieldEdit
                            label={t(langKeys.phone)}
                            className="col-6"
                            valueDefault={row?.phone || ""}
                            onChange={(value) => setValue('phone', value)}
                            error={errors?.phone?.message}
                        />
                    </div>

                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.zone)}
                            className="col-6"
                            valueDefault={row?.zone || ""}
                            onChange={(value) => setValue('zone', value)}
                            error={errors?.zone?.message}
                        />
                        <FieldSelect
                            label={'Sector'}
                            className="col-6"
                            valueDefault={getValues('sectorid')}
                            onChange={(value) => setValue('sectorid', value ? value.sectorid : 0)}
                            error={errors?.sectorid?.message}
                            data={sectorData}
                            optionDesc="description"
                            optionValue="sectorid"
                        />
                    </div>
                </div>
            </form>

            <ModalPassword
                openModal={openDialogPassword}
                setOpenModal={setOpenDialogPassword}
                data={getValues()}
                parentSetValue={setValue}
            />
        </div>
    );
}

const Users: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector(state => state.main.mainData);
    const mainMultiResult = useSelector(state => state.main.multiData);
    const executeResult = useSelector(state => state.main.execute);
    const [dataUsers, setdataUsers] = useState<Dictionary[]>([]);

    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<RowSelected>({ row: null, edit: false });
    const [waitSave, setWaitSave] = useState(false);
    const applications = useSelector(state => state.login?.validateToken?.user?.menu);

    const columns = React.useMemo(
        () => [
            {
                accessor: 'userid',
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
                Header: t(langKeys.user),
                accessor: 'usr',
                NoFilter: true
            },
            {
                Header: t(langKeys.fullname),
                accessor: 'description',
                NoFilter: true
            },
            {
                Header: t(langKeys.docNumber),
                accessor: 'docnum',
                NoFilter: true
            },
            {
                Header: t(langKeys.email),
                accessor: 'email',
                NoFilter: true
            },
            {
                Header: t(langKeys.role),
                accessor: 'role_name',
                NoFilter: true
            },
            {
                Header: t(langKeys.status),
                accessor: 'status',
                NoFilter: true,
            },

        ],
        []
    );

    const fetchData = () => dispatch(getCollection(getUserSel(0)));

    useEffect(() => {
        if (applications) {
            console.log('applications', applications['/user'])
        }
    },[applications])

    useEffect(() => {
        mainResult.data && setdataUsers(mainResult.data.map(x => ({ ...x, twofactorauthentication: !!x.twofactorauthentication ? t(langKeys.affirmative) : t(langKeys.negative) })));
    }, [mainResult]);

    useEffect(() => {
        fetchData();
        dispatch(getMultiCollection([
            getValuesFromDomain("TIPODOCUMENTO"), //0
            getValuesFromDomain("ESTADOUSUARIO"), //1
            getValuesFromDomain("ESTADOGENERICO"), //2
            getRoles(), //formulario orguser 4
            getTypeUserSel(4),
            getSectorSel(),
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
            dispatch(execute(insUser({ ...row, operation: 'DELETE', status: 'ELIMINADO', id: row.userid })));
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
                titlemodule={t(langKeys.user, { count: 2 })}
                data={dataUsers}
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
            <DetailUsers
                data={rowSelected}
                setViewSelected={setViewSelected}
                multiData={mainMultiResult.data}
                fetchData={fetchData}
            />
        )
}

export default Users;