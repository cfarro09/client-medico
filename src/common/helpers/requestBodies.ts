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

export const getProductList = (): IRequestBody => ({
    method: "UFN_PRODUCT_LST",
    key: "UFN_PRODUCT_LST",
    parameters: {}
})

export const getSupplierList = (): IRequestBody => ({
    method: "UFN_SUPPLIER_LST",
    key: "UFN_SUPPLIER_LST",
    parameters: {}
})

export const getPurchases = (): IRequestBody => ({
    method: "UNF_PURCHASE_ORDER_SEL",
    key: "UNF_PURCHASE_ORDER_SEL",
    parameters: {}
})

export const getWarehouseSel = ({ shopid, id }: Dictionary): IRequestBody => ({
    method: "UFN_WAREHOUSE_SEL",
    key: "UFN_WAREHOUSE_SEL",
    parameters: { shopid, id, all: id === 0 }
})

export const getCorpSel = (id: number): IRequestBody => ({
    method: "UFN_CORPORATION_SEL",
    key: "UFN_CORPORATION_SEL",
    parameters: {
        id: id,
        all: id === 0,
    }
});

export const getStockSel = ( parameters: Dictionary): IRequestBody => ({
    method: "UFN_STOCK_SEL",
    key: "UFN_STOCK_SEL",
    parameters: {... parameters }
});

export const getSupplierSel = (id: number): IRequestBody => ({
    method: "UFN_SUPPLIER_SEL",
    key: "UFN_SUPPLIER_SEL",
    parameters: {
        id: id,
        all: id === 0,
    }
});

export const getCustomerSel = (id: number): IRequestBody => ({
    method: "UFN_CUSTOMER_SEL",
    key: "UFN_CUSTOMER_SEL",
    parameters: {
        id: id,
        all: id === 0,
    }
});

export const getProductSel = (id: number): IRequestBody => ({
    method: "UFN_PRODUCT_SEL",
    key: "UFN_PRODUCT_SEL",
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

export const getWareHouse = (shopid: number | null = null, key: string | null = ""): IRequestBody => ({
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

export const insPurchase = ({ purchaseorderid, status, operation, total, supplierid, warehouseid, purchasecreatedate, purchase_order_number, observations, bill_number, bill_entry_date, purchase_order_create_date }: Dictionary): IRequestBody => ({
    method: "UFN_PURCHASE_ORDER_INS",
    key: "UFN_PURCHASE_ORDER_INS",
    parameters: {
        id: purchaseorderid,
        supplierid,
        bill_number,
        total,
        status,
        type: null,
        purchase_order_number,
        bill_entry_date,
        purchase_order_create_date: purchasecreatedate || purchase_order_create_date || null,
        warehouseid,
        observations,
        operation
    }
})

export const processOC = (purchaseorderid: number): IRequestBody => ({
    method: "UFN_PROCESS_PURCHASE_ORDER",
    key: "UFN_PROCESS_PURCHASE_ORDER",
    parameters: {
        purchaseorderid
    }
})

export const getDetailPurchase = (purchaseorderid: number): IRequestBody => ({
    method: "UFN_PURHCASE_ORDER_DETAIL_SEL",
    key: "UFN_PURHCASE_ORDER_DETAIL_SEL",
    parameters: {
        purchaseorderid
    }
})

export const insPurchaseDetail = ({ status, operation, delivered_quantity, purchasedetailid, productid, price, quantity, subtotal: total }: Dictionary): IRequestBody => ({
    method: "UFN_PURCHASE_DETAIL_INS",
    key: "UFN_PURCHASE_DETAIL_INS",
    parameters: {
        id: purchasedetailid || 0,
        productid,
        total,
        requested_quantity: quantity,
        discount: 0,
        status,
        type: "",
        price,
        delivered_quantity,
        operation
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

export const insSupplier = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_SUPPLIER_INS",
    key: "UFN_SUPPLIER_INS",
    parameters: { ...parameters }
});

export const insCostumer = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_CUSTOMER_INS",
    key: "UFN_CUSTOMER_INS",
    parameters: { ...parameters }
});

export const insProduct = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_PRODUCT_INS",
    key: "UFN_PRODUCT_INS",
    parameters: { ...parameters }
});

export const insShop = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_SHOP_INS",
    key: "UFN_SHOP_INS",
    parameters: { ...parameters }
});

export const insWarehouse = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_WAREHOUSE_INS",
    key: "UFN_WAREHOUSE_INS",
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