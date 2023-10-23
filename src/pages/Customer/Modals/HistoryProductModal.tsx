import { DialogZyx } from "components";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Dictionary } from "@types";
import { getMultiCollection } from "store/main/actions";
import { getProductHistoricalList } from "common/helpers";
import { useSelector } from "hooks";
import TableZyx from "components/fields/table-simple";

export interface modalPorps {
    parentData: Dictionary | null;
    openModal: boolean;
    setOpenModal: (param: boolean) => void;

}

const ddw = [{
    "precio_unitaria": "S/. 20.00",
    "precio_facturacion": "S/. 20.00",
    "precio_pvo": "S/. 20.00",
    "bonificacion": "S/. 1.00",
    "createdate": "20/10/2023"
},
{
    "precio_unitaria": "S/. 18.00",
    "precio_facturacion": "S/. 18.00",
    "precio_pvo": "S/. 18.00",
    "bonificacion": "S/. 1.00",
    "createdate": "20/09/2023"
},
{
    "precio_unitaria": "S/. 15.00",
    "precio_facturacion": "S/. 15.00",
    "precio_pvo": "S/. 15.00",
    "bonificacion": "S/. 0.00",
    "createdate": "20/08/2023"
},
{
    "precio_unitaria": "S/. 14.00",
    "precio_facturacion": "S/. 14.00",
    "precio_pvo": "S/. 14.00",
    "bonificacion": "S/. 0.00",
    "createdate": "20/07/2023"
}]

const HistoryProduct: React.FC<modalPorps> = ({
    parentData,
    openModal,
    setOpenModal
}) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const multiData = useSelector((state) => state.main.multiData);
    const [data, setData] = useState<Dictionary[]>([]);
    
    const columns = React.useMemo(
        () => [
            {
                Header: "P. unitario",
                accessor: "precio_unitaria",
                NoFilter: true,
            },
            {
                Header: "P. facturación",
                accessor: "precio_facturacion",
                NoFilter: true,
            },
            {
                Header: "P. PVO",
                accessor: "precio_pvo",
                NoFilter: true,
            },
            {
                Header: "Bonificacion",
                accessor: "bonificacion",
                NoFilter: true,
            },
            {
                Header: "Fecha Actualizacion",
                accessor: "createdate",
                NoFilter: true,
            },
        ],
        []
    );

    useEffect(() => {
        if (parentData) {
            dispatch(
                getMultiCollection([
                    getProductHistoricalList(parentData.clientproductpriceid),
                ])
            );
        }
    }, [parentData]);

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const products = multiData.data.find((x: Dictionary) => x.key === "UFN_HISTORICAL_PRODUCT_LST-ESTADOGENERICO");

            if (products) {
                setData(products.data)
            }
        }
    }, [multiData]);

    return (
        <DialogZyx
            open={openModal}
            title={parentData?.product_description}
            buttonText1={t(langKeys.cancel)}
            handleClickButton1={() => setOpenModal(false)}
            maxWidth={"sm"}
        >
            <div>
                <TableZyx
                    columns={columns}
                    loading={multiData.loading}
                    data={ddw ?? data}
                    download={false}
                    filterGeneral={false}
                    register={false}
                />
            </div>
        </DialogZyx>
    );
};

export default HistoryProduct;