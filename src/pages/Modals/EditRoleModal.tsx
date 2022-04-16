import React, { useEffect, useState } from 'react'; // we need this to make JSX compile
import { useSelector } from 'hooks';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { langKeys } from 'lang/keys';
import { Dictionary } from '@types';
import { DialogZyx } from 'components';
import { Checkbox, CircularProgress, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@material-ui/core';
import { useFieldArray, useForm } from 'react-hook-form';

interface EditRoleModalProps {
    setOpenEditRoleModal: (param: any) => void;
    openEditRoleModal: boolean;
    roleSelected: Dictionary | null;
}

const useStyles = makeStyles((theme) => ({
    modalBody: {
        padding: '0rem 5rem 2rem 5rem',
    },
    modalHeader: {
        textAlign: 'center',
        marginBottom: '2rem',
        '& h1': {
            marginBottom: '0px'
        },
        '& p': {
            marginTop: '5px',
            color:'#6e6b7b',
            fontSize: '16px'
        }
    },
    table: {
        minWidth: 650,
        '& td': {
            fontSize: '16px',
            padding: '0'
        },
        '& th': {
            padding: '0'
        }
    },
    thead: {
        fontWeight: 600,
        color:'#5e5873',
        fontSize: '16px',
    },
    action: {
        color: 'red',
        justifyContent: 'center',
        paddingBottom: '20px',
        '& button:first-child': {
            color:'white',
            backgroundColor: "#303f9f"
        },
        '& button:last-child': {
            color:'#82868b',
            padding: '6px 14px',
            borderRadius: '0.358rem',
            border: '1px solid #82868b'
        }
    }
}));

const EditRoleModal: React.FC<EditRoleModalProps> = ({ setOpenEditRoleModal, openEditRoleModal, roleSelected }) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const multiResultAux = useSelector(state => state.main.multiDataAux);
    const [dataRoleApplication, setDataRoleApplication] = useState<Dictionary[]>([]);
    
    const initFormFields = { myFieldValues: dataRoleApplication };
    const { register, control, handleSubmit, reset, setValue, formState } = useForm({
        defaultValues: initFormFields
    })
    
    const { fields } = useFieldArray({
        control,
        name: "myFieldValues"
    })

    useEffect(() => {
        if (!multiResultAux.loading && !multiResultAux.error) {
            const found = multiResultAux.data.find(x => x.key === 'UFN_ROLEAPPLICATION_SEL');
            if (found) {
                setDataRoleApplication(found.data)
                reset({ myFieldValues: found.data });
            }
        }
    }, [multiResultAux, reset]);

    const onSubmit = handleSubmit((data) => {
        console.log('data', data)



    })

    const handleChange = (event:any) => {
        console.log(event.target.name)
        console.log(JSON.stringify(formState.dirtyFields, null, 2))
        setValue(event.target.name, event.target.checked)
    }
 
    return (
        <DialogZyx
            open={openEditRoleModal}
            title=""
            buttonText1={t(langKeys.save)}
            buttonText2={t(langKeys.cancel)}
            handleClickButton1={onSubmit}
            handleClickButton2={() => setOpenEditRoleModal(false)}
            button1Type="submit"
            maxWidth={'md'}
            actionclass={classes.action}
        >
            <div>
                {multiResultAux.loading ? (
                    <div style={{ textAlign: 'center' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <div className={classes.modalBody}>
                        <div className={classes.modalHeader}>
                            <h1>{t(langKeys.editrole)}</h1>
                            <Typography >
                                {t(langKeys.setrolepermissions)}
                            </Typography>
                        </div>
                        <div className="row-zyx">
                            <div className="col-12" style={{ marginBottom: '30px'}}>
                                <Typography gutterBottom variant="h5" component="div">
                                    {(t(roleSelected?.roldesc))}
                                </Typography>
                            </div>
                            <div className="col-12">
                                <Typography gutterBottom variant="h6" component="div">
                                    {t(langKeys.role_permission)}
                                </Typography>
                                <TableContainer>
                                    <Table className={classes.table} aria-label="simple table">
                                        <TableBody>
                                            {fields.map((row, index) => (
                                                <TableRow key={row.roleapplicationid}>
                                                    <TableCell component="th" scope="row">
                                                        <Typography className={classes.thead}>
                                                            {row.application_name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    {...register(`myFieldValues.${index}.view`)}
                                                                    defaultChecked={row.view}
                                                                    onChange={handleChange}
                                                                    color="primary"
                                                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                                />
                                                            }
                                                            label="View"
                                                        />
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    {...register(`myFieldValues.${index}.modify`)}
                                                                    defaultChecked={row.modify}
                                                                    onChange={handleChange}
                                                                    color="primary"
                                                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                                />
                                                            }
                                                            label="Modify"
                                                        />
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    {...register(`myFieldValues.${index}.insert`)}
                                                                    defaultChecked={row.insert}
                                                                    onChange={handleChange}
                                                                    color="primary"
                                                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                                />
                                                            }
                                                            label="Insert"
                                                        />
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    {...register(`myFieldValues.${index}.delete`)}
                                                                    defaultChecked={row.delete}
                                                                    onChange={handleChange}
                                                                    color="primary"
                                                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                                />
                                                            }
                                                            label="Delete"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DialogZyx>
    )
}

export default EditRoleModal;