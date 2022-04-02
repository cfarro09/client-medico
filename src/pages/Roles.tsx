import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSelector } from 'hooks';
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, makeStyles, Typography } from '@material-ui/core';
import { Dictionary, MultiData } from '@types';
import { langKeys } from 'lang/keys';
import { getCollection } from 'store/main/actions';
import { getRoles } from 'common/helpers';
import EditRoleModal from './Modals/EditRoleModal';

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
    container: {
        width: '100%'
    },
    containerDetails: {
        marginTop: theme.spacing(3)
    },
    media: {
        objectFit: "none"
    },
    containerSearch: {
        width: '100%',
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
        width: '220px'
    },
    containerFilterGeneral: {
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: theme.spacing(2),
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
    mb2: {
        marginBottom: theme.spacing(4),
    },
    userResume: {
        color: '#6e6b7b',
        fontFamily: '"Montserrat",Helvetica,Arial,serif',
        fontSize: '14px',
    },
    roleHeading: {
        marginTop: '1rem',
        paddingTop: '0.25rem',
        color: '#5e5873',
        '& a': {
            textDecoration: 'none',
            color: '#7367f0',
            fontWeight: '600',
            fontSize: '.790rem'
        }
    }
}));

const Roles: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const classes = useStyles();
    const mainResult = useSelector(state => state.main.mainData);
    const [openEditRoleModal, setOpenEditRoleModal] = useState(false);
    const [dataRoles, setDataRoles] = useState<Dictionary[]>([]);
    const [roleSelected, setRoleSelected ] = useState<Dictionary | null>(null)

    const [viewSelected, setViewSelected] = useState("view-1");
    const fetchData = () => dispatch(getCollection(getRoles()));

    useEffect(() => {
        mainResult.data && setDataRoles(mainResult.data);
    }, [mainResult]);

    useEffect(() => {
        fetchData();
    }, []);

    const triggerRoleSelected = (item: Dictionary) => {
        setRoleSelected(item)
        setOpenEditRoleModal(true)
    }

    if (viewSelected === "view-1") {
        return (
            <div className={classes.container}>
                <Box className={classes.containerHeader} justifyContent="space-between" alignItems="center" style={{ marginBottom: 8 }}>
                    <span className={classes.title}>
                        {t(langKeys.role_plural)}
                    </span>
                </Box>
                {/* <Box className={classes.containerFilterGeneral}>
                    <span></span>
                    <div className={classes.containerSearch}>
                        <SearchField
                            colorPlaceHolder='#FFF'
                            // handleChangeOther={handleFiend}
                            lazy
                        />
                    </div>
                </Box> */}
                <div className={classes.containerDetails}>
                    <Grid container spacing={3} >
                        {dataRoles.map((role, index) => (
                            <Grid item key={"role_" + role.reportid + "_" + index} xs={12} md={4} lg={3} style={{ minWidth: 360 }}>
                                <Card >
                                    {/* <CardActionArea onClick={() => handleSelected(report, role.filters)}> */}
                                    <CardActionArea onClick={() => triggerRoleSelected(role)}>
                                        {/* <CardMedia
                                            component="img"
                                            height="140"
                                            className={classes.media}
                                            // image={reportsImage.find(x => x.name === role.image)?.image || 'no_data.png'}
                                            title={t('report_' + role?.origin)}
                                        /> */}
                                        <CardContent>
                                            <div className={classes.userResume}>
                                                <span>{'Total ' + role?.user_count + ' ' + (t(langKeys.user_plural).toLowerCase())}</span>
                                            </div>

                                            <div className={classes.roleHeading}>
                                                <div>
                                                    <Typography gutterBottom variant="h6" component="div">
                                                        {(t(role?.roldesc))}
                                                    </Typography>
                                                    <Typography component='a'>{(t(langKeys.edit) + ' ' + t(langKeys.role))}</Typography>
                                                </div>
                                            </div>
                                            {/* <Typography gutterBottom variant="h6" component="div">
                                                {t(role?.roldesc)}
                                            </Typography> */}
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                        <EditRoleModal
                            openEditRoleModal={openEditRoleModal}
                            setOpenEditRoleModal={setOpenEditRoleModal}
                            roleSelected={roleSelected}
                        />
                    </Grid>
                </div>
            </div>
        );
    } 

    return(
        <div>
            hola
        </div>
    )
}
export default Roles;