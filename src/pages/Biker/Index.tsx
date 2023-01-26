/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import { getBikerSel, getValuesFromDomain, insBiker } from "common/helpers";
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

const Biker: FC = () => {
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
                view: applications["/bikers"][0],
                modify: applications["/bikers"][1],
                insert: applications["/bikers"][2],
                delete: applications["/bikers"][3],
                download: applications["/bikers"][4],
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
    
    const fetchData = () => dispatch(getCollection(getBikerSel(0)));

    // MainDataFill
    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_BIKERS_SEL") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

    // 
    useEffect(() => {
        fetchData();
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
                getValuesFromDomain("TIPODOCUMENTO", "DOMAIN-TIPODOCUMENTO"),
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
                accessor: "userid",
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
                Header: 'Usuario',
                accessor: "usr",
                NoFilter: true,
            },
            {
                Header: 'Tipo de Documento',
                accessor: "doc_type",
                NoFilter: true,
            },
            {
                Header: 'Numero de Documento',
                accessor: "doc_number",
                NoFilter: true,
            },
            {
                Header: 'Nombre Completo',
                accessor: "full_name",
                NoFilter: true,
            },
            {
                Header: 'Correo',
                accessor: "email",
                NoFilter: true,
            },
            {
                Header: 'Direccion',
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
            dispatch(execute(insBiker({ ...row, operation: "DELETE", id: row.userid, pwd: null })));
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
                titlemodule={`Motorizados`}
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
export default Biker;
