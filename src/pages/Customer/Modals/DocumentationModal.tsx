import { DialogZyx, FieldEdit, FieldSelect, FieldUploadImage, FieldUploadImage2 } from "components";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Dictionary } from "@types";
import TableZyx from "components/fields/table-simple";

const documentType = [
    { option: 'PERMISOS DE OSINERGMIN' },
    { option: 'PLATAFORMA VIRTUALES' },
    { option: 'SUNAT' },
]

const documents = [
    { type: 'PERMISOS DE OSINERGMIN', option: "POLIZA DE SEGUROS" },
    { type: 'PERMISOS DE OSINERGMIN', option: "REGISTRO DE HIDROCARBUROS" },
    { type: 'PERMISOS DE OSINERGMIN', option: "CERTIFICADO DEL EXTINTOR" },
    { type: 'PLATAFORMA VIRTUALES', option: "OSINERGMIN PVO" },
    { type: 'PLATAFORMA VIRTUALES', option: "OSINERGMIN SNE" },
    { type: 'PLATAFORMA VIRTUALES', option: "OSINERGMIN CORREO" },
    { type: 'SUNAT', option: "FICHA RUC" },
]

export interface modalPorps {
    documentationData: Dictionary[] | null
}

const DocumentationModal: React.FC<modalPorps> = ({
    documentationData
}) => {
    const { t } = useTranslation();
    const [openModal, setOpenModal] = useState(false)
    const [selected, setSelected] = useState<Dictionary | null>(null)
    const [dataDocuments, setdataDocuments] = useState<Dictionary[]>([])

    const columns = React.useMemo(
        () => [
            {
                Header: "Fecha de registro",
                accessor: "createdate",
                isComponent: true,
                Cell: (props: any) => {
                    const row = props.cell.row.original;
                    return new Date(row.createdate).toLocaleDateString()
                },
            },
            {
                Header: "Tipo",
                accessor: "type",
                NoFilter: true,
            },
            {
                Header: "Documento",
                accessor: "document",
                NoFilter: true,
            },
        ],
        []
    );

    const handlerRow = (row: Dictionary | null) => {
        setSelected(row);
        setOpenModal(true)
    }

    const [data, setdata] = useState(documentationData || []);

    useEffect(() => {
        if (selected) {
            reset({
                documentationid: selected.documentationid,
                type: selected.type,
                document: selected.document,
                createdate: selected.createdate,
                startdate: selected.startdate,
                enddate: selected.enddate,
                user: selected.user,
                password: selected.password,
                image: selected.image,
            });
        }
    }, [selected]);

    const {
        register,
        reset,
        handleSubmit,
        setValue,
        getValues,
        trigger,
    } = useForm({
        defaultValues: {
            documentationid: 0,
            createdate: "",
            type: "",
            document: "",
            startdate: "",
            enddate: "",
            user: "",
            password: "",
            image: "",
        },
    });

    useEffect(() => {
        register("documentationid")
        register("type")
        register("createdate")
        register("document")
        register("startdate")
        register("enddate")
        register("user")
        register("password")
        register("image")
    }, [getValues, register, t]);


    const onSubmitAccount = handleSubmit((newrow) => {
        if (selected) {
            setdata(data.map(x => x.documentationid === newrow.documentationid ? {
                ...newrow,
                changedate: new Date().toISOString()
            } : x))
        } else {
            setdata([...data, {
                ...newrow,
                documentationid: data.length > 0 ? Math.max(...data.map(x => x.documentationid)) + 1 : 1,
                createdate: new Date().toISOString(),
                changedate: new Date().toISOString()
            }])
        }
        setOpenModal(false);
    });

    return (
        <>
            <div style={{marginTop: 16}}>
                <TableZyx
                    columns={columns}
                    data={data}
                    handleRegister={() => handlerRow(null)}
                    download={false}
                    onClickRow={handlerRow}
                    filterGeneral={false}
                    register={true}
                />
            </div>
            <DialogZyx
                open={openModal}
                title={selected ? `Editar` : "Nuevo Registro"}
                buttonText1={t(langKeys.cancel)}
                buttonText2={t(langKeys.save)}
                handleClickButton1={() => setOpenModal(false)}
                handleClickButton2={onSubmitAccount}
                maxWidth={"sm"}
            >
                <div>
                    <div className="row-zyx">
                        <FieldUploadImage
                            className="col-12"
                            label={"Imagen"}
                            valueDefault={getValues("image")}
                            onChange={(value) => setValue("image", value)}
                        />
                    </div>
                    <div className="row-zyx">
                        <FieldSelect
                        label={"Tipo"}
                            className={"col-6"}
                            valueDefault={getValues("type")}
                            onChange={(value) => {
                                setValue("type", value?.option);
                                setValue("document", "");
                                trigger("document")
                                trigger("type")
                                setdataDocuments(documents.filter(x => x.type === value?.option))
                            }}
                            data={documentType}
                            optionDesc="option"
                            optionValue="option"
                        />
                        <FieldSelect
                            label={"Documento"}
                            className={"col-6"}
                            valueDefault={getValues("document")}
                            onChange={(value) => {
                                setValue("document", value?.option);
                            }}
                            data={dataDocuments}
                            optionDesc="option"
                            optionValue="option"
                        />
                    </div>
                    {getValues("type") === "PERMISOS DE OSINERGMIN" && (
                        <div className="row-zyx">
                            <FieldEdit
                                label={"Fecha inicio"}
                                className="col-6"
                                valueDefault={getValues("startdate")}
                                type="date"
                                onChange={(value) => setValue("startdate", value)}
                            />
                            <FieldEdit
                                label={"Fecha fin"}
                                className="col-6"
                                valueDefault={getValues("enddate")}
                                type="date"
                                onChange={(value) => setValue("enddate", value)}
                            />
                        </div>
                    )}
                    {['PLATAFORMA VIRTUALES', 'SUNAT'].includes(getValues("type")) && (
                        <div className="row-zyx">
                            <FieldEdit
                                label={"Usuario"}
                                className="col-6"
                                valueDefault={getValues("user")}
                                onChange={(value) => setValue("user", value)}
                            />
                            <FieldEdit
                                label={"Contraseña"}
                                className="col-6"
                                valueDefault={getValues("password")}
                                onChange={(value) => setValue("password", value)}
                            />
                        </div>
                    )}
                </div>
            </DialogZyx>
        </>
    );
};

export default DocumentationModal;