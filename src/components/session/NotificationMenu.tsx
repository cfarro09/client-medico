import { Badge, BadgeProps, Box, BoxProps, createStyles, IconButton, makeStyles, Menu, MenuItem, styled, Theme } from "@material-ui/core";
import { LeadActivityNotification } from "@types";
import paths from "common/constants/paths";
import { useSelector } from "hooks";
import { BellNotificationIcon } from "icons";
import { FC, MouseEventHandler, useState } from "react";
import { useHistory } from "react-router";
import clsx from 'clsx';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import { langKeys } from "lang/keys";
import { useTranslation } from 'react-i18next';

const StyledBadge = styled(Badge)<BadgeProps>(() => ({
    '& .MuiBadge-badge': {
        color: 'white',
        right: 4,
        top: 4,
        backgroundColor: '#FF7301',
        border: `2px solid white`,
        padding: '0 4px',
    },
}));

const useNotificaionStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
            backgroundColor: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'start',
            width: 300,
            maxWidth: 300,
        },
        row: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
        },
        title: {
            fontWeight: 'bold',
        },
        date: {
            fontSize: 11,
            color: 'grey',
        },
        textOneLine: {
            flexGrow: 1,
            lineHeight: 1.1,
            overflow: 'hidden',
        },
        description: {
            width: '100%',
        },
    }),
);

const useNotificationMenuStyles = makeStyles((theme: Theme) =>
    createStyles({
        rootIcon: {
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
        },
        menu: {
            padding: theme.spacing(1),
            maxHeight: 410,
            fontSize: 12,
        },
        noNotificationContainer: {
            height: 90,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
    }),
);

interface NotificaionMenuItemProps {
    title: React.ReactNode;
    description: React.ReactNode;
    // notification: LeadActivityNotification,
    image: string;
    user: string;
    date: React.ReactNode;
    onClick?: MouseEventHandler<HTMLLIElement>;
}

const NotificaionMenuItem: FC<NotificaionMenuItemProps> = ({ title, description, date, onClick, user }) => {
    const classes = useNotificaionStyles();

    return (
        <MenuItem button className={classes.root} onClick={onClick}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                <div style={{ flex: 1 }}>
                    <div className={classes.row}>
                        <div className={classes.textOneLine}>
                            <span className={classes.title}>{title}</span>
                        </div>
                        <div style={{ width: 12 }} />
                        <span className={classes.date}>{date}</span>
                    </div>
                    <div className={clsx(classes.description, classes.textOneLine)}>
                        <span>{description}</span>
                    </div>
                </div>
            </div>
        </MenuItem>
    );
}

const NotificationMenu: FC<BoxProps> = (boxProps) => {
    const classes = useNotificationMenuStyles();
    // const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const resValidateToken = useSelector(state => state.login.validateToken);

    const open = Boolean(anchorEl);
    const notifications = resValidateToken.loading ? [] : resValidateToken?.user?.notifications || [];
    const notificationCount = notifications.length;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (notificationCount === 0) return;
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    console.log(notifications)

    return (
        <Box {...boxProps}>
            <IconButton
                aria-label="bell-notification"
                aria-controls="notification-list-menu-popover"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <div className={classes.rootIcon}>
                    {notificationCount > 0 ?
                        (
                            <StyledBadge badgeContent={notificationCount} color="secondary">
                                <BellNotificationIcon />
                            </StyledBadge>
                        ) :
                        <BellNotificationIcon />}
                </div>
            </IconButton>
            <Menu
                id="notification-list-menu-popover"
                anchorEl={anchorEl}
                open={open}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                onClose={handleClose}
                className={classes.menu}
                MenuListProps={{
                    'aria-labelledby': 'lock-button',
                    role: 'listbox',
                }}
            >
                <div style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 20 }}>{"Próximas citas"}</div>
                {notifications.map((e, i) => (
                    <NotificaionMenuItem
                        key={i}
                        user={e.patient}
                        image={""}
                        title={e.patient}
                        description={"Última sesión: " + e.description}
                        date={e.nextappointmentdate}
                    />
                ))}
            </Menu>
        </Box>
    );
};


export default NotificationMenu;