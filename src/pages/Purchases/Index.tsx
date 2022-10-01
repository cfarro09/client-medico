/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import { getCorpSel, getProductList, getPurchases, getSupplierList, getValuesFromDomain, getWareHouse, insCorp } from "common/helpers";
import { TemplateIcons } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { execute, getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import Detail from "./Detail";

const Corporation: FC = () => {
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
                "view": applications["/purchases"][0],
                "modify": applications["/purchases"][1],
                "insert": applications["/purchases"][2],
                "delete": applications["/purchases"][3],
                "download": applications["/purchases"][4],
            });
        }
    }, [applications]);

    const fetchData = () => dispatch(getCollection(getPurchases()));

    useEffect(() => {
        fetchData();
        dispatch(getMultiCollection([
            getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
            getValuesFromDomain("TIPOCORP", "DOMAIN-TIPOCORP"),
            getProductList(),
            getSupplierList(),
            getWareHouse(),
        ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UNF_PURCHASE_ORDER_SEL") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

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

    const columns = React.useMemo(
        () => [
            {
                accessor: "purchaseorderid",
                isComponent: true,
                minWidth: 60,
                width: "1%",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <TemplateIcons
                            deleteFunction={() => handleDelete(row)}
                        />
                    );
                },
            },
            {
                Header: "N° Orden",
                accessor: "purchase_order_number",
            },
            {
                Header: "Estado",
                accessor: "status",
            },
            {
                Header: "Proveedor",
                accessor: "supplier_name",
            },
            {
                Header: "Almacen",
                accessor: "warehouse_name",
            },
            {
                Header: "Productos",
                accessor: "num_records",
                type: "number",
            },
            {
                Header: "Total",
                type: "number",
                accessor: "total",
                Cell: (props: any) => {
                    const { total } = props.cell.row.original;
                    return parseFloat(total).toFixed(2)
                },
            },
        ],
        []
    );

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
            dispatch(execute(insCorp({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.corpid })));
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
                titlemodule={"Ordenes de compra"}
                download={!!pagePermissions.download}
                onClickRow={handleEdit}
                loading={mainResult.loading}
                register={!!pagePermissions.insert}
                handleRegister={handleRegister}
            />
        );
    } else {
        return (
            <Detail
                row={rowSelected}
                setViewSelected={setViewSelected}
                fetchData={fetchData}
            />
        );
    }
};
export default Corporation;
