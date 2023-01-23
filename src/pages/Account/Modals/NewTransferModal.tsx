import { IconButton, InputAdornment } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { DialogZyx, FieldEdit } from "components";
import { langKeys } from "lang/keys";
import React, { useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";

export interface modalPorps {
    openModal: boolean;
    setOpenModal: (param: any) => void;
    fetchData: () => void;
}

const NewTransferModal: React.FC<modalPorps> = ({ openModal, setOpenModal, fetchData }) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleCancelModal = () => {
        setOpenModal(false);
        // setValue("password", data?.password);
        // setValue("confirmpassword", data?.password);
        // clearErrors();
    };

    // const onSubmitPassword = handleSubmit((data) => {
    //     // parentSetValue("password", data.password);
    //     // setOpenModal(false);
    // });

    return (
        <DialogZyx
            open={openModal}
            title={'Nueva transferencia'}
            buttonText1={t(langKeys.cancel)}
            buttonText2={t(langKeys.save)}
            handleClickButton1={handleCancelModal}
            handleClickButton2={() => console.log('submit')}
        >
            <div className="row-zyx">
                <div><h1>hola</h1></div>
            </div>
        </DialogZyx>
    );
};
export default NewTransferModal;
