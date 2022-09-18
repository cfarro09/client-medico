/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import { getUserSel, getValuesFromDomain, insCorp } from "common/helpers";
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

const User: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector((state) => state.main.mainData);
    const mainMultiResult = useSelector((state) => state.main.multiData);
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
                "view": applications["/user"][0],
                "modify": applications["/user"][1],
                "insert": applications["/user"][2],
                "delete": applications["/user"][3],
                "download": applications["/user"][4],
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

    useEffect(() => {
        fetchData();
        dispatch(getMultiCollection([
            getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
            getValuesFromDomain("TIPODOCUMENTO", "DOMAIN-TIPODOCUMENTO")
        ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_USER_SEL") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

    const fetchData = () => dispatch(getCollection(getUserSel(0)));

    const columns = React.useMemo(
        () => [
            {
                accessor: 'userid',
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: '1%',
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <TemplateIcons
                            deleteFunction={() => handleDelete(row)}
                        />
                    )
                }
            },
            {
                Header: t(langKeys.user),
                accessor: 'usr',
            },
            {
                Header: t(langKeys.fullname),
                accessor: 'full_name',
            },
            {
                Header: "N° doc",
                accessor: 'doc_number',
            },
            {
                Header: t(langKeys.email),
                accessor: 'email',
            },
            {
                Header: t(langKeys.role),
                accessor: 'roles',
            },
            {
                Header: t(langKeys.status),
                accessor: 'status',
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

        if (mainResult.error) {
            return <h1>ERROR</h1>;
        }

        return (
            <TableZyx
                columns={columns}
                titlemodule={t(langKeys.user, { count: 2 })}
                data={dataView}
                download={!!pagePermissions.download}
                loading={mainResult.loading}
                onClickRow={handleEdit}
                register={!!pagePermissions.insert}
                hoverShadow={true}
                handleRegister={handleRegister}
            />
        )
    }
    else {
        return (
            <Detail
                row={rowSelected}
                setViewSelected={setViewSelected}
                fetchData={fetchData}
            />
        )
    }
};
export default User;