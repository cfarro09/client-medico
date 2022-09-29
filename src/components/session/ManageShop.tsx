import React, { FC } from "react";
import { changeShop } from 'store/login/actions';

import { FieldSelect } from 'components';
import { showSnackbar, showBackdrop } from 'store/popus/actions';
import { useTranslation } from 'react-i18next';

import { useSelector } from 'hooks';
import { useDispatch } from 'react-redux';

const ManageShop: FC = () => {
    const dispatch = useDispatch();

    const { t } = useTranslation();

    const user = useSelector(state => state.login.validateToken.user);

    const resChangeShop = useSelector(state => state.login.triggerChangeShop);
    const [triggerSave, setTriggerSave] = React.useState(false)

    const handleChangeShop = (value: any) => {
        if (value) {
            dispatch(changeShop(value.corpid, value.shopid));
            dispatch(showBackdrop(true));
            setTriggerSave(true)
        }
    }

    React.useEffect(() => {
        if (triggerSave) {
            if (!resChangeShop.loading && !resChangeShop.error) {
                dispatch(showBackdrop(false));
                window.location.reload()
                // dispatch(wsConnect({ userid: user?.userid, orgid: user?.orgid, usertype: 'PLATFORM' }));
                // // history.replace(`/`);
                // setTimeout(() => {
                //     history.push(redirect);
                // });
            } else if (resChangeShop.error) {
                const errormessage = t(resChangeShop.code || "error_unexpected_error")
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                setTriggerSave(false);
                dispatch(showBackdrop(false));
            }
        }
        // return () => {
        //     dispatch(resetChangeShop());
        // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resChangeShop, triggerSave])

    return (
        <FieldSelect
            label="Organization"
            valueDefault={user?.shopid}
            className="w-full"
            onChange={handleChangeShop}
            variant="outlined"
            disabled={resChangeShop.loading}
            data={user?.shops!!}
            optionDesc="shop_name"
            optionValue="shopid"
        />
    );
};

export default ManageShop;
