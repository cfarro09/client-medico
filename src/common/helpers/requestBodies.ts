import { IRequestBody, Dictionary, IRequestBodyPaginated } from "@types";

export const getUserSel = (userid: number): IRequestBody => ({
    method: "UFN_USER_SEL",
    key: "UFN_USER_SEL",
    parameters: {
        id: userid,
        all: true,
    },
});

export const getShopSel = (userid: number): IRequestBody => ({
    method: "UFN_SHOP_LST",
    key: "UFN_SHOP_LST",
    parameters: {},
});

export const getProductList = (): IRequestBody => ({
    method: "UFN_PRODUCT_LST",
    key: "UFN_PRODUCT_LST",
    parameters: {},
});

export const getProductList2 = (): IRequestBody => ({
    method: "UFN_PRODUCT_LST2",
    key: "UFN_PRODUCT_LST2",
    parameters: {},
});

export const getSupplierList = (): IRequestBody => ({
    method: "UFN_SUPPLIER_LST",
    key: "UFN_SUPPLIER_LST",
    parameters: {},
});

export const getPaymentMethodList = (): IRequestBody => ({
    method: "UFN_PAYMENT_METHOD_LST",
    key: "UFN_PAYMENT_METHOD_LST",
    parameters: {},
});

export const getPurchases = (parameters: Dictionary): IRequestBody => ({
    method: "UNF_PURCHASE_ORDER_SEL",
    key: "UNF_PURCHASE_ORDER_SEL",
    parameters: { ...parameters },
});

export const getSales = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_SALE_ORDER_SEL",
    key: "UFN_SALE_ORDER_SEL",
    parameters: { ...parameters },
});

export const getRoutes = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_ROUTES_SEL",
    key: "UFN_ROUTES_SEL",
    parameters: { ...parameters },
});
export const getCompleteRoutes = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_ROUTE_COMPLETE_SEL",
    key: "UFN_ROUTE_COMPLETE_SEL",
    parameters: { ...parameters },
});
export const getDrivers = (): IRequestBody => ({
    method: "UFN_DRIVER_USERS_SEL",
    key: "UFN_DRIVER_USERS_SEL",
    parameters: {},
});
export const getVehicles = (): IRequestBody => ({
    method: "UFN_AVAILABLE_VEHICLE_LST",
    key: "UFN_AVAILABLE_VEHICLE_LST",
    parameters: {},
});
export const insRoute = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_ROUTES_INS",
    key: "UFN_ROUTES_INS",
    parameters: { ...parameters },
});

export const getWarehouseSel = (id: number): IRequestBody => ({
    method: "UFN_WAREHOUSE_SEL",
    key: "UFN_WAREHOUSE_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getCorpSel = (id: number): IRequestBody => ({
    method: "UFN_CORPORATION_SEL",
    key: "UFN_CORPORATION_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getStockFlow = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_STOCK_FLOW",
    key: "UFN_STOCK_FLOW",
    parameters: { ...parameters },
});

export const getPaginatedSaleOrder = ({
    skip,
    take,
    filters,
    sorts,
    startdate,
    enddate,
    ...allParameters
}: Dictionary): IRequestBodyPaginated => ({
    methodCollection: "UFN_SALE_ORDER_SEL",
    methodCount: "UFN_SALE_ORDER_TOTALRECORDS",
    parameters: {
        origin: "saleorder",
        startdate,
        enddate,
        skip,
        take,
        filters,
        sorts,
        warehouseid: allParameters["warehouseid"] ? allParameters["warehouseid"] : 0,
        customerid: allParameters["customerid"] ? allParameters["customerid"] : 0,
        offset: (new Date().getTimezoneOffset() / 60) * -1,
        ...allParameters,
    },
});

export const getAccountReceivable = (): IRequestBody => ({
    method: "UFN_ACCOUNT_RECEIVABLE_SEL",
    key: "UFN_ACCOUNT_RECEIVABLE_SEL",
    parameters: {},
});

export const getCashboxSel = (id: number): IRequestBody => ({
    method: "UFN_CASHBOX_SEL",
    key: "UFN_CASHBOX_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getDriverSel = (id: number): IRequestBody => ({
    method: "UFN_DRIVERS_SEL",
    key: "UFN_DRIVERS_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getStaffSel = (id: number): IRequestBody => ({
    method: "UFN_STAFF_SEL",
    key: "UFN_STAFF_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getBikerSel = (id: number): IRequestBody => ({
    method: "UFN_BIKERS_SEL",
    key: "UFN_BIKERS_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getAssistantSel = (id: number): IRequestBody => ({
    method: "UFN_ASSISTANTS_SEL",
    key: "UFN_ASSISTANTS_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getVehicleSel = (id: number): IRequestBody => ({
    method: "UFN_VEHICLE_SEL",
    key: "UFN_VEHICLE_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getPaymentMethodsSel = (id: number): IRequestBody => ({
    method: "UFN_PAYMENT_METHODS_SEL",
    key: "UFN_PAYMENT_METHODS_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getStockSel = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_STOCK_SEL",
    key: "UFN_STOCK_SEL",
    parameters: { ...parameters },
});

