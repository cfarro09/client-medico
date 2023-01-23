/* eslint-disable react-hooks/exhaustive-deps */
import { Accordion, AccordionDetails, AccordionSummary, Button, makeStyles, Typography } from "@material-ui/core";
import { DetailModule, Dictionary } from "@types";
import { FieldEdit, FieldSelect, TemplateBreadcrumbs, TemplateIcons, TitleDetail } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import { manageConfirmation, showBackdrop, showSnackbar } from "store/popus/actions";
import { execute, getCollectionAux, resetMainAux } from "store/main/actions";
import { getDomainValueSel, insDomain, insDomainvalue } from "common/helpers";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import TableZyx from "components/fields/table-simple";
import NewAccountModal from "./Modals/NewAccountModal";
import NewTransferModal from "./Modals/NewTransferModal";

export interface CustomDetailModule {
    row: Dictionary | null;
    setViewSelected: (view: string) => void;
    fetchData: () => void;
    newAccountModal: boolean;
    setNewAccountModal: (view: boolean) => void;
    newTransferModal: boolean;
    setNewTransferModal: (view: boolean) => void;
}

const DetailAccount: React.FC<CustomDetailModule> = ({
    row,
    setViewSelected,
    fetchData,
    newAccountModal,
    setNewAccountModal,
    newTransferModal,
    setNewTransferModal,
}) => {
    // const classes = useStyles();
    const [waitSave, setWaitSave] = useState(false);
    const executeResult = useSelector((state) => state.main.execute);
    const multiData = useSelector((state) => state.main.multiData);
    const [dataExtra, setDataExtra] = useState<{ status: Dictionary[]; type: Dictionary[] }>({ status: [], type: [] });
    const dispatch = useDispatch();
    const { t } = useTranslation();

    return (
        <>
            <NewAccountModal openModal={newAccountModal} setOpenModal={setNewAccountModal} fetchData={fetchData} />
            <NewTransferModal openModal={newTransferModal} setOpenModal={setNewTransferModal} fetchData={fetchData} />
        </>
    );
};

export default DetailAccount;
