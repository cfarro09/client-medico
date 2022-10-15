/* eslint-disable react-hooks/exhaustive-deps */
import { makeStyles } from "@material-ui/core";
import { Dictionary } from "@types";
import { DialogZyx, FieldEdit } from "components";
import { langKeys } from "lang/keys";
import React, { useEffect } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { showSnackbar } from "store/popus/actions";

interface RowSelected {
    row: Dictionary | null;
    edit: boolean;
}

export interface modalPorps {
    data: RowSelected;
    dataDomain: Dictionary[] | null;
    dataToDelete: Dictionary[] | null;
    openModal: boolean;
    setOpenModal: (param: any) => void;
    updateRecords?: (record: any) => void;
}

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(1),
    },
    modal_content: {},
    px2: {
        padding: "0px 21px",
    },
    mt2: {
        marginTop: "1.2rem",
    },
    px5: {
        paddingRight: "4rem",
        paddingLeft: "4rem",
    },
    mb2: {
        marginBottom: "21px",
    },
    mb3: {
        marginBottom: "51px",
    },
    mb1: {
        marginBottom: "11px",
    },
    pb2: {
        paddingBottom: "21px",
    },
    modal_body: {
        padding: ".8rem 1.4rem",
    },
    modal_detail: {
        padding: ".8rem 1.4rem",
        height: "500px",
        overflow: "auto",
    },
    text_center: {
        textAlign: "center",
    },
    pt50: {
        paddingT: "0.5rem",
    },
    button: {
        padding: 12,
        fontWeight: 500,
        fontSize: "14px",
        textTransform: "initial",
        width: "60%",
    },
    table: {
        width: "100%",
        "& thead": {
            background: "#dddddd",
        },
        "& thead th": {
            padding: "7px",
        },
        "& tbody td": {
            fontSize: "13px",
        },
    },
    tableNoBorder: {
        "& tr td": {
            border: 0,
        },
    },
    tabRoot: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        "& header": {
            // background: 'red'
        },
        "& #simple-tabpanel-0 > div, #simple-tabpanel-1 > div": {
            padding: "12px",
        },
    },
}));

const WarehouseModal: React.FC<modalPorps> = ({
    data: { row, edit },
    setOpenModal,
    openModal,
    data,
    dataDomain,
    dataToDelete,
    updateRecords,
}) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
        getValues,
    } = useForm();

    useEffect(() => {
        if (openModal) {
            reset({
                id: row?.warehouseid || 0,
                description: row?.description || "",
                contact_name: row?.contact_name || "",
                contact_email: row?.contact_email || "",
                contact_phone: row?.contact_phone || "",
                address: row?.address || "",
                status: row?.status || "ACTIVO",
                type: row?.type || "NINGUNO",
            });
            register("description", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        }
    }, [openModal]);

    const onSubmit = handleSubmit((data) => {
        if (!edit && dataDomain && dataDomain.some((d) => d.description === data.description)) {
            dispatch(showSnackbar({ show: true, success: false, message: t(langKeys.code_duplicate) }));
            return;
        }

        if (!edit && dataToDelete && dataToDelete.some((d) => d.description === data.description)) {
            dispatch(showSnackbar({ show: true, success: false, message: "Se ha eliminado ese registro" }));
            return;
        }

        if (edit) {
            updateRecords &&
                updateRecords((p: Dictionary[]) =>
                    p.map((x) =>
                        x.warehouseid === row?.warehouseid || ""
                            ? { ...x, ...data, operation: x.operation || "UPDATE" }
                            : x
                    )
                );
        } else {
            updateRecords &&
                updateRecords((p: Dictionary[]) => [
                    ...p,
                    {
                        ...data,
                        status: row?.status || "ACTIVO",
                        operation: "INSERT",
                    },
                ]);
        }
        setOpenModal(false);
    });

    return (
        <DialogZyx
            open={openModal}
            title=""
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.save)}
            handleClickButton1={() => setOpenModal(false)}
            handleClickButton2={onSubmit}
            button2Type="submit"
            maxWidth={"lg"}
        >
            <div className="modal_content">
                <div className={[classes.pb2, classes.px5, classes.modal_body].join(" ")}>
                    <div className={[classes.text_center, classes.mb3].join(" ")}>
                        <h2 className="mb1">{row ? `${row.description}` : "Nuevo Almacen"}</h2>
                        <p>{row ? "Edite" : "Ingrese"} la información del almacen.</p>
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.description)}
                            className="col-4"
                            valueDefault={getValues("description")}
                            onChange={(value) => setValue("description", value)}
                            error={errors?.description?.message}
                        />
                        <FieldEdit
                            label={t(langKeys.lead_contact_name)}
                            className="col-4"
                            valueDefault={getValues("contact_name")}
                            onChange={(value) => setValue("contact_name", value)}
                            error={errors?.contact_name?.message}
                        />
                        <FieldEdit
                            label={"Telefono contacto"}
                            className="col-4"
                            valueDefault={getValues("contact_phone")}
                            onChange={(value) => setValue("contact_phone", value)}
                            error={errors?.contact_phone?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={"Correo contacto"}
                            className="col-4"
                            valueDefault={getValues("contact_email")}
                            onChange={(value) => setValue("contact_email", value)}
                            error={errors?.contact_email?.message}
                        />
                        <FieldEdit
                            label={t(langKeys.address)}
                            className="col-8"
                            valueDefault={getValues("address")}
                            onChange={(value) => setValue("address", value)}
                            error={errors?.address?.message}
                        />
                    </div>
                </div>
            </div>
        </DialogZyx>
    );
};

export default WarehouseModal;