export const getKardexSel = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_KARDEX_SEL",
    key: "UFN_KARDEX_SEL",
    parameters: { ...parameters },
});

export const getAccountInfoSel = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_ACCOUNT_TRANSFER_SEL",
    key: "UFN_ACCOUNT_TRANSFER_SEL",
    parameters: { ...parameters },
});

export const getSupplierSel = (id: number): IRequestBody => ({
    method: "UFN_SUPPLIER_SEL",
    key: "UFN_SUPPLIER_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getCustomerSel = (id: number): IRequestBody => ({
    method: "UFN_CUSTOMER_SEL",
    key: "UFN_CUSTOMER_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});
export const getCustomerList = (): IRequestBody => ({
    method: "UFN_CUSTOMER_LST",
    key: "UFN_CUSTOMER_LST",
    parameters: {},
});

export const getProductSel = (id: number): IRequestBody => ({
    method: "UFN_PRODUCT_SEL",
    key: "UFN_PRODUCT_SEL",
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const getValuesFromDomain = (domainname: string, keytmp?: any, orgid?: number | null): IRequestBody => ({
    method: "UFN_DOMAIN_LST_VALORES",
    key: keytmp || "",
    parameters: {
        domainname,
        orgid: orgid || undefined,
    },
});

export const getAccountLs = (): IRequestBody => ({
    method: "UFN_ACCOUNT_LS",
    key: "UFN_ACCOUNT_LS",
    parameters: {},
});

export const getRoles = (): IRequestBody => ({
    method: "UFN_ROLE_LST",
    key: "UFN_ROLE_LST",
    parameters: {},
});

export const getRolesPublic = (): IRequestBody => ({
    method: "UFN_ROLE_PUBLIC_LST",
    key: "UFN_ROLE_PUBLIC_LST",
    parameters: {},
});

export const getWareHouse = (
    shopid: number | null = 0,
    key: string | null = "",
    all: boolean | null = false
): IRequestBody => ({
    method: "UFN_WAREHOUSE_LST",
    key: `UFN_WAREHOUSE_LST${key}`,
    parameters: { all },
});

export const getDriversLst = (shopid: number | null = null, key: string | null = ""): IRequestBody => ({
    method: "UFN_DRIVERS_LST",
    key: `UFN_DRIVERS_LST`,
    parameters: { shopid },
});

export const getAccountSel = (id: number): IRequestBody => ({
    method: "UFN_ACCOUNT_SEL",
    key: `UFN_ACCOUNT_SEL`,
    parameters: {
        id: id,
        all: id === 0,
    },
});

export const insAccount = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_ACCOUNT_INS",
    key: `UFN_ACCOUNT_INS`,
    parameters: { ...parameters },
});

export const insSettlementDetailUpdate = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_SETTLEMENT_DETAIL_UPDATE",
    key: `UFN_SETTLEMENT_DETAIL_UPDATE`,
    parameters: { ...parameters },
});

export const getProductsWithStock = (): IRequestBody => ({
    method: "UFN_AVAILABLE_STOCK_SEL",
    key: `UFN_AVAILABLE_STOCK_SEL`,
    parameters: { warehouseid: 0 },
});

export const getApplicationByRole = (roleid: number | null = null, key: string | null = null): IRequestBody => ({
    method: "UFN_APPLICATIONROLE_SEL",
    key: `UFN_APPLICATIONROLE_SEL${key}`,
    parameters: { roleid },
});

export const getShops = (shopid: number | null = null): IRequestBody => ({
    method: "UFN_SHOP_LST",
    key: "UFN_SHOP_LST",
    parameters: { shopid },
});

export const getApplications = (): IRequestBody => ({
    method: "UFN_APPLICATION_LST",
    key: "UFN_APPLICATION_LST",
    parameters: {},
});

export const getShopsByUserid = (userid: number): IRequestBody => ({
    method: "UFN_SHOPUSER_SEL",
    key: "UFN_SHOPUSER_SEL",
    parameters: { userid },
});

export const getDomainSel = (domainname: string): IRequestBody => ({
    method: "UFN_DOMAIN_SEL",
    key: "UFN_DOMAIN_SEL",
    parameters: {
        domainname: domainname,
        all: true,
    },
});

