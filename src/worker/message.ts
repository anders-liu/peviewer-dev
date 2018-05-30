export function createResNavDataMessage(navList: W.NavData[]): W.ResNavDataMessage {
    return {
        type: W.WorkerMessageType.RES_NAV_DATA,
        navList
    };
}

export function createResPageDataMessage(pageData: W.PageData): W.ResPageDataMessage {
    return {
        type: W.WorkerMessageType.RES_PAGE_DATA,
        pageData
    };
}

export function createResPEErrorMessage(error: string): W.ResPEErrorMessage {
    return {
        type: W.WorkerMessageType.RES_PE_ERROR,
        error
    };
}
