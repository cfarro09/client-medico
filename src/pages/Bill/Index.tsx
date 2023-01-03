/* eslint-disable react-hooks/exhaustive-deps */
import { Button, makeStyles } from "@material-ui/core";
import { Dictionary } from "@types";
import { getRoles, getShops, getUserSel, getValuesFromDomain, getWareHouse, insUser } from "common/helpers";
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
import AutorenewIcon from '@material-ui/icons/Autorenew';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles((theme) => ({
    containerHeader: {
        marginBottom: 0,
        display: "flex",
        width: "100%",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        [theme.breakpoints.up("sm")]: {
            display: "flex",
        },
        "& > div": {
            display: "flex",
            gap: 8,
        },
    },
}));

const Bill: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector((state) => state.main.mainData);
    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<Dictionary | null>(null);
    const [waitSave, setWaitSave] = useState(false);
    const [newBillDialog, setNewBillDialog] = useState(false);
    const [transferDialog, setTransferDialog] = useState(false);
    const [dataView, setDataView] = useState<Dictionary[]>([]);
    const applications = useSelector((state) => state.login?.validateToken?.user?.menu);
    const [pagePermissions, setPagePermissions] = useState<Dictionary>({});
    const executeResult = useSelector((state) => state.main.execute);
    const classes = useStyles();
    
    useEffect(() => {
        if (applications) {
            setPagePermissions({
                "view": applications["/user"][0],
                "modify": applications["/user"][1],
                "insert": applications["/user"][2],
                "delete": applications["/user"][3],
                "download": applications["/user"][4],
                //"view": applications["/bill"][0],
                //"modify": applications["/bill"][1],
                //"insert": applications["/bill"][2],
                //"delete": applications["/bill"][3],
                //"download": applications["/bill"][4],
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
            getValuesFromDomain("TIPODOCUMENTO", "DOMAIN-TIPODOCUMENTO"),
            getRoles(),
            getShops(),
            getWareHouse()
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
                accessor: 'billid',
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
                Header: t(langKeys.description),
                accessor: 'description',
                NoFilter: true,
            },
            {
                Header: t(langKeys.amount),
                accessor: 'amount',
                NoFilter: true,
            },
            {
                Header: t(langKeys.status),
                accessor: 'status',
                NoFilter: true,
            },
            {
                Header: t(langKeys.lastUpdate),
                accessor: 'lastupdate',
                NoFilter: true,
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
            dispatch(execute(insUser({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.corpid })));
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
            <>
                <TableZyx
                    columns={columns}
                    titlemodule={`${t(langKeys.bill)}s`}
                    data={dataView}
                    download={false}
                    loading={mainResult.loading}
                    onClickRow={handleEdit}
                    register={false}
                    hoverShadow={true}
                    
                    ButtonsElement={() => (
                        <div className={classes.containerHeader}>
                            <Button
                                disabled={mainResult.loading}
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                style={{ width: 150, backgroundColor: "#303f9f" }}
                                onClick={() => setNewBillDialog(true)}
                            >
                                {t(langKeys.createbill)}
                            </Button>
                            <Button
                                disabled={mainResult.loading}
                                variant="contained"
                                color="primary"
                                startIcon={<AutorenewIcon />}
                                style={{ width: 150, backgroundColor: "#55BD84" }}
                                onClick={() => setTransferDialog(true)}
                            >
                                {t(langKeys.transfer)}
                            </Button>
                        </div>
                    )}
                    handleRegister={handleRegister}
                />
                <Detail
                    row={rowSelected}
                    setViewSelected={setViewSelected}
                    fetchData={fetchData}
                    newBillDialog = {newBillDialog}
                    setNewBillDialog = {setNewBillDialog}
                    transferDialog = {transferDialog}
                    setTransferDialog = {setTransferDialog}
                />
            </>
        )
    }
    else {
        return (<></>)
    }
};
export default Bill;
