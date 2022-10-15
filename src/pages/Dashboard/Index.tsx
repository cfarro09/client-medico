/* eslint-disable react-hooks/exhaustive-deps */
import { makeStyles } from "@material-ui/core";
// import { Dictionary } from "@types";
import { getCorpSel, getValuesFromDomain } from "common/helpers";
// import { TemplateIcons } from "components";
import { useSelector } from "hooks";
import { langKeys } from "lang/keys";
import React, { FC, useEffect, useState } from "react"; // we need this to make JSX compile
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { getCollection, getMultiCollection, resetAllMain } from "store/main/actions";
import { showBackdrop, showSnackbar } from "store/popus/actions";
// import Detail from "./Detail";

const useStyles = makeStyles((theme) => ({
    container: {
        width: "100%",
        transition: "all .3s ease",
    },
    root: {
        minWidth: 275,
    },
    bullet: {
        display: "inline-block",
        margin: "0 2px",
        transform: "scale(0.8)",
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    cards: {
        // background: 'red',
        // transition: 'all .3s ease',
        // flex: '1 1 auto'
    },
    test2: {
        display: "flex",
    },
    test: {
        width: "200px",
        margin: "10px",
        border: "3px solid #333",
        backgroundColor: "white",
        transition: "all .3s ease",
    },
}));

const Dashboard: FC = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const mainResult = useSelector((state) => state.main.mainData);
    // const [viewSelected, setViewSelected] = useState("view-1");
    // const [rowSelected, setRowSelected] = useState<Dictionary | null>(null);
    const [waitSave, setWaitSave] = useState(false);
    // const [dataView, setDataView] = useState<Dictionary[]>([]);
    const applications = useSelector((state) => state.login?.validateToken?.user?.menu);
    // const [pagePermissions, setPagePermissions] = useState<Dictionary>({});
    const executeResult = useSelector((state) => state.main.execute);

    useEffect(() => {
        if (applications) {
            // setPagePermissions({
            //     view: applications["/corporations"][0],
            //     modify: applications["/corporations"][1],
            //     insert: applications["/corporations"][2],
            //     delete: applications["/corporations"][3],
            //     download: applications["/corporations"][4],
            // });
        }
    }, [applications]);

    const fetchData = () => dispatch(getCollection(getCorpSel(0)));

    useEffect(() => {
        fetchData();
        dispatch(
            getMultiCollection([
                getValuesFromDomain("ESTADOGENERICO", "DOMAIN-ESTADOGENERICO"),
                getValuesFromDomain("TIPOCORP", "DOMAIN-TIPOCORP"),
            ])
        );
        return () => {
            dispatch(resetAllMain());
        };
    }, []);

    useEffect(() => {
        if (!mainResult.loading && !mainResult.error && mainResult.key === "UFN_CORPORATION_SEL") {
            // setDataView(mainResult.data);
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

    // const columns = React.useMemo(
    //     () => [
    //         {
    //             accessor: "corpid",
    //             isComponent: true,
    //             minWidth: 60,
    //             width: "1%",
    //             Cell: (props: any) => {
    //                 const row = props.cell.row.original;
    //                 return <TemplateIcons deleteFunction={() => handleDelete(row)} />;
    //             },
    //         },
    //         {
    //             Header: t(langKeys.description),
    //             accessor: "description",
    //         },
    //         {
    //             Header: t(langKeys.status),
    //             accessor: "status",
    //             prefixTranslation: "status_",
    //             Cell: (props: any) => {
    //                 const { status } = props.cell.row.original;
    //                 return (t(`status_${status}`.toLowerCase()) || "").toUpperCase();
    //             },
    //         },
    //         {
    //             Header: t(langKeys.createdBy),
    //             accessor: "createdby",
    //         },
    //         {
    //             Header: t(langKeys.creationDate),
    //             accessor: "createdate",
    //             Cell: (props: any) => {
    //                 const date = props.cell.row.original.createdate;
    //                 return date.split(".")[0].split(" ")[0];
    //             },
    //         },
    //     ],
    //     []
    // );

    // const handleRegister = () => {
    //     setViewSelected("view-2");
    //     setRowSelected(null);
    // };

    // const handleEdit = (row: Dictionary) => {
    //     setViewSelected("view-2");
    //     setRowSelected(row);
    // };

    // const handleDelete = (row: Dictionary) => {
    //     const callback = () => {
    //         dispatch(execute(insCorp({ ...row, operation: "DELETE", status: "ELIMINADO", id: row.corpid })));
    //         dispatch(showBackdrop(true));
    //         setWaitSave(true);
    //     };

    //     dispatch(
    //         manageConfirmation({
    //             visible: true,
    //             question: t(langKeys.confirmation_delete),
    //             callback,
    //         })
    //     );
    // };

    return (
        <div style={{ width: "100%" }}>
            <div style={{transition: "all .3s ease"}}>
                <div className={classes.test} style={{width: '20%', minHeight: '100px'}}>hola</div>
                <div className={classes.test} style={{width: '80%', minHeight: '200px'}}>hola</div>
            </div>
            {/* <div className={classes.test2}> */}
            {/* </div> */}
        </div>
    );
};
export default Dashboard;
