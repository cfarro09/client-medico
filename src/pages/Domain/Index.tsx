/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import { getDomainSel, getValuesFromDomain, insDomain } from "common/helpers";
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

interface RowSelected {
    row: Dictionary | null;
    domainname: string | "";
    edit: boolean;
}

const Domains: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector((state) => state.main.mainData);
    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<RowSelected>({ row: null, domainname: "", edit: false });
    const [waitSave, setWaitSave] = useState(false);
    const [dataView, setDataView] = useState<Dictionary[]>([]);
    const applications = useSelector((state) => state.login?.validateToken?.user?.menu);
    const [pagePermissions, setPagePermissions] = useState<Dictionary>({});
    const executeResult = useSelector((state) => state.main.execute);

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                view: applications["/domain"][0],
                modify: applications["/domain"][1],
                insert: applications["/domain"][2],
                delete: applications["/domain"][3],
                download: applications["/domain"][4],
            });
        }
    }, [applications]);

    const fetchData = () => dispatch(getCollection(getDomainSel('')));

    useEffect(() => {
        fetchData();
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
                getValuesFromDomain("TIPOCORP", "DOMAIN-TIPOCORP")
            ])
        );
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_DOMAIN_SEL") {
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
                accessor: "domainid",
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: "1%",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return <TemplateIcons deleteFunction={() => handleDelete(row)} />;
                },
            },
            {
                Header: t(langKeys.domain),
                accessor: 'domainname',
            },
            {
                Header: t(langKeys.description),
                accessor: 'description',
            },
            {
                Header: t(langKeys.status),
                accessor: 'status',
                prefixTranslation: 'status_',
                Cell: (props: any) => {
                    const { status } = props.cell.row.original;
                    return (t(`status_${status}`.toLowerCase()) || "").toUpperCase()
                }
            }
        ],
        []
    );

    const handleRegister = () => {
        setViewSelected("view-2");
        setRowSelected({ row: null, domainname: "", edit: true });
    };

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected({ row, domainname: row.domainname, edit: false });
    };

    const handleDelete = (row: Dictionary) => {
        const callback = () => {
            dispatch(execute(insDomain({ ...row, operation: 'DELETE', status: 'ELIMINADO' })));
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
                titlemodule={'Dominios'}
                data={dataView}
                download={!!pagePermissions.download}
                loading={mainResult.loading}
                onClickRow={handleEdit}
                register={!!pagePermissions.insert}
                hoverShadow={true}
                handleRegister={handleRegister}
            />
        );
    } else {
        return <Detail data={rowSelected} setViewSelected={setViewSelected} fetchData={fetchData} />;
    }
};
export default Domains;
