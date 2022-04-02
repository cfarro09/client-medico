import React, { FC, useEffect, useMemo, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { useDispatch } from 'react-redux';
import { Dictionary, IUserSelType } from '@types';
import { getMultiCollectionAux } from 'store/main/actions';
import { DialogZyx } from 'components';
import { Checkbox, CircularProgress } from '@material-ui/core';
import { getTypeUserSel } from 'common/helpers';
import TableZyx from 'components/fields/table-simple';

interface SelectMerchantUserModalProps {
    setOpenMerchantUserModal: (param: any) => void;
    openMerchantUserModal: boolean;
    onClick: (person: IUserSelType) => void;
}

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
}));

const SelectMerchantUserModal: React.FC<SelectMerchantUserModalProps> = ({ setOpenMerchantUserModal, openMerchantUserModal, onClick }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const multiResultAux = useSelector(state => state.main.multiDataAux);
    const [dataMerchantUser, setDataMerchantUser] = useState<Dictionary[]>([]);

    const columns = useMemo(
        () => [
            {
                accessor: 'id',
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: '1%',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <Checkbox
                            color="primary"
                            onClick={() => {
                                onClick(row);
                                setOpenMerchantUserModal(false);
                            }}
                        />
                    );
                }
            },
            {
                Header: t(langKeys.name),
                accessor: 'description' as keyof IUserSelType,
            },
            {
                Header: t(langKeys.documenttype),
                accessor: 'doctype' as keyof IUserSelType,
            },
            {
                Header: t(langKeys.documentnumber),
                accessor: 'docnum' as keyof IUserSelType,
            },
            {
                Header: t(langKeys.status),
                accessor: 'status' as keyof IUserSelType,
            },
            {
                Header: t(langKeys.email),
                accessor: 'email' as keyof IUserSelType,
            },
            {
                Header: t(langKeys.phone),
                accessor: 'phone' as keyof IUserSelType,
            }
        ],
        [],
    );

    useEffect(() => {
        if (openMerchantUserModal) {
            dispatch(getMultiCollectionAux([getTypeUserSel(5)]));
        }
    }, [openMerchantUserModal])

    useEffect(() => {
        if (!multiResultAux.loading && !multiResultAux.error) {
            const found = multiResultAux.data.find(x => x.key === 'UFN_TYPE_USERS_SEL');
            if (found) {
                setDataMerchantUser(found.data)
            }
        }
    }, [multiResultAux]);

    return (
        <DialogZyx
            open={openMerchantUserModal}
            title=""
            buttonText1={t(langKeys.cancel)}
            handleClickButton1={() => setOpenMerchantUserModal(false)}
            button2Type="submit"
            maxWidth={'lg'}
        >
            <div>
                {multiResultAux.loading ? (
                    <div style={{ textAlign: 'center' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <div>
                        <TableZyx
                            columns={columns}
                            titlemodule={t(langKeys.merchant_user, { count: 2 })}
                            data={dataMerchantUser}
                            loading={multiResultAux.loading}
                            download={false}
                            hoverShadow
                            autotrigger
                        />
                    </div>
                )}
            </div>
        </DialogZyx>
    )
}

export default SelectMerchantUserModal;