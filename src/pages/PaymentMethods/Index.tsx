/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import { getAccountLs, getPaymentMethodsSel, getValuesFromDomain, insPaymentMethod } from "common/helpers";
import { TemplateIcons } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { execute, getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import DetailPaymentMethods from "./Detail";

const PaymentMethods: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector((state) => state.main.mainData);
    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<Dictionary | null>(null);
    const [waitSave, setWaitSave] = useState(false);
    const [dataView, setDataView] = useState<Dictionary[]>([]);
    const applications = useSelector((state) => state.login?.validateToken?.user?.menu);
    const [pagePermissions, setPagePermissions] = useState<Dictionary>({});
    const executeResult = useSelector((state) => state.main.execute);

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                view: applications["/payment_methods"][0],
                modify: applications["/payment_methods"][1],
                insert: applications["/payment_methods"][2],
                delete: applications["/payment_methods"][3],
                download: applications["/payment_methods"][4],
            });
        }
    }, [applications]);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_delete) }));
                fetchData();
                dispatch(showBackdrop(false));
                setWaitSave(false);
            } else if (executeResult.error) {
                const errormessage = t(executeResult.code || "error_unexpected_error", {
                    module: t(langKeys.corporation_plural).toLocaleLowerCase(),
                });
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }));
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeResult, waitSave]);

    const fetchData = () => dispatch(getCollection(getPaymentMethodsSel(0)));

    // MainDataFill
    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_PAYMENT_METHODS_SEL") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

    // MultiData
    useEffect(() => {
        fetchData();
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
                getValuesFromDomain("TIPOCORP", "DOMAIN-TIPOCORP"),
                getAccountLs(),
            ])
        );
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    const columns = React.useMemo(
        () => [
            {
                accessor: "paymentmethodid",
                isComponent: true,
                minWidth: 60,
                width: "1%",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return row.type !== "system" ? <TemplateIcons deleteFunction={() => handleDelete(row)} /> : null;
                },
            },
            {
                Header: 'CONDICION',
                accessor: "status",
                NoFilter: true,
                prefixTranslation: "status_",
                Cell: (props: any) => {
                    const { status } = props.cell.row.original;
                    return (t(`status_${status}`.toLowerCase()) || "").toUpperCase();
                },
            },
            {
                Header: 'FORMA DE PAGO',
                accessor: "description",
                NoFilter: true,
            },
            {
                Header: "CUENTA",
                accessor: "debit_account_name",
                NoFilter: true,
            },
            {
                Header: "NRO CUENTA",
                accessor: "account_number",
                NoFilter: true,
            },
            {
                Header: "ES CUPON?",
                accessor: "is_coupon",
                NoFilter: true,
                Cell: (props: any) => {
                    const {is_coupon} = props.cell.row.original;
                    return is_coupon ? 'Si' : 'No';
                }
            },
            {
                Header: "VALOR DEL CUPON",
                accessor: "coupon_value",
                NoFilter: true,
                Cell: (props: any) => {
                    const { coupon_value } = props.cell.row.original;
                    return `S/ ${(coupon_value > 0) ? parseFloat(coupon_value).toFixed(2) : '-'}` 
                },
            },
        ],
        []
    );

    // HandlesFunctions
    const handleRegister = () => {
        setViewSelected("view-2");
        setRowSelected(null);
    };

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected(row);
    };

    const handleDelete = (row: Dictionary) => {
        const callback = () => {
            dispatch(
                execute(insPaymentMethod({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.paymentmethodid }))
            );
            dispatch(showBackdrop(true));
            setWaitSave(true);
        };

        dispatch(
            manageConfirmation({
                visible: true,
                question: t(langKeys.confirmation_delete),
                callback,
            })
        );
    };

    if (viewSelected === "view-1") {
        return (
            <TableZyx
                columns={columns}
                data={dataView}
                titlemodule={`Metodos de Pago`}
                download={!!pagePermissions.download}
                onClickRow={handleEdit}
                loading={mainResult.loading}
                register={!!pagePermissions.insert}
                handleRegister={handleRegister}
            />
        );
    } else {
        return <DetailPaymentMethods row={rowSelected} setViewSelected={setViewSelected} fetchData={fetchData} />;
    }
};
export default PaymentMethods;
