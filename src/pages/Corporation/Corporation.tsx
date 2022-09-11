import { Dictionary } from "@types";
import { getCorpSel, getValuesFromDomain, insCorp } from "common/helpers";
import { TemplateIcons } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { execute, getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import DetailCorporation from "./DetailCorporation";

interface RowSelected {
    row: Dictionary | null;
    edit: boolean;
}

interface MultiData {
    data: Dictionary[];
    success: boolean;
}
const arrayBread = [
    { id: "view-1", name: "Corporation" },
    { id: "view-2", name: "Corporation detail" },
];

const Corporation: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector((state) => state.main.mainData);
    const mainMultiResult = useSelector((state) => state.main.multiData);
    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<RowSelected>({ row: null, edit: false });
    const [waitSave, setWaitSave] = useState(false);
    const [dataView, setDataView] = useState<Dictionary[]>([]);
    const applications = useSelector((state) => state.login?.validateToken?.user?.menu);
    const [pagePermissions, setPagePermissions] = useState<Dictionary>({});
    const executeResult = useSelector((state) => state.main.execute);

    useEffect(() => {
        if (applications) {
            console.log(applications);
            setPagePermissions({
                ["view"]: applications["/corporations"][0],
                ["modify"]: applications["/corporations"][1],
                ["insert"]: applications["/corporations"][2],
                ["delete"]: applications["/corporations"][3],
                ["download"]: applications["/corporations"][4],
            });
        }
    }, [applications]);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_delete) }))
                fetchData();
                dispatch(showBackdrop(false));
                setWaitSave(false);
            } else if (executeResult.error) {
                const errormessage = t(executeResult.code || "error_unexpected_error", { module: t(langKeys.corporation_plural).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeResult, waitSave])

    useEffect(() => {
        fetchData();
        dispatch(getMultiCollection([getValuesFromDomain("ESTADOGENERICO"), getValuesFromDomain("TIPOCORP")]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_CORPORATION_SEL") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

    const fetchData = () => dispatch(getCollection(getCorpSel(0)));

    const columns = React.useMemo(
        () => [
            {
                accessor: "corpid",
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: "1%",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return (
                        <TemplateIcons
                            viewFunction={() => handleView(row)}
                            deleteFunction={() => handleDelete(row)}
                            editFunction={() => handleEdit(row)}
                        />
                    );
                },
            },
            {
                Header: t(langKeys.description),
                accessor: "description",
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
            {
                Header: t(langKeys.createdBy),
                accessor: "createdby",
                NoFilter: true,
            },
            {
                Header: t(langKeys.creationDate),
                accessor: "createdate",
                NoFilter: true,
                Cell: (props: any) => {
                    const date = props.cell.row.original.createdate;
                    return date.split(".")[0].split(" ")[0];
                },
            },
        ],
        []
    );

    const handleRegister = () => {
        setViewSelected("view-2");
        setRowSelected({ row: null, edit: true });
    };

    const handleView = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected({ row, edit: false });
    };

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected({ row, edit: true });
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
                titlemodule={t(langKeys.corporation_plural, { count: 2 })}
                download={!!pagePermissions.download}
                loading={mainResult.loading}
                register={!!pagePermissions.insert}
                handleRegister={handleRegister}
            />
        );
    } else {
        return (
            <DetailCorporation
                data={rowSelected}
                setViewSelected={setViewSelected}
                multiData={mainMultiResult.data}
                fetchData={fetchData}
            />
        );
    }
};
export default Corporation;
