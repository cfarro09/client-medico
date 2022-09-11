/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import { getShopSel, getValuesFromDomain, insShop } from "common/helpers";
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

const Shops: FC = () => {
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
                view: applications["/shop"][0],
                modify: applications["/shop"][1],
                insert: applications["/shop"][2],
                delete: applications["/shop"][3],
                download: applications["/shop"][4],
            });
        }
    }, [applications]);

    const fetchData = () => dispatch(getCollection(getShopSel(0)));

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
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_SHOP_LST") {
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
                accessor: "shopid",
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
                Header: t(langKeys.description),
                accessor: "description",
            },
            {
                Header: t(langKeys.status),
                accessor: "status",
            },
            {
                Header: t(langKeys.type),
                accessor: "type",
            },
            {
                Header: t(langKeys.createdBy),
                accessor: "createdby",
            },
            {
                Header: t(langKeys.creationDate),
                accessor: "createdate",
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
        setRowSelected(null);
    };

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected(row);
    };

    const handleDelete = (row: Dictionary) => {
        const callback = () => {
            dispatch(execute(insShop({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.shopid })));
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
                titlemodule={'Tiendas'}
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
        return <Detail row={rowSelected} setViewSelected={setViewSelected} fetchData={fetchData} />;
    }
};
export default Shops;
