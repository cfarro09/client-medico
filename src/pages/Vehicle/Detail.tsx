/* eslint-disable react-hooks/exhaustive-deps */
import { Button, makeStyles } from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute } from "store/main/actions";
import { insVehicle } from "common/helpers";

const arrayBread = [
    { id: "view-1", name: "Vehicle" },
    { id: "view-2", name: "Vehicle detail" },
];

const useStyles = makeStyles((theme) => ({
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
}));

const DetailVehicle: React.FC<DetailModule> = ({ row, setViewSelected, fetchData }) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [dataExtra, setDataExtra] = useState<{
        status: Dictionary[];
        type: Dictionary[];
        vehicle_type: Dictionary[];
        companys: Dictionary[];
    }>({ status: [], type: [], vehicle_type: [], companys: [] });
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (!multiData.error && !multiData.loading) {
            const dataStatus = multiData.data.find((x) => x.key === "DOMAIN-ESTADOGENERICO");
            const dataTypes = multiData.data.find((x) => x.key === "DOMAIN-TIPOCORP");
            const vehicle_type = multiData.data.find((x) => x.key === "DOMAIN-TIPOVEHICULO");
            const companys = multiData.data.find((x) => x.key === "DOMAIN-EMPRESAS");
            if (dataStatus && dataTypes && vehicle_type && companys) {
                setDataExtra({
                    status: dataStatus.data,
                    type: dataTypes.data,
                    vehicle_type: vehicle_type.data,
                    companys: companys.data,
                });
            }
        }
    }, [multiData]);

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(
                    showSnackbar({
                        show: true,
                        success: true,
                        message: t(row ? langKeys.successful_edit : langKeys.successful_register),
                    })
                );
                fetchData && fetchData();
                dispatch(showBackdrop(false));
                setViewSelected("view-1");
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

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: row?.warehouseid || 0,
            description: row?.description || "",
            plate_number: row?.plate_number || "",
            soat: row?.soat || "",
            vehicle_capacity: row?.vehicle_capacity || "",
            vehicle_type: row?.vehicle_type || "",
            vehicle_brand: row?.vehicle_brand || "",
            activity: row?.activity || "",
            company_name: row?.company_name || "",
            status: row?.status || "ACTIVO",
            operation: row ? "UPDATE" : "INSERT",
        },
    });

    const onSubmit = handleSubmit((data) => {
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insVehicle(data)));
            setWaitSave(true);
        };

        dispatch(
            manageConfirmation({
                visible: true,
                question: t(langKeys.confirmation_save),
                callback,
            })
        );
    });

    React.useEffect(() => {
        register("status", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("plate_number", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("soat");
        register("vehicle_capacity");
        register("vehicle_type");
    }, [register]);

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <TitleDetail title={row ? `${row.description}` : "Nuevo Vehiculo"} />
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <Button
                            variant="contained"
                            type="button"
                            color="primary"
                            startIcon={<ClearIcon color="secondary" />}
                            style={{ backgroundColor: "#FB5F5F" }}
                            onClick={() => setViewSelected("view-1")}
                        >
                            {t(langKeys.back)}
                        </Button>
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            type="submit"
                            startIcon={<SaveIcon color="secondary" />}
                            style={{ backgroundColor: "#55BD84" }}
                        >
                            {t(langKeys.save)}
                        </Button>
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <div className="row-zyx">
                        <FieldSelect
                            label={"TIPO VEHICULO"}
                            className="col-4"
                            valueDefault={getValues("vehicle_type")}
                            onChange={(value) => setValue("vehicle_type", value?.domainvalue)}
                            error={errors?.vehicle_type?.message}
                            data={dataExtra.vehicle_type}
                            uset={true}
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                        <FieldEdit
                            label={"MARCA"}
                            className="col-4"
                            valueDefault={getValues("vehicle_brand")}
                            onChange={(value) => setValue("vehicle_brand", value)}
                            error={errors?.vehicle_brand?.message}
                        />
                        <FieldEdit
                            label={"NUM PLACA"}
                            className="col-4"
                            valueDefault={getValues("plate_number")}
                            onChange={(value) => setValue("plate_number", value)}
                            error={errors?.plate_number?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldEdit
                            label={"ACTIVIDAD"}
                            className="col-4"
                            valueDefault={getValues("activity")}
                            onChange={(value) => setValue("activity", value)}
                            error={errors?.activity?.message}
                        />
                        <FieldSelect
                            label={"EMPRESA"}
                            className="col-4"
                            valueDefault={getValues("company_name")}
                            onChange={(value) => setValue("company_name", value?.domainvalue)}
                            error={errors?.company_name?.message}
                            data={dataExtra.companys}
                            uset={true}
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                        <FieldEdit
                            label={"TONELAJE"}
                            className="col-4"
                            valueDefault={getValues("vehicle_capacity")}
                            onChange={(value) => setValue("vehicle_capacity", value)}
                            error={errors?.vehicle_capacity?.message}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            label={"CONDICION"}
                            className="col-4"
                            valueDefault={getValues("status")}
                            onChange={(value) => setValue("status", value?.domainvalue)}
                            error={errors?.status?.message}
                            data={dataExtra.status}
                            uset={true}
                            prefixTranslation="status_"
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DetailVehicle;
