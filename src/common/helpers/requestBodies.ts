import { DashboardTemplateSave, Dictionary, IChannel, IChatWebAdd, ICrmLead, ICrmLeadActivitySave, ICrmLeadNoteSave, ICrmLeadTagsSave, ILead, IPerson, IRequestBody, IRequestBodyPaginated } from '@types';
import { uuidv4 } from '.';

type ID = string | number;

export const getUserSel = (userid: number): IRequestBody => ({
    method: "UFN_USER_SEL",
    key: "UFN_USER_SEL",
    parameters: {
        id: userid,
        all: true
    }
})

export const getShopSel = (userid: number): IRequestBody => ({
    method: "UFN_SHOP_LST",
    key: "UFN_SHOP_LST",
    parameters: {}
})

export const getWarehouseSel = ({ shopid, id }: Dictionary): IRequestBody => ({
    method: "UFN_WAREHOUSE_SEL",
    key: "UFN_WAREHOUSE_SEL",
    parameters: { shopid, id, all: id === 0}
})

export const getCorpSel = (id: number): IRequestBody => ({
    method: "UFN_CORPORATION_SEL",
    key: "UFN_CORPORATION_SEL",
    parameters: {
        id: id,
        all: id === 0,
    }
});

export const getValuesFromDomain = (domainname: string, keytmp?: any, orgid?: number | null): IRequestBody => ({
    method: "UFN_DOMAIN_LST_VALORES",
    key: (keytmp || ""),
    parameters: {
        domainname,
        orgid: orgid || undefined
    }
});

export const getRoles = (): IRequestBody => ({
    method: "UFN_ROLE_LST",
    key: "UFN_ROLE_LST",
    parameters: {
    }
})

export const getWareHouse = (shopid: number | null = null, key: string | null = null): IRequestBody => ({
    method: "UFN_WAREHOUSE_LST",
    key: `UFN_WAREHOUSE_LST${key}`,
    parameters: { shopid }
})

export const getApplicationByRole = (roleid: number | null = null, key: string | null = null): IRequestBody => ({
    method: "UFN_APPLICATIONROLE_SEL",
    key: `UFN_APPLICATIONROLE_SEL${key}`,
    parameters: { roleid }
})

export const getShops = (shopid: number | null = null): IRequestBody => ({
    method: "UFN_SHOP_LST",
    key: "UFN_SHOP_LST",
    parameters: { shopid }
})

export const getApplications = (): IRequestBody => ({
    method: "UFN_APPLICATION_LST",
    key: "UFN_APPLICATION_LST",
    parameters: {
    }
})

export const getShopsByUserid = (userid: number): IRequestBody => ({
    method: "UFN_SHOPUSER_SEL",
    key: "UFN_SHOPUSER_SEL",
    parameters: { userid }
})

export const getDomainSel = (domainname: string): IRequestBody => ({
    method: "UFN_DOMAIN_SEL",
    key: "UFN_DOMAIN_SEL",
    parameters: {
        domainname: domainname,
        all: true
    }
})

export const getDomainValueSel = (domainname: string): IRequestBody => ({
    method: "UFN_DOMAIN_VALUES_SEL",
    key: "UFN_DOMAIN_VALUES_SEL",
    parameters: {
        domainname: domainname,
        all: true
    }
})

export const insDomain = ({ domainname, description, type, status, operation }: Dictionary): IRequestBody => ({
    method: "UFN_DOMAIN_INS",
    key: "UFN_DOMAIN_INS",
    parameters: { id: 0, domainname, description, type, status, operation }
});

export const insDomainvalue = ({ id, domainname, description, domainvalue, domaindesc, status, type, bydefault, operation }: Dictionary): IRequestBody => ({
    method: "UFN_DOMAIN_VALUES_INS",
    key: "UFN_DOMAIN_VALUES_INS",
    parameters: { id, domainname, description, domainvalue, domaindesc, system: false, status, type, bydefault, operation }
});

export const insCorp = ({ id, description, type, status, logo, logotype, operation }: Dictionary): IRequestBody => ({
    method: "UFN_CORPORATION_INS",
    key: "UFN_CORPORATION_INS",
    parameters: { id, description, type, status, logo, logotype, operation }
});

export const insShop = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_SHOP_INS",
    key: "UFN_SHOP_INS",
    parameters: { ...parameters }
});

export const insUser = ({ userid = 0, usr, password = "", doc_type, doc_number, full_name, email, address, status, operation }: Dictionary): IRequestBody => ({
    method: "UFN_USER_INS",
    key: "UFN_USER_INS",
    parameters: {
        id: userid, 
        usr, 
        password, 
        doc_type, 
        doc_number, 
        full_name, 
        email, 
        address: "", 
        status, 
        operation,
        type: 'NINGUNO',
    }
});

export const shopUserIns = ({ shopuserid = 0, shopid, roleid, bydefault, warehouses, redirect, operation }: Dictionary): IRequestBody => ({
    method: "UFN_SHOPUSERID_INS",
    key: "UFN_SHOPUSERID_INS",
    parameters: {
        id: shopuserid,
        shopid, roleid, bydefault, warehouses, redirect, operation,
        description: ""
    }
});