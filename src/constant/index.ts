/**
 * 全局消息弹窗属性
 * @type {{duration_2: number, duration_1: number, duration_0: number, success: string, warning: string, error: string, duration_5: number, timeout: string, duration_4: number, info: string, duration_3: number}}
 */
const GLOBAL_MESSAGE = {
    timeout: 'global_message_timeout',
    error: 'global_message_error',
    success: 'global_message_success',
    info: 'global_message_info',
    warning: 'global_message_warning',
    duration_0: 0,
    duration_1: 1,
    duration_2: 2,
    duration_3: 3,
    duration_4: 4,
    duration_5: 5,
};

const REQUEST_CODE = {
    ok: 200,
    created: 201,
    deleted: 204,
    dataError: 400,
    noAuthority: 401,
    noFound: 404,
    serverError: 500,
    gatewayError: 502,
    serverOverload: 503,
    serverTimeout: 504,
    connectError: 'CONNECT_ERROR',
    invalidToken: 'INVALID_TOKEN',
    reConnect: 'RECONNECT',
};

/**
 * sessionStorage key
 * @type {{apiHost: string, host: string, token: string}}
 */
const SESSION_STORAGE_KEY = {
    token: 'token',
    host: 'host',
    apiHost: 'apiHost',
};

/**
 * 监听wave事件key
 * @type {{recvP2PIncomingCall: string, answerP2PCall: string, rejectP2PCall: string, hangupP2PCall: string}}
 */
const EVENT_KEY = {
    recvP2PIncomingCall: 'onRecvP2PIncomingCall', // 收到来电
    answerP2PCall: 'onAnswerP2PCall', // 接听来电
    hangupP2PCall: 'onHangupP2PCall', // 挂断来电
    rejectP2PCall: 'onRejectP2PCall', // 拒接来电
    initP2PCall: 'onInitP2PCall', // wave发去呼叫
    p2PCallCanceled: 'onP2PCallCanceled', // 未接来电、去电
    initPluginWindowOk: 'onInitPluginWindowOk', //初始化窗口成功
};

const WAVE_CALL_TYPE = {
    in: 1,
    out: 2,
    miss: 0,
};

const DATE_FORMAT = {
    format_1: 'YYYY/MM/DD',
    format_2: 'YYYY/MM/DD HH/mm/ss',
    format_3: 'YYYY-MM-DD HH-mm-ss',
    format_4: 'YYYY-MM-DD HH:mm:ss Z',
};

const MODULES = {
    contact: 'Contacts',
    account: 'Accounts',
    lead: 'Leads',
};

const MODULE_IDS = {
    contact: 3,
    lead: 1,
}

type CONFIG_SHOW = {
    None: null | undefined
    Name: string[],
    Phone: string,
    Company: string,
    Title: string,
    Description: string,
}

const CONFIG_SHOW: CONFIG_SHOW = {
    None: undefined,
    Name: ['NAME', 'LAST_NAME'],
    Phone: "Phone",
    Company: 'Company',
    Title: 'POST',
    Description: 'COMMENTS',
}

const NotificationConfig = {
    first: 'information 1',
    second: 'information 2',
    third: 'information 3',
    forth: 'information 4',
    fifth: 'information 5'
}

export {
    CONFIG_SHOW,
    NotificationConfig,
    GLOBAL_MESSAGE,
    REQUEST_CODE,
    SESSION_STORAGE_KEY,
    EVENT_KEY,
    WAVE_CALL_TYPE,
    DATE_FORMAT,
    MODULES,
    MODULE_IDS
};
