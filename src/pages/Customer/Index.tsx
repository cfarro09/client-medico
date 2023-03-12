/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import { getCustomerSel, getProductList, getValuesFromDomain, insCostumer } from "common/helpers";
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

const Customer: FC = () => {
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
                view: applications["/customer"][0],
                modify: applications["/customer"][1],
                insert: applications["/customer"][2],
                delete: applications["/customer"][3],
                download: applications["/customer"][4],
            });
        }
    }, [applications]);

    const fetchData = () => dispatch(getCollection(getCustomerSel(0)));

    useEffect(() => {
        fetchData();
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
                getValuesFromDomain("TIPODOCUMENTO", "DOMAIN-TIPODOCUMENTO"),
                getValuesFromDomain("TIPOBONIFICACION", "DOMAIN-TIPOBONIFICACION"),
                getValuesFromDomain("TIPOCLIENTE", "DOMAIN-TIPOCLIENTE"),
                getProductList(),
            ])
        );
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_CUSTOMER_SEL") {
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
                accessor: "customerid",
                isComponent: true,
                minWidth: 60,
                width: "1%",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return <TemplateIcons deleteFunction={() => handleDelete(row)} />;
                },
            },
            {
                Header: "CONDICION",
                accessor: "status",
                NoFilter: true,
                prefixTranslation: "status_",
                Cell: (props: any) => {
                    const { status } = props.cell.row.original;
                    return (t(`status_${status}`.toLowerCase()) || "").toUpperCase();
                },
            },
            {
                Header: "CLIENTE",
                accessor: "description",
                NoFilter: true,
            },
            {
                Header: "DNI/RUC",
                accessor: "doc_number",
                NoFilter: true,
            },
            {
                Header: "TIPO CLIENTE",
                accessor: "type",
                NoFilter: true,
            },
            {
                Header: "RUTA",
                accessor: "route",
                NoFilter: true,
            },
            {
                Header: "ZONA",
                accessor: "zone",
                NoFilter: true,
            },
            {
                Header: "DIRECCION",
                accessor: "address",
                NoFilter: true,
            },
            {
                Header: "CELULAR",
                accessor: "contact_phone",
                NoFilter: true,
            },
            {
                Header: "COORDENADAS",
                accessor: "coordenadas",
                NoFilter: true,
                Cell: (props: any) => {
                    const { latitude, longitude } = props.cell.row.original;
                    return <span>{latitude}, {longitude}</span>;
                }
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
            dispatch(execute(insCostumer({ ...row, operation: "DELETE", type: "NINGUNO", id: row.customerid })));
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
                titlemodule={"Clientes"}
                download={!!pagePermissions.download}
                onClickRow={handleEdit}
                loading={mainResult.loading}
                register={!!pagePermissions.insert}
                handleRegister={handleRegister}
            />
        );
    } else {
        return <Detail row={rowSelected} setViewSelected={setViewSelected} fetchData={fetchData} />;
    }
};
export default Customer;
