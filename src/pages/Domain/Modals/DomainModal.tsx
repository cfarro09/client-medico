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
    domainname: string | "";
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

const DomainModal: React.FC<modalPorps> = ({
    data: { row, edit, domainname},
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
                domaindesc: row?.domaindesc || "",
                domainvalue: row?.domainvalue || "",
                bydefault: row?.bydefault || false,
                status: row?.status || "ACTIVO",
                type: row?.type || "",
            });

            register("domainvalue", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
            register("domaindesc", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        }
    }, [openModal]);

    const onSubmit = handleSubmit((data) => {
        if (!edit && dataDomain && dataDomain.some((d) => d.domainvalue === data.domainvalue)) {
            dispatch(showSnackbar({ show: true, success: false, message: t(langKeys.code_duplicate) }));
            return;
        }

        if (!edit && dataToDelete && dataToDelete.some((d) => d.domainvalue === data.domainvalue)) {
            dispatch(showSnackbar({ show: true, success: false, message: "Se ha eliminado ese registro" }));
            return;
        }

        if (edit) {
            updateRecords &&
                updateRecords((p: Dictionary[]) =>
                    p.map((x) =>
                        x.domainvalue === row?.domainvalue || ""
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
                        <h2 className="mb1">{row ? `${row.description}` : "Nuevo Valor"}</h2>
                        <p>{row ? "Edite" : "Ingrese"} la información del valor.</p>
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.domain)}
                            disabled={true}
                            className="col-6"
                            valueDefault={row?.domainname || domainname}
                            onChange={(value) => setValue("domainname", value)}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.code)}
                            disabled={edit ? true : false}
                            className="col-6"
                            valueDefault={getValues("domainvalue")}
                            onChange={(value) => setValue("domainvalue", value)}
                            error={errors?.domainvalue?.message}
                        />
                        <FieldEdit
                            label={t(langKeys.description)}
                            className="col-6"
                            valueDefault={getValues("domaindesc")}
                            onChange={(value) => setValue("domaindesc", value)}
                            error={errors?.domaindesc?.message}
                        />
                    </div>
                </div>
            </div>
        </DialogZyx>
    );
};

export default DomainModal;