export const getDomainValueSel = (domainname: string): IRequestBody => ({
    method: "UFN_DOMAIN_VALUES_SEL",
    key: "UFN_DOMAIN_VALUES_SEL",
    parameters: {
        domainname: domainname,
        all: true,
    },
});

export const insPurchase = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_PURCHASE_ORDER_INS",
    key: "UFN_PURCHASE_ORDER_INS",
    parameters: { ...parameters },
});

export const processOC = (purchaseorderid: number): IRequestBody => ({
    method: "UFN_PROCESS_PURCHASE_ORDER",
    key: "UFN_PROCESS_PURCHASE_ORDER",
    parameters: {
        purchaseorderid,
    },
});

export const getDetailPurchase = (purchaseorderid: number): IRequestBody => ({
    method: "UFN_PURHCASE_ORDER_DETAIL_SEL",
    key: "UFN_PURHCASE_ORDER_DETAIL_SEL",
    parameters: {
        purchaseorderid,
    },
});

export const getDetailPayments = (purchaseorderid: number): IRequestBody => ({
    method: "UFN_PURCHASE_ODER_PAYMENT_SEL",
    key: "UFN_PURCHASE_ODER_PAYMENT_SEL",
    parameters: {
        purchaseorderid,
    },
});

export const getCustomerProductsSel = (customerid: number): IRequestBody => ({
    method: "UFN_CUSTOMER_PRODUCT_SEL",
    key: "UFN_CUSTOMER_PRODUCT_SEL",
    parameters: {
        customerid,
    },
});

export const getRouteStockSel = (warehouseid: number): IRequestBody => ({
    method: "UFN_ROUTE_STOCK_SEL",
    key: "UFN_ROUTE_STOCK_SEL",
    parameters: {
        warehouseid,
    },
});

export const getRouteCashSel = (routeid: number): IRequestBody => ({
    method: "UFN_ROUTE_CASH_SEL",
    key: "UFN_ROUTE_CASH_SEL",
    parameters: {
        routeid,
    },
});

export const getRouteSalesLst = (routeid: number): IRequestBody => ({
    method: "UFN_ROUTE_SALE_LST",
    key: "UFN_ROUTE_SALE_LST",
    parameters: {
        routeid,
    },
});

export const getRouteSalesPaymentsLst = (routeid: number): IRequestBody => ({
    method: "UFN_ROUTE_SALE_PAYMENTS_LST",
    key: "UFN_ROUTE_SALE_PAYMENTS_LST",
    parameters: {
        routeid,
    },
});

export const getRouteSalesPaymentsDetail = (routeid: number): IRequestBody => ({
    method: "UFN_ROUTE_SALE_PAYMENTS_DETAIL",
    key: "UFN_ROUTE_SALE_PAYMENTS_DETAIL",
    parameters: {
        routeid,
    },
});

export const getRouteSettlementsDetail = (routeid: number): IRequestBody => ({
    method: "UFN_ROUTE_SETTLEMENTS_DETAIL",
    key: "UFN_ROUTE_SETTLEMENTS_DETAIL",
    parameters: {
        routeid,
    },
});

export const getUserComissionProduct = (userid: number): IRequestBody => ({
    method: "UFN_USER_COMMISSION_PRODUCT_LS",
    key: "UFN_USER_COMMISSION_PRODUCT_LS",
    parameters: {
        userid,
    },
});

export const getDetailSale = (saleorderid: number): IRequestBody => ({
    method: "UFN_SALE_ORDER_DETAIL_SEL",
    key: "UFN_SALE_ORDER_DETAIL_SEL",
    parameters: {
        saleorderid,
    },
});

export const paymentIns = (amount: number, payment_method: string): IRequestBody => ({
    method: "UFN_PAYMENT_INS",
    key: "UFN_PAYMENT_INS",
    parameters: {
        id: 0,
        payment_method,
        amount,
        operation: "INSERT",
    },
});

export const getPaymentByOrder = (saleorderid: number): IRequestBody => ({
    method: "UFN_PAYMENT_SEL",
    key: "UFN_PAYMENT_SEL",
    parameters: {
        saleorderid,
    },
});

export const insPurchaseDetail = ({
    status,
    operation,
    delivered_quantity,
    purchaseorderdetailid,
    productid,
    price,
    requested_quantity,
    subtotal: total,
    product_type,
}: Dictionary): IRequestBody => ({
    method: "UFN_PURCHASE_DETAIL_INS",
    key: "UFN_PURCHASE_DETAIL_INS",
    parameters: {
        id: purchaseorderdetailid || 0,
        productid,
        total,
        requested_quantity,
        discount: 0,
        status,
        type: "",
        price,
        delivered_quantity,
        operation,
        product_type,
    },
});

