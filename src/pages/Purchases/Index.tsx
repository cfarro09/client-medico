/* eslint-disable react-hooks/exhaustive-deps */
import { Dictionary } from "@types";
import {
    getDateCleaned,
    getDriversLst,
    getPaymentMethodList,
    getProductList2,
    getPurchases,
    getSupplierList,
    getValuesFromDomain,
    getVehicles,
    getWareHouse,
    insPurchase,
} from "common/helpers";
import { DateRangePicker, TemplateIcons } from "components";
import TableZyx from "components/fields/table-simple";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { execute, getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import Detail from "./Detail";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";
import { Avatar, Button, IconButton, makeStyles, Modal, Paper, Typography } from "@material-ui/core";
import { Range } from "react-date-range";
import { CalendarIcon } from "icons";
import { AvatarGroup } from "@material-ui/lab";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
};

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
    customModal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
    },
    sliderContainer: {
        margin: '0 auto', // Agregar esta propiedad
        display: "flex",
        justifyContent: "center",
    },
}));

const initialRange = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    key: "selection",
};

const Purchase: FC = () => {
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
    const [merchantEntry, setMerchantEntry] = useState(false);
    const [openDateRangeModal, setOpenDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialRange);
    const [open, setOpen] = useState(false);
    const [openSlider, setOpenSlider] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imagesGroup, setImagesGroup] = useState<Dictionary[] | null>(null);

    useEffect(() => {
        if (applications) {
            setPagePermissions({
                view: applications["/purchases"][0],
                modify: applications["/purchases"][1],
                insert: applications["/purchases"][2],
                delete: applications["/purchases"][3],
                download: applications["/purchases"][4],
            });
        }
    }, [applications]);

    const fetchData = () =>
        dispatch(getCollection(getPurchases({ startdate: dateRange.startDate, finishdate: dateRange.endDate })));

    useEffect(() => {
        // fetchData();
        dispatch(
            getMultiCollection([
                getValuesFromDomain("EMPRESAS", "DOMAIN-EMPRESAS"),
                getProductList2(),
                getWareHouse(),
                getPaymentMethodList(),
                getDriversLst(),
                getVehicles(),
                getSupplierList(),
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
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UNF_PURCHASE_ORDER_SEL") {
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

    const handleAvatarClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, scop_image: string) => {
        event.stopPropagation();
        setOpen(true);
        setSelectedImage(scop_image);
    };

    const handleAvatarGroupClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
        payments: Dictionary[]
    ) => {
        console.log("🚀 ~ file: Index.tsx:170 ~ handleAvatarGroupClick ~ payments:", payments);
        event.stopPropagation();
        setSelectedImageIndex(index);
        setImagesGroup(payments);
        setOpenSlider(true);
    };

    const columns = React.useMemo(
        () => [
            {
                Header: "FECHA",
                accessor: "createdate",
                NoFilter: true,
            },
            {
                Header: "CHOFER",
                accessor: "client_name",
                NoFilter: true,
            },
            {
                Header: "CONDICION",
                accessor: "status",
                NoFilter: true,
            },
            {
                Header: "PEDIDO",
                accessor: "warehouse",
                NoFilter: true,
            },
            {
                Header: "NRO SCOTT",
                accessor: "scop_number",
                NoFilter: true,
                Cell: (props: any) => {
                    const { scop_number, scop_image } = props.cell.row.original;
                    return (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div>{scop_number}</div>
                            {scop_image && (
                                <div onClick={(event) => handleAvatarClick(event, scop_image)}>
                                    <Avatar src={scop_image} />
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: "FACTURADO",
                accessor: "company_name",
                NoFilter: true,
            },
            {
                Header: "NRO DE FACTURA",
                accessor: "bill_number",
                NoFilter: true,
                Cell: (props: any) => {
                    const { bill_number, bill_image } = props.cell.row.original;
                    return (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div>{bill_number}</div>
                            {bill_image && (
                                <div onClick={(event) => handleAvatarClick(event, bill_image)}>
                                    <Avatar src={bill_image} />
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: "GUIA",
                accessor: "guide_number",
                NoFilter: true,
                Cell: (props: any) => {
                    const { guide_number, guide_image } = props.cell.row.original;
                    return (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div>{guide_number}</div>
                            {guide_image && (
                                <div onClick={(event) => handleAvatarClick(event, guide_image)}>
                                    <Avatar src={guide_image} />
                                </div>
                            )}
                        </div>
                    );
                },
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
            {
                Header: "BANCARIZACION",
                accessor: "nada",
                NoFilter: true,
                Cell: (props: any) => {
                    const { payments } = props.cell.row.original;
                    return (
                        <>
                            {payments && (
                                <AvatarGroup max={3} onClick={(event) => handleAvatarGroupClick(event, 0, payments)}>
                                    {payments.map((image: any, index: number) => (
                                        <Avatar key={index} src={image?.evidence} />
                                    ))}
                                </AvatarGroup>
                            )}
                        </>
                    );
                },
            },
        ],
        []
    );

    const handleRegister = () => {
        setMerchantEntry(false);
        setViewSelected("view-2");
        setRowSelected(null);
    };

    const handleEdit = (row: Dictionary) => {
        setMerchantEntry(false);
        setViewSelected("view-2");
        setRowSelected(row);
    };

    const handleDelete = (row: Dictionary) => {
        const callback = () => {
            dispatch(
                execute(insPurchase({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.purchaseorderid }))
            );
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
            <div className={classes.container}>
                <TableZyx
                    columns={columns}
                    data={dataView}
                    titlemodule={"Facturacion"}
                    download={!!pagePermissions.download}
                    onClickRow={handleEdit}
                    loading={mainResult.loading}
                    register={!!pagePermissions.insert}
                    handleRegister={handleRegister}
                    filterGeneral={false}
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
                        </div>
                    )}
                />
                <Modal open={open} onClose={() => setOpen(false)} className={classes.customModal}>
                    <img src={selectedImage} alt="Imagen" style={{ maxWidth: 800 }} />
                </Modal>
                <Modal open={openSlider} onClose={() => setOpenSlider(false)} className={classes.customModal}>
                    <div style={{ maxWidth: 800 }}>
                        <Paper className={classes.modalContainer}>
                            <Slider {...settings} initialSlide={selectedImageIndex} className={classes.sliderContainer}>
                                {imagesGroup?.map((image, index) => (
                                    <div key={index}>
                                        <img src={image.evidence} alt={`Imagen ${index}`} style={{ maxHeight: 600 }} />
                                    </div>
                                ))}
                            </Slider>
                        </Paper>
                    </div>
                </Modal>
            </div>
        );
    } else {
        return (
            <Detail
                row={rowSelected}
                setViewSelected={setViewSelected}
                fetchData={fetchData}
                merchantEntry={merchantEntry}
            />
        );
    }
};

export default Purchase;
