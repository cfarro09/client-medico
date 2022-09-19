/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import { getProductSel, getValuesFromDomain, insProduct } from "common/helpers";
import { TemplateIcons } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { execute, getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import Detail from './Detail'

const Product: FC = () => {
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
                "view": applications["/products"][0],
                "modify": applications["/products"][1],
                "insert": applications["/products"][2],
                "delete": applications["/products"][3],
                "download": applications["/products"][4],
            });
        }
    }, [applications]);

    const fetchData = () => dispatch(getCollection(getProductSel(0)));

    useEffect(() => {
        fetchData();
        dispatch(getMultiCollection([
            getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
            getValuesFromDomain("CATEGORIAPRODUCTO", "DOMAIN-CATEGORIAPRODUCTO"),
            getValuesFromDomain("TIPOEMPAQUE", "DOMAIN-TIPOEMPAQUE"),
            getValuesFromDomain("UNIDADMEDIDAPRODUCTO", "DOMAIN-UNIDADMEDIDAPRODUCTO")
        ]));
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_PRODUCT_SEL") {
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
                accessor: "productid",
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
                Header: 'Nombre',
                accessor: 'product_name',
            },
            {
                Header: 'Codigo',
                accessor: 'product_code',
            },
            {
                Header: 'Descripcion',
                accessor: 'product_description',
            },
            {
                Header: 'Unidad de Medida',
                accessor: 'unit',
            },
            {
                Header: 'Precio unit',
                accessor: 'price_1',
            },
            {
                Header: 'Precio mayor',
                accessor: 'price_2',
            },
            {
                Header: 'Precio Compra',
                accessor: 'purchase_price',
            },
            {
                Header: 'Marca',
                accessor: 'product_brand',
            },
            {
                Header: 'Categoria',
                accessor: 'category',
            },
            {
                Header: 'Tipo Empaque',
                accessor: 'types_packaging',
            },
            {
                Header: 'Color',
                accessor: 'color',
            },
            {
                Header: 'n_bottles',
                accessor: 'n_bottles',
            },
            {
                Header: t(langKeys.status),
                accessor: "status",
                prefixTranslation: "status_",
                Cell: (props: any) => {
                    const { status } = props.cell.row.original;
                    return (t(`status_${status}`.toLowerCase()) || "").toUpperCase();
                },
            }
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
            dispatch(execute(insProduct({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.productid })));
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
                titlemodule={t(langKeys.products, { count: 2 })}
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
export default Product;
