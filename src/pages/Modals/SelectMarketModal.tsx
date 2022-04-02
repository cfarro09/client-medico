import React, { FC, useEffect, useMemo, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { useDispatch } from 'react-redux';
import { Dictionary, IMarket } from '@types';
import { getMultiCollectionAux } from 'store/main/actions';
import { DialogZyx } from 'components';
import { Checkbox, CircularProgress } from '@material-ui/core';
import { getMarketSel } from 'common/helpers';
import TableZyx from 'components/fields/table-simple';

interface SelectMarketModalProps {
    setOpenMarketModal: (param: any) => void;
    openMarketModal: boolean;
    onClick: (person: IMarket) => void;
}

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
}));

const SelectMarketModal: React.FC<SelectMarketModalProps> = ({ setOpenMarketModal, openMarketModal, onClick }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const multiResultAux = useSelector(state => state.main.multiDataAux);
    const [dataClients, setdataClients] = useState<Dictionary[]>([]);

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
                                setOpenMarketModal(false);
                            }}
                        />
                    );
                }
            },
            {
                Header: t(langKeys.name),
                accessor: 'market_name' as keyof IMarket,
            },
            {
                Header: t(langKeys.address),
                accessor: 'address' as keyof IMarket,
            },
            {
                Header: t(langKeys.status),
                accessor: 'status' as keyof IMarket,
            },
            {
                Header: t(langKeys.district),
                accessor: 'district' as keyof IMarket,
            },
            {
                Header: t(langKeys.province),
                accessor: 'province' as keyof IMarket,
            },
            {
                Header: t(langKeys.department),
                accessor: 'department' as keyof IMarket,
            },
        ],
        [],
    );

    useEffect(() => {
        if (openMarketModal) {
            dispatch(getMultiCollectionAux([getMarketSel(0)]));
        }
    }, [openMarketModal])

    useEffect(() => {
        if (!multiResultAux.loading && !multiResultAux.error) {
            const found = multiResultAux.data.find(x => x.key === 'UFN_MARKET_SEL');
            if (found) {
                setdataClients(found.data)
            }
        }
    }, [multiResultAux]);

    return (
        <DialogZyx
            open={openMarketModal}
            title=""
            buttonText1={t(langKeys.cancel)}
            handleClickButton1={() => setOpenMarketModal(false)}
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
                            titlemodule={t(langKeys.market, { count: 2 })}
                            data={dataClients}
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

export default SelectMarketModal;