/*
 ** Change insCorp for your ins function
 */
/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary, IFetchData } from "@types";
import { getCustomerList, getPaginatedSaleOrder, getValuesFromDomain, getWareHouse, insCorp } from "common/helpers";
import { FieldSelect, TemplateIcons } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { execute, getCollection, getCollectionPaginated, getMultiCollection, resetAllMain } from "store/main/actions";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import Detail from "./Detail";
import TablePaginated from "components/fields/table-paginated";
import { makeStyles } from "@material-ui/core";

const initialRange = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay() + 3),
    key: "selection",
};

const useStyles = makeStyles((theme) => ({
    containerHeader: {
        display: "block",
        marginBottom: 0,
        [theme.breakpoints.up("sm")]: {
            display: "flex",
        },
    },
    filterComponent: {
        minWidth: "220px",
        maxWidth: "320px",
    },
}));

const Sales: FC = () => {
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
    const executeResult = useSelector((state) => state.main.execute);
    const [totalrow, settotalrow] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const mainPaginated = useSelector((state) => state.main.mainPaginated);
    const multiData = useSelector((state) => state.main.multiData);
    const [allParameters, setAllParameters] = useState<Dictionary>({});
    const [fetchDataAux, setfetchDataAux] = useState<IFetchData>({
        pageSize: 0,
        pageIndex: 0,
        filters: {},
        sorts: {},
        daterange: initialRange,
    });
    const [dataExtra, setDataExtra] = useState<{
        warehouses: Dictionary[];
        customers: Dictionary[];
    }>({ warehouses: [], customers: [] });

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                view: applications["/sales"][0],
                modify: applications["/sales"][1],
                insert: applications["/sales"][2],
                delete: applications["/sales"][3],
                download: applications["/sales"][4],
            });
        }
    }, [applications]);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(langKeys.successful_delete) }));
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

    // MultiData
    useEffect(() => {
        fetchData(fetchDataAux);
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
                getValuesFromDomain("TIPOCORP", "DOMAIN-TIPOCORP"),
                getWareHouse(0, "", true),
                getCustomerList(),
            ])
        );
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!multiData.loading && !multiData.error) {
            const warehouses = multiData.data.find((x) => x.key === "UFN_WAREHOUSE_LST");
            const customers = multiData.data.find((x) => x.key === "UFN_CUSTOMER_LST");

            if (warehouses && customers) {
                setDataExtra({
                    warehouses: warehouses.data,
                    customers: customers.data,
                });
            }
        }
    }, [multiData]);

    const columns = React.useMemo(
        () => [
            {
                accessor: "saleorderid",
                isComponent: true,
                minWidth: 60,
                width: "1%",
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return <TemplateIcons deleteFunction={() => handleDelete(row)} />;
                },
            },
            {
                Header: "Nº ORDEN",
                accessor: "order_number",
                NoFilter: true,
            },
            {
                Header: "ALMACEN",
                accessor: "description",
                NoFilter: true,
            },
            {
                Header: "CANTIDAD",
                accessor: "quantity",
                NoFilter: true,
            },
            {
                Header: "PRODUCTO",
                accessor: "product_description",
                NoFilter: true,
            },
            {
                Header: "PRECIO UNI.",
                type: "number",
                accessor: "price",
                NoFilter: true,
                Cell: (props: any) => {
                    const { price } = props.cell.row.original;
                    return "S/ " + parseFloat(price).toFixed(2);
                },
            },
            {
                Header: "CLIENTE",
                accessor: "client_name",
                NoFilter: true,
            },
            {
                Header: "TOTAL",
                type: "number",
                accessor: "total",
                NoFilter: true,
                Cell: (props: any) => {
                    const { total } = props.cell.row.original;
                    return "S/ " + parseFloat(total).toFixed(2);
                },
            },
        ],
        []
    );

    const filterElement = React.useMemo(
        () => (
            <>
                <div
                    className={classes.containerHeader}
                    style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}
                >
                    <div style={{ display: "flex", gap: 8 }}>
                        <FieldSelect
                            label={"Almacen"}
                            className={classes.filterComponent}
                            valueDefault={allParameters["warehouseid"] || 0}
                            onChange={(value) =>
                                setAllParameters({ ...allParameters, warehouseid: value ? value.warehouseid : 0 })
                            }
                            uset={true}
                            variant="outlined"
                            data={dataExtra.warehouses}
                            optionDesc="description"
                            optionValue="warehouseid"
                        />
                        <FieldSelect
                            label={"Clientes"}
                            className={classes.filterComponent}
                            valueDefault={allParameters["customerid"] || 0}
                            onChange={(value) =>
                                setAllParameters({ ...allParameters, customerid: value ? value.customerid : 0 })
                            }
                            uset={true}
                            variant="outlined"
                            data={dataExtra.customers}
                            optionDesc="description"
                            optionValue="customerid"
                        />
                    </div>
                </div>
            </>
        ),
        [dataExtra]
    );

    const fetchData = ({ pageSize, pageIndex, filters, sorts, daterange }: IFetchData) => {
        setfetchDataAux({ pageSize, pageIndex, filters, sorts, daterange });
        dispatch(
            getCollectionPaginated(
                getPaginatedSaleOrder({
                    startdate: daterange.startDate!,
                    enddate: daterange.endDate!,
                    take: pageSize,
                    skip: pageIndex * pageSize,
                    sorts: sorts,
                    filters: {
                        ...filters,
                    },
                    ...allParameters,
                })
            )
        );
    };

    const fetchDataAux2 = () => {
        fetchData(fetchDataAux);
    };

    useEffect(() => {
        if (!mainPaginated.loading && !mainPaginated.error) {
            setPageCount(fetchDataAux.pageSize ? Math.ceil(mainPaginated.count / fetchDataAux.pageSize) : 0);
            settotalrow(mainPaginated.count);
        }
    }, [mainPaginated]);

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
            dispatch(execute(insCorp({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.saleorderid })));
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
            <TablePaginated
                titlemodule={`Ventas`}
                columns={columns}
                data={mainPaginated.data}
                totalrow={totalrow}
                loading={mainPaginated.loading}
                pageCount={pageCount}
                filterrange={true}
                // download={true}
                fetchData={fetchData}
                filterGeneral={false}
                register={false}
                initialStartDate={Number(initialRange.startDate)}
                initialEndDate={Number(initialRange.endDate)}
                FiltersElement={filterElement}
            />
        );
    } else {
        return <Detail row={rowSelected} setViewSelected={setViewSelected} fetchData={fetchDataAux2} />;
    }
};
export default Sales;
