/* eslint-disable react-hooks/exhaustive-deps */
import { Button, makeStyles } from "@material-ui/core";
import { Dictionary } from "@types";
import { getRoles, getShops, getAccountSel, getValuesFromDomain, getWareHouse, insAccount } from "common/helpers";
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
import AutorenewIcon from "@material-ui/icons/Autorenew";
import AddIcon from "@material-ui/icons/Add";

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

const Account: FC = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector((state) => state.main.mainData);
    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<Dictionary | null>(null);
    const [waitSave, setWaitSave] = useState(false);
    const [newAccountModal, setNewAccountModal] = useState(false);
    const [newTransferModal, setNewTransferModal] = useState(false);
    const [dataView, setDataView] = useState<Dictionary[]>([]);
    const applications = useSelector((state) => state.login?.validateToken?.user?.menu);
    const [pagePermissions, setPagePermissions] = useState<Dictionary>({});
    const executeResult = useSelector((state) => state.main.execute);
    const classes = useStyles();

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                view: applications["/account"][0],
                modify: applications["/account"][1],
                insert: applications["/account"][2],
                delete: applications["/account"][3],
                download: applications["/account"][4],
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
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
                getValuesFromDomain("TIPODOCUMENTO", "DOMAIN-TIPODOCUMENTO"),
                getRoles(),
                getShops(),
                getWareHouse(),
            ])
        );
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_ACCOUNT_SEL") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

    const fetchData = () => dispatch(getCollection(getAccountSel(0)));

    const columns = React.useMemo(
        () => [
            {
                accessor: "accountid",
                NoFilter: true,
                isComponent: true,
                minWidth: 60,
                width: "1%",
                Cell: (props: any) => {
                    const row = props.cell.row.original
                    return (row.type !== 'system') ? <TemplateIcons deleteFunction={() => handleDelete(row)} /> : null
                },
            },
            {
                Header: t(langKeys.description),
                accessor: "description",
                NoFilter: true,
            },
            {
                Header: 'Nro de Cuenta',
                accessor: "account_number",
                NoFilter: true,
            },
            {
                Header: t(langKeys.amount),
                accessor: "amount",
                NoFilter: true,
            },
            {
                Header: t(langKeys.status),
                accessor: "status",
                NoFilter: true,
            },
            {
                Header: t(langKeys.lastUpdate),
                accessor: "changedate",
                NoFilter: true,
                Cell: (props: any) => {
                    const { changedate } = props.cell.row.original;
                    return changedate.split(".")[0];
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
            dispatch(execute(insAccount({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.accountid })));
            dispatch(showBackdrop(true));
            setWaitSave(true);
        };

        dispatch(
            manageConfirmation({
                visible: true,
                question: 'Se eliminarán también los métodos de pago asciados a esta cuenta. Esta seguro que quiere continuar?',
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
                    titlemodule={"Cuentas"}
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
                                onClick={() => setNewAccountModal(true)}
                            >
                                {`Crear cuenta`}
                            </Button>
                            <Button
                                disabled={mainResult.loading}
                                variant="contained"
                                color="primary"
                                startIcon={<AutorenewIcon />}
                                style={{ width: 150, backgroundColor: "#55BD84" }}
                                onClick={() => setNewTransferModal(true)}
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
                    newAccountModal={newAccountModal}
                    setNewAccountModal={setNewAccountModal}
                    newTransferModal={newTransferModal}
                    setNewTransferModal={setNewTransferModal}
                />
            </>
        );
    } else {
        return <></>;
    }
};
export default Account;
