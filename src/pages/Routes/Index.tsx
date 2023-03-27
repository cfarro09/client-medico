/* eslint-disable react-hooks/exhaustive-deps */
import { Button, makeStyles } from "@material-ui/core";
import { Dictionary } from "@types";
import {
    getAssistantSel,
    getDateCleaned,
    getDrivers,
    getRoutes,
    getValuesFromDomain,
    getVehicles,
} from "common/helpers";
import { DateRangePicker, FieldSelect } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { CalendarIcon, SearchIcon } from "icons";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { Range } from "react-date-range";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { showBackdrop, showSnackbar } from "store/popus/actions";
import Detail from "./Detail";

const useStyles = makeStyles((theme) => ({
    container: {
        width: "100%",
    },
    containerDetail: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        background: "#fff",
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: "14px",
        textTransform: "initial",
    },
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
    itemDate: {
        minHeight: 40,
        height: 40,
        border: "1px solid #bfbfc0",
        borderRadius: 4,
        color: "rgb(143, 146, 161)",
    },
    title: {
        fontSize: "22px",
        fontWeight: "bold",
        color: theme.palette.text.primary,
        padding: "10px 0 ",
    },
    filterComponent: {
        minWidth: "220px",
        maxWidth: "320px",
    },
}));

const initialRange = {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    key: "selection",
};
const selectionKey = "routeid";

const Routes: FC = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector((state) => state.main.mainData);
    const [viewSelected, setViewSelected] = useState("view-1");
    const [rowSelected, setRowSelected] = useState<Dictionary | null>(null);
    const [waitSave, setWaitSave] = useState(false);
    const [dataView, setDataView] = useState<Dictionary[]>([]);
    const applications = useSelector((state) => state.login?.validateToken?.user?.menu);
    const [pagePermissions, setPagePermissions] = useState<Dictionary>({});
    const executeResult = useSelector((state) => state.main.exportReportPDF);
    const [openDateRangeModal, setOpenDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialRange);
    const [selectedRows, setSelectedRows] = useState<any>({});
    const [filters, setFilters] = useState({
        userid: 0,
        warehouseid: 0,
    });
    const [dataExtra, setDataExtra] = useState<{
        driver: Dictionary[];
        vehicles: Dictionary[];
    }>({
        driver: [],
        vehicles: [],
    });
    const multiData = useSelector((state) => state.main.multiData);

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                view: applications["/route"][0],
                modify: applications["/route"][1],
                insert: applications["/route"][2],
                delete: applications["/route"][3],
                download: applications["/route"][4],
            });
        }
    }, [applications]);

    const fetchData = () =>
        dispatch(
            getCollection(
                getRoutes({
                    startdate: dateRange.startDate,
                    finishdate: dateRange.endDate,
                    userid: filters.userid,
                    warehouseid: filters.warehouseid,
                })
            )
        );

    useEffect(() => {
        fetchData();
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ZONAS", "DOMAIN-ZONAS"),
                getDrivers(),
                getVehicles(),
                getAssistantSel(0),
            ])
        );
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!openDateRangeModal) fetchData();
    }, [openDateRangeModal]);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_ROUTES_SEL") {
            setDataView(mainResult.data);
        }
    }, [mainResult]);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                setWaitSave(false);
                window.open(executeResult.url, "_blank");
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
        if (!multiData.error && !multiData.loading) {
            const driverdata = multiData.data.find((x) => x.key === "UFN_DRIVER_USERS_SEL")?.data || [];
            const vehicledata = multiData.data.find((x) => x.key === "UFN_AVAILABLE_VEHICLE_LST")?.data || [];
            setDataExtra({
                driver: driverdata,
                vehicles: vehicledata,
            });
        }
    }, [multiData]);

    const columns = React.useMemo(
        () => [
            {
                Header: "Cliente",
                accessor: "full_name",
                width: "auto",
                NoFilter: true,
            },
            {
                Header: "Tipo Doc.",
                accessor: "doc_type",
                width: "auto",
                NoFilter: true,
            },
            {
                Header: "Num. Doc.",
                accessor: "doc_number",
                width: "auto",
                NoFilter: true,
            },
            {
                Header: "Unidad",
                accessor: "plate_number",
                width: "auto",
                NoFilter: true,
            },
            {
                Header: "Asistentes",
                accessor: "assistants",
                width: "auto",
                NoFilter: true,
            },
            {
                Header: "Estado",
                accessor: "status",
                width: "auto",
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

    if (viewSelected === "view-1") {
        return (
            <div className={classes.container}>
                <div className={classes.title}>{"Rutas"}</div>
                <TableZyx
                    columns={columns}
                    data={dataView}
                    download={false}
                    onClickRow={handleEdit}
                    loading={mainResult.loading}
                    register={!!pagePermissions.insert}
                    useSelection={true}
                    selectionKey={selectionKey}
                    setSelectedRows={setSelectedRows}
                    filterGeneral={false}
                    handleRegister={handleRegister}
                    ButtonsElement={() => (
                        <div className={classes.containerHeader}>
                            <DateRangePicker
                                open={openDateRangeModal}
                                setOpen={setOpenDateRangeModal}
                                range={dateRange}
                                onSelect={setDateRange}
                            >
                                <Button
                                    className={classes.itemDate}
                                    startIcon={<CalendarIcon />}
                                    onClick={() => setOpenDateRangeModal(!openDateRangeModal)}
                                >
                                    {getDateCleaned(dateRange.startDate!) + " - " + getDateCleaned(dateRange.endDate!)}
                                </Button>
                            </DateRangePicker>
                            <FieldSelect
                                label={"Unidades"}
                                className={classes.filterComponent}
                                valueDefault={filters.warehouseid}
                                onChange={(value) => setFilters({ ...filters, warehouseid: value?.warehouseid || 0 })}
                                uset={true}
                                variant="outlined"
                                data={dataExtra.vehicles}
                                optionDesc="plate_number"
                                optionValue="warehouseid"
                            />
                            <FieldSelect
                                label={t(langKeys.driver)}
                                className={classes.filterComponent}
                                valueDefault={filters.userid}
                                onChange={(value) => setFilters({ ...filters, userid: value?.userid || 0 })}
                                uset={true}
                                variant="outlined"
                                loading={multiData.loading}
                                data={dataExtra.driver}
                                optionDesc="full_name"
                                optionValue="userid"
                            />
                            <Button
                                disabled={mainResult.loading}
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon style={{ color: "white" }} />}
                                style={{ width: 120, backgroundColor: "#55BD84" }}
                                onClick={() => fetchData()}
                            >
                                {t(langKeys.search)}
                            </Button>
                        </div>
                    )}
                />
            </div>
        );
    } else {
        return <Detail row={rowSelected} setViewSelected={setViewSelected} fetchData={fetchData} />;
    }
};

export default Routes;
