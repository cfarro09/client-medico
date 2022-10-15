/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, Fragment } from 'react'; // we need this to make JSX compile
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Alert from '@material-ui/lab/Alert';
import Container from '@material-ui/core/Container';
import { useSelector } from 'hooks';
import CircularProgress from '@material-ui/core/CircularProgress';
import Popus from 'components/layout/Popus';
import { useDispatch } from 'react-redux';
import { login } from 'store/login/actions';
import { getAccessToken } from 'common/helpers';
import { useHistory } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { showSnackbar } from 'store/popus/actions';
import { useLocation } from "react-router-dom";

export const useStyles = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    containerLogin: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center'
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    progress: {
        margin: theme.spacing(2, 'auto', 3),
        display: 'block'
    },
    alert: {
        display: 'inline-flex',
        width: '100%'
    },
    alertheader: {
        display: 'inline-flex',
        width: '100%',
        marginTop: theme.spacing(1),
    },
    childContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    buttonGoogle: {
        '& button': {
            width: '100%',
            justifyContent: 'center',
        }
    }
}));

export function Copyright() {
    return (
        <Fragment>
            <Typography variant="body2" color="textPrimary" align="center">
                {'Copyright © '} IEE {new Date().getFullYear()}
            </Typography>
        </Fragment>
    );
}

type IAuth = {
    username: string,
    password: string
}

const SignIn = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const location = useLocation();

    const history = useHistory();

    const dispatch = useDispatch();
    const resLogin = useSelector(state => state.login.login);

    const [dataAuth, setDataAuth] = useState<IAuth>({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleMouseDownPassword = (event: any) => event.preventDefault();

    const onSubmitLogin = (e: any) => {
        e.preventDefault();
        dispatch(login(dataAuth.username, dataAuth.password));
    }

    useEffect(() => {
        const ff = location.state || {} as any;
        if (!!ff?.showSnackbar) {
            dispatch(showSnackbar({ show: true, success: true, message: ff?.message || "" }))
        }
    }, [location]);

    useEffect(() => {
        if (getAccessToken()) {
            history.push('/');
        }
    }, [])

    useEffect(() => {
        if (!resLogin.error && resLogin.user && getAccessToken()) {
            // dispatch(connectAgentUI(resLogin.user.automaticConnection!!))
            history.push(resLogin.user.redirect ? resLogin.user.redirect : "/user");
        }
    }, [resLogin]);

    return (
        <Container component="main" maxWidth="xs" className={classes.containerLogin}>
            <div className={classes.childContainer}>
                <img src="./logo.png" alt="titledev" width="350" style={{marginLeft: 'auto', marginRight: 'auto'}} />
                <div className={classes.paper}>
                    {resLogin.error && (
                        <Alert className={classes.alertheader} variant="filled" severity="error">
                            {t(resLogin.code || "error_unexpected_error")}
                        </Alert>
                    )}
                    <form
                        className={classes.form}
                        onSubmit={onSubmitLogin}
                    >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            required
                            value={dataAuth.username}
                            onChange={e => setDataAuth(p => ({ ...p, username: e.target.value.trim() }))}
                            label={t(langKeys.username)}
                            name="usr"
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            required
                            label={t(langKeys.password)}
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={dataAuth.password}
                            onChange={e => setDataAuth(p => ({ ...p, password: e.target.value.trim() }))}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {!resLogin.loading ?
                            <div style={{ alignItems: 'center' }}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}>
                                    <Trans i18nKey={langKeys.logIn} />
                                </Button>
                            </div> :
                            <CircularProgress className={classes.progress} />
                        }
                    </form>
                </div>
                <Box mt={8}>
                    <Copyright />
                </Box>
            </div>
            <Popus />
        </Container>)
}

export default SignIn;