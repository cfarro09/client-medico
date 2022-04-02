const paths = {
    DASHBOARD: '/dashboard',
    REPORTS: '/reports',
    SUPERVISOR: '/supervisor',
    CORPORATIONS: '/corporations',
    ORGANIZATIONS: '/organizations',

    REPORT_PROVIDER: '/report-provider',
    REPORT_SKU: '/report-sku',


    SIGNIN: '/sign-in',
    SIGNUP: {
        path: "/sign-up/:token",
        resolve: (token: string) => `/sign-up/${token}`,
    },
    PRIVACY: "/privacy",
    CONFIGURATION: '/configuration',
    EXTRAS: '/extras',
    PROPERTIES: '/extras/properties',
    USERS: '/user',
    ROLES_PERMISSIONS: '/roles-permissions',
    DISTRIBUTORS: '/distributors',
    MERCHANDISE: '/merchandise',
    PRODUCTS: '/products',
    VISITS: '/visits',
    DOMAINS: '/extras/domains',

    UPLOAD_DATA: '/massive_load',
    ROUTING: '/routing',
    MANIFEST: '/manifest',
    FLEET: '/fleet',
    CLIENTS: '/clients',
    VISITS_PLANNING: '/visits-planning',
    MARKET: '/markets',
    KPIS: '/kpis',
    EVIDENCES: '/evidences',
    REPORT_DISTRIBUTION: '/report-distribution',
    TRACKING: '/tracking',
    TEMPLATES: '/templates',
    ATTENDANCE_REPORT: '/attendance-report',
    SALES_REPORT: '/sales-report',
    STOCK_REPORT: '/stock-report',
    COVERAGE_REPORT: '/coverage-report',
    PHOTO_REPORT: '/photo-report'


};

export default paths;
