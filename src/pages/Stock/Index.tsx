/* eslint-disable react-hooks/exhaustive-deps */
import { Button, makeStyles, Typography } from "@material-ui/core";
import { Dictionary } from "@types";
import { getStockSel, getValuesFromDomain, getWareHouse } from "common/helpers";
import { FieldSelect } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { SearchIcon } from "icons";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { showBackdrop, showSnackbar } from "store/popus/actions";
import Detail from "./Detail";

const useStyles = makeStyles((theme) => ({
    container: {
        width: "100%",
    },
    containerHeader: {
        marginBottom: 0,
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "space-between",
        [theme.breakpoints.up("sm")]: {
            display: "flex",
        },
        "& > div": {
            display: "flex",
            gap: 8,
        },
    },
    filterComponent: {
        minWidth: "220px",
        maxWidth: "320px",
    },
    contentHeader: {
        maringBottom: "200px",
    },
}));
const Stock: FC = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector((state) => state.main.mainData);
    const mainMultiResult = useSelector((state) => state.main.multiData);
    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<Dictionary | null>(null);
    const [waitSave, setWaitSave] = useState(false);
    const [dataView, setDataView] = useState<Dictionary[]>([]);
    const [warehouseSelected, setWarehouseSelected] = useState(0);
    const [multiData1, setMultiData1] = useState<Dictionary[]>([]);
    const applications = useSelector((state) => state.login?.validateToken?.user?.menu);
    const [pagePermissions, setPagePermissions] = useState<Dictionary>({});
    const executeResult = useSelector((state) => state.main.execute);

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                view: applications["/stock"][0],
                modify: applications["/stock"][1],
                insert: applications["/stock"][2],
                delete: applications["/stock"][3],
                download: applications["/stock"][4],
            });
        }
    }, [applications]);

    const search = () => {
        dispatch(
            getCollection(
                getStockSel({
                    warehouseid: warehouseSelected,
                })
            )
        );
    };

    const fetchData = () => search();

    useEffect(() => {
        fetchData();
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
                getValuesFromDomain("TIPOCORP", "DOMAIN-TIPOCORP"),
                getWareHouse(0,'',true),
            ])
        );
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_STOCK_SEL") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

    useEffect(() => {
        if (!mainMultiResult.loading && !mainMultiResult.error) {
            const found = mainMultiResult.data.find((x) => x.key === "UFN_WAREHOUSE_LST");

            if (found) setMultiData1(found.data);
        }
    }, [mainMultiResult]);

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
                Header: "ALMACEN",
                accessor: "warehouse_description",
                NoFilter: true,
            },
            {
                Header: "PRODUCTO",
                accessor: "product_description",
                NoFilter: true,
            },
            {
                Header: "BALANCE",
                accessor: "balance",
                type: "number",
                NoFilter: true,
            },
            {
                Header: "ULTIMA MODIFICACION",
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

    const handleEdit = (row: Dictionary) => {
        setViewSelected("view-2");
        setRowSelected(row);
    };

    if (viewSelected === "view-1") {
        return (
            <div className={classes.container}>
                <div style={{ height: 10}}></div>
                <Typography variant="h5" component="div">
                    Inventario
                </Typography>
                <br />
                <TableZyx
                    columns={columns}
                    data={dataView}
                    download={!!pagePermissions.download}
                    onClickRow={handleEdit}
                    loading={mainResult.loading}
                    register={false}
                    filterGeneral={false}
                    ButtonsElement={() => (
                        <>
                            <div className={classes.containerHeader} style={{ marginBottom: '20px' }}>
                                <div>
                                    <FieldSelect
                                        label={"Almacen"}
                                        className={classes.filterComponent}
                                        valueDefault={warehouseSelected}
                                        onChange={(value) => setWarehouseSelected(value ? value.warehouseid : 0)}
                                        uset={true}
                                        variant="outlined"
                                        data={multiData1}
                                        optionDesc="description"
                                        optionValue="warehouseid"
                                    />
                                </div>
                                <div>
                                    <Button
                                        disabled={mainResult.loading}
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SearchIcon style={{ color: "white" }} />}
                                        style={{ width: 120, backgroundColor: "#55BD84" }}
                                        onClick={() => search()}
                                    >
                                        {t(langKeys.search)}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                />
            </div>
        );
    } else {
        return <Detail row={rowSelected} setViewSelected={setViewSelected} fetchData={fetchData} />;
    }
};
export default Stock;
