import { Button, makeStyles } from "@material-ui/core";
import { Dictionary } from "@types";
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute } from "store/main/actions";
import { insCorp } from "common/helpers";

interface RowSelected {
    row: Dictionary | null;
    edit: boolean;
}

interface MultiData {
    data: Dictionary[];
    success: boolean;
}

const arrayBread = [
    { id: "view-1", name: "Corporation" },
    { id: "view-2", name: "Corporation detail" },
];

interface DetailCorporationProps {
    data: RowSelected;
    setViewSelected: (view: string) => void;
    multiData: MultiData[];
    fetchData: () => void;
}

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

const DetailCorporation: React.FC<DetailCorporationProps> = ({
    data: { row, edit },
    setViewSelected,
    multiData,
    fetchData,
}) => {
    const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const dataStatus = multiData[0] && multiData[0].success ? multiData[0].data : [];
    const dataType = multiData[1] && multiData[1].success ? multiData[1].data : [];

    useEffect(() => {
        if (waitSave) {
            if (!executeResult.loading && !executeResult.error) {
                dispatch(showSnackbar({ show: true, success: true, message: t(row ? langKeys.successful_edit : langKeys.successful_register) }))
                fetchData && fetchData();
                dispatch(showBackdrop(false));
                setViewSelected("view-1")
            } else if (executeResult.error) {
                const errormessage = t(executeResult.code || "error_unexpected_error", { module: t(langKeys.corporation_plural).toLocaleLowerCase() })
                dispatch(showSnackbar({ show: true, success: false, message: errormessage }))
                dispatch(showBackdrop(false));
                setWaitSave(false);
            }
        }
    }, [executeResult, waitSave])

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: row ? row.corpid : 0,
            description: row ? row.description || "" : "",
            type: row ? row.type : "NINGUNO",
            status: row?.status || "ACTIVO",
            logo: row ? row.logo : "",
            logotype: row ? row.logotype : "",
            operation: row ? "UPDATE" : "INSERT",
        },
    });

    const onSubmit = handleSubmit((data) => {
        console.log("submit", data);
        const callback = () => {
            dispatch(showBackdrop(true));
            dispatch(execute(insCorp(data)));
            setWaitSave(true)
        }

        dispatch(manageConfirmation({
            visible: true,
            question: t(langKeys.confirmation_save),
            callback
        }))

        // const callback = async () => {
        //     dispatch(showBackdrop(true));
        //     if (typeof data.logo === 'object') {
        //         const fd = new FormData();
        //         fd.append('file', data.logo, data.logo.name);
        //         data.logo = (await CommonService.uploadFile(fd)).data["url"];
        //     }
        //     if (typeof data.logotype === 'object') {
        //         const fd = new FormData();
        //         fd.append('file', data.logotype, data.logotype.name);
        //         data.logotype = (await CommonService.uploadFile(fd)).data["url"];
        //     }
        //     setWaitSave(true)
        //     dispatch(execute(insCorp(data)));
        // }

        // dispatch(manageConfirmation({
        //     visible: true,
        //     question: t(langKeys.confirmation_save),
        //     callback
        // }))
    });

    React.useEffect(() => {
        register("description", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("type", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
        register("status", { validate: (value) => (value && value.length) || t(langKeys.field_required) });
    }, [edit, register]);

    return (
        <div style={{ width: "100%" }}>
            <form onSubmit={onSubmit}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                        <TemplateBreadcrumbs breadcrumbs={arrayBread} handleClick={setViewSelected} />
                        <TitleDetail title={row ? `${row.description}` : t(langKeys.newcorporation)} />
                    </div>
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
                        {edit && (
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
                        )}
                    </div>
                </div>
                <div className={classes.containerDetail}>
                    <div className="row-zyx">
                        <FieldEdit
                            label={t(langKeys.corporation)}
                            className="col-6"
                            valueDefault={getValues("description")}
                            onChange={(value) => setValue("description", value)}
                            error={errors?.description?.message}
                        />
                        <FieldSelect
                            label={t(langKeys.type)}
                            className="col-6"
                            valueDefault={getValues("type")}
                            onChange={(value) => setValue("type", value?.domainvalue)}
                            error={errors?.type?.message}
                            data={dataType}
                            uset={true}
                            prefixTranslation="type_corp_"
                            optionDesc="domainvalue"
                            optionValue="domainvalue"
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                            label={t(langKeys.status)}
                            className="col-6"
                            valueDefault={getValues("status")}
                            onChange={(value) => setValue("status", value?.domainvalue)}
                            error={errors?.status?.message}
                            data={dataStatus}
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

export default DetailCorporation;
