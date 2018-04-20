export function createResNavDataMessage(navList: W.NavData[]): W.ResNavDataMessage {
    return {
        type: "RES_NAV_DATA",
        navList
    };
}

export function createResPageDataMessage(pageData: W.PageData): W.ResPageDataMessage {
    return {
        type: "RES_PAGE_DATA",
        pageData
    };
}

export function createResPEErrorMessage(error: string): W.ResPEErrorMessage {
    return {
        type: "RES_PE_ERROR",
        error
    };
}