export const insPurchasePayments = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_PURCHASE_PAYMENTS_INS",
    key: `UFN_PURCHASE_PAYMENTS_INS`,
    parameters: { ...parameters },
});

export const insOrderSale = ({
    saleorderid,
    customerid,
    warehouseid,
    bill_sale_date,
    status,
    document_type,
    document_number,
    operation,
    total,
}: Dictionary): IRequestBody => ({
    method: "UFN_SALE_ORDER_INS",
    key: "UFN_SALE_ORDER_INS",
    parameters: {
        id: saleorderid || 0,
        customerid,
        warehouseid,
        order_number: "",
        total,
        bill_sale_date,
        status,
        document_type,
        document_number,
        operation,
    },
});

export const insSaleDetail = ({
    saleorderdetailid,
    stockid,
    productid,
    quantity,
    subtotal: total,
    price,
    status,
    operation,
}: Dictionary): IRequestBody => ({
    method: "UFN_SALE_ORDER_DETAIL_INS",
    key: "UFN_SALE_ORDER_DETAIL_INS",
    parameters: {
        id: saleorderdetailid || 0,
        stockid,
        productid,
        quantity,
        status,
        total,
        discount: 0,
        price,
        operation,
    },
});

export const insDomain = ({ domainname, description, type, status, operation }: Dictionary): IRequestBody => ({
    method: "UFN_DOMAIN_INS",
    key: "UFN_DOMAIN_INS",
    parameters: { id: 0, domainname, description, type, status, operation },
});

export const insDomainvalue = ({
    id,
    domainname,
    description,
    domainvalue,
    domaindesc,
    status,
    type,
    bydefault,
    operation,
}: Dictionary): IRequestBody => ({
    method: "UFN_DOMAIN_VALUES_INS",
    key: "UFN_DOMAIN_VALUES_INS",
    parameters: {
        id,
        domainname,
        description,
        domainvalue,
        domaindesc,
        system: false,
        status,
        type,
        bydefault,
        operation,
    },
});

export const insCorp = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_CORPORATION_INS",
    key: "UFN_CORPORATION_INS",
    parameters: { ...parameters },
});

export const insCashbox = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_CASHBOX_INS",
    key: "UFN_CASHBOX_INS",
    parameters: { ...parameters },
});

export const insDriver = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_DRIVER_INS",
    key: "UFN_DRIVER_INS",
    parameters: { ...parameters },
});

export const insStaff = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_STAFF_INS",
    key: "UFN_STAFF_INS",
    parameters: { ...parameters },
});
export const insBiker = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_BIKER_INS",
    key: "UFN_BIKER_INS",
    parameters: { ...parameters },
});

export const insAssistant = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_ASSISTANT_INS",
    key: "UFN_ASSISTANT_INS",
    parameters: { ...parameters },
});

export const insVehicle = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_VEHICLE_INS",
    key: "UFN_VEHICLE_INS",
    parameters: { ...parameters },
});

export const insPaymentMethod = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_PAYMENT_METHOD_INS",
    key: "UFN_PAYMENT_METHOD_INS",
    parameters: { ...parameters },
});

export const insSupplier = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_SUPPLIER_INS",
    key: "UFN_SUPPLIER_INS",
    parameters: { ...parameters },
});

export const insCostumer = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_CUSTOMER_INS",
    key: "UFN_CUSTOMER_INS",
    parameters: { ...parameters },
});

export const insCustomerProduct = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_CUSTOMER_PRODUCT_INS",
    key: "UFN_CUSTOMER_PRODUCT_INS",
    parameters: { ...parameters },
});

export const insProduct = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_PRODUCT_INS",
    key: "UFN_PRODUCT_INS",
    parameters: { ...parameters },
});

export const insShop = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_SHOP_INS",
    key: "UFN_SHOP_INS",
    parameters: { ...parameters },
});

export const insWarehouse = (parameters: Dictionary): IRequestBody => ({
    method: "UFN_WAREHOUSE_INS",
    key: "UFN_WAREHOUSE_INS",
    parameters: { ...parameters },
});

export const insUser = ({
    userid = 0,
    usr,
    password = "",
    doc_type,
    doc_number,
    full_name,
    email,
    address,
    status,
    operation,
}: Dictionary): IRequestBody => ({
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
        type: "NINGUNO",
    },
});

export const shopUserIns = ({
    shopuserid = 0,
    shopid,
    roleid,
    bydefault,
    warehouses,
    redirect,
    operation,
}: Dictionary): IRequestBody => ({
    method: "UFN_SHOPUSERID_INS",
    key: "UFN_SHOPUSERID_INS",
    parameters: {
        id: shopuserid,
        shopid,
        roleid,
        bydefault,
        warehouses,
        redirect,
        operation,
        description: "",
    },
});
