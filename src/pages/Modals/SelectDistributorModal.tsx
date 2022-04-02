import React, { FC, useEffect, useMemo, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { useDispatch } from 'react-redux';
import { Dictionary, IDistributor } from '@types';
import { getMultiCollectionAux } from 'store/main/actions';
import { DialogZyx } from 'components';
import { Checkbox, CircularProgress } from '@material-ui/core';
import { getDistributorSel } from 'common/helpers';
import TableZyx from 'components/fields/table-simple';

interface SelectDistributorModalProps {
    setOpenDistributorModal: (param: any) => void;
    openDistributorModal: boolean;
    onClick: (person: IDistributor) => void;
}

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
}));

const SelectDistributorModal: React.FC<SelectDistributorModalProps> = ({ setOpenDistributorModal, openDistributorModal, onClick }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const multiResultAux = useSelector(state => state.main.multiDataAux);
    const [dataDistributor, setDataDistributor] = useState<Dictionary[]>([]);

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
                                setOpenDistributorModal(false);
                            }}
                        />
                    );
                }
            },
            {
                Header: t(langKeys.name),
                accessor: 'distributor_name' as keyof IDistributor,
            },
            {
                Header: t(langKeys.address),
                accessor: 'address' as keyof IDistributor,
            },
            {
                Header: t(langKeys.status),
                accessor: 'status' as keyof IDistributor,
            },
            {
                Header: t(langKeys.code),
                accessor: 'code' as keyof IDistributor,
            },
            {
                Header: t(langKeys.area),
                accessor: 'area' as keyof IDistributor,
            }
        ],
        [],
    );

    useEffect(() => {
        if (openDistributorModal) {
            dispatch(getMultiCollectionAux([getDistributorSel(0)]));
        }
    }, [openDistributorModal])

    useEffect(() => {
        if (!multiResultAux.loading && !multiResultAux.error) {
            const found = multiResultAux.data.find(x => x.key === 'UFN_DISTRIBUTOR_SEL');
            if (found) {
                setDataDistributor(found.data)
            }
        }
    }, [multiResultAux]);

    return (
        <DialogZyx
            open={openDistributorModal}
            title=""
            buttonText1={t(langKeys.cancel)}
            handleClickButton1={() => setOpenDistributorModal(false)}
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
                            titlemodule={t(langKeys.distributor, { count: 2 })}
                            data={dataDistributor}
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

export default SelectDistributorModal;