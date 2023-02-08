/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import { getWarehouseSel, getValuesFromDomain, insWarehouse } from "common/helpers";
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

const Warehouse: FC = () => {
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
                view: applications["/warehouse"][0],
                modify: applications["/warehouse"][1],
                insert: applications["/warehouse"][2],
                delete: applications["/warehouse"][3],
                download: applications["/warehouse"][4],
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
    
    const fetchData = () => dispatch(getCollection(getWarehouseSel(0)));

    // MainDataFill
    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_WAREHOUSE_SEL") {
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
            ])
        );
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    // ViewColumns
    const columns = React.useMemo(
        () => [
            {
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
                Header: 'DESCRIPCION',
                accessor: "description",
                NoFilter: true,
            },
            {
                Header: 'NOMBRE CONTACTO',
                accessor: "contact_name",
                NoFilter: true,
            },
            {
                Header: 'CORREO CONTACTO',
                accessor: "contact_email",
                NoFilter: true,
            },
            {
                Header: 'TELEFONO CONTACTO',
                accessor: "contact_phone",
                NoFilter: true,
            },
            {
                Header: 'DIRECCION',
                accessor: "address",
                NoFilter: true,
            },
            {
                Header: t(langKeys.status),
                accessor: "status",
                NoFilter: true,
                prefixTranslation: "status_",
                Cell: (props: any) => {
                    const { status } = props.cell.row.original;
                    return (t(`status_${status}`.toLowerCase()) || "").toUpperCase();
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
            dispatch(showBackdrop(true));
            dispatch(execute(insWarehouse({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.warehouseid })));
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
                titlemodule={`Locales`}
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
export default Warehouse;
