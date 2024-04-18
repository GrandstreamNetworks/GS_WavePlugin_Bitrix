import { CALL_DIRECTION_TYPE, DATE_FORMAT, EVENT_KEY, MODULES, WAVE_CALL_TYPE } from "@/constant";
import { formatDescription, formatPhoneNumber, getNotificationBody, getValueByConfig } from "@/utils/utils";
import { get } from "lodash";
import moment from "moment-timezone";
import React, { useCallback, useEffect, useRef } from "react";
import { Dispatch, GlobalModelState, connect, useIntl } from 'umi';

interface IndexProps {
    getContact: (obj: LooseObject) => Promise<LooseObject>;
    putCallInfo: (obj: LooseObject) => Promise<LooseObject>;
    createNewContact: (obj: LooseObject) => Promise<any>
    user: LooseObject
    userConfig: LooseObject
}

const IndexPage: React.FC<IndexProps> = ({ getContact, putCallInfo, createNewContact, user, userConfig }) => {

    const { formatMessage } = useIntl();

    const callNumber = useRef<string | null>(null);

    const waveUserInfo = useRef<LooseObject>({})

    // 当用户网络速度较慢时，获取联系人接口还未请求成功就挂断电话，此时关闭通知窗口先于打开调用， 导致通知窗口没有正确关闭
    // 当前通知弹窗展示的号码的展示状态: 解决还未展示通知就关闭通知的问题
    const callState = useRef(new Map<string, boolean>())

    // 新增联系人时，数据库同步不及时，临时记录新增联系人的信息
    const newContactInfo = useRef<LooseObject>({})

    /**
     * 上报通话
     */
    const uploadCallInfo = useCallback((callNum: string, callStartTimeStamp: number, callEndTimeStamp: number, callDirection: number) => {
        if (!userConfig.uploadCall) {
            return;
        }
        getContact({ callNum, webhook: userConfig.webhook }).then(contactInfo => {
            !contactInfo?.ID && (contactInfo = newContactInfo.current)
            if (!contactInfo?.ID) {
                return;
            }

            const duration = callEndTimeStamp - callStartTimeStamp;

            callEndTimeStamp = callEndTimeStamp || new Date().getTime();

            callStartTimeStamp = callStartTimeStamp || new Date().getTime();

            const descriptionParams: CALL_CONFIG_VARIABLES = {
                Agent: waveUserInfo.current.userName,
                AgentEmail: waveUserInfo.current.email,
                AgentFirstName: waveUserInfo.current.firstName,
                AgentLastName: waveUserInfo.current.lastName,
                CallDirection: CALL_DIRECTION_TYPE[callDirection],
                CallEndTimeLocal: moment(callEndTimeStamp).toLocaleString(),
                CallEndTimeUTC: moment(callEndTimeStamp).utc().format(),
                CallEndTimeUTCMillis: callEndTimeStamp,
                CallEstablishedTimeUTCMillis: callStartTimeStamp,
                CallEstablishedTimeLocal: moment(callStartTimeStamp).toLocaleString(),
                CallEstablishedTimeUTC: moment(callStartTimeStamp).utc().format(),
                CallStartTimeLocal: moment(callStartTimeStamp).toLocaleString(),
                CallStartTimeUTC: moment(callStartTimeStamp).utc().format(),
                CallStartTimeUTCMillis: callStartTimeStamp,
                CallType: CALL_DIRECTION_TYPE[callDirection],
                DateTime: moment(callStartTimeStamp).format(),
                Duration: moment().startOf('day').add(duration, 'ms').format(DATE_FORMAT.format_5),
                EntityId: contactInfo.ID,
                EntityType: contactInfo.Module,
                Name: `${contactInfo.NAME} ${contactInfo.LAST_NAME}`,
                Number: callNum
            }

            const configDescription = get(userConfig, ['uploadCallConfig', CALL_DIRECTION_TYPE[callDirection]])

            const COMMUNICATIONS = [
                {
                    VALUE: callNum,
                    ENTITY_ID: contactInfo.ID,
                    ENTITY_TYPE_ID: contactInfo.ModuleId
                }
            ]

            const fields = {
                OWNER_TYPE_ID: contactInfo.ModuleId, //from the method crm.enum.ownertype: 2 - "activity" type
                OWNER_ID: contactInfo.ID, //activity ID
                TYPE_ID: 2, // see crm.enum.activitytype: 2 - "call" type
                COMMUNICATIONS, //where 134 - contract id, 3 - "contact" type
                SUBJECT: formatDescription(userConfig.uploadCallConfig.subject, descriptionParams),
                START_TIME: moment(callStartTimeStamp || undefined).format(DATE_FORMAT.format_4),
                END_TIME: moment(callEndTimeStamp || undefined).format(DATE_FORMAT.format_4),
                COMPLETED: "Y",
                PRIORITY: 3, // see crm.enum.activitypriority 3 - "high" type
                RESPONSIBLE_ID: user.ID,
                DESCRIPTION: formatDescription(configDescription, descriptionParams),
                DESCRIPTION_TYPE: 1, // see crm.enum.contenttype
                STATUS: 2, // 已完成
                DIRECTION: callDirection, // see crm.enum.activitydirection
            };
            const params = {
                fields: {
                    fields
                },
                webhook: userConfig.webhook,
            }
            putCallInfo(params).then(res => {
                console.log("putCallInfo:", params, res);
            });
        });
    }, [userConfig, user]);

    const getUrl = (contact: LooseObject) => {
        const module = contact.Module === MODULES.contact ? 'contact' : 'lead';
        return contact?.ID ? `${userConfig.host}/crm/${module}/details/${contact.ID}/`
            : userConfig.host + `/crm/contact/details/0/`;
    };

    const initCallInfo = useCallback((callNum: string, unCallAction: boolean, callContactInfo, direction) => {
        getContact({ callNum, webhook: userConfig.webhook }).then(contact => {
            // 是Wave联系人，但不是CRM联系人，不展示信息
            if (!contact.ID && callContactInfo) {
                return
            }

            // 需要创建联系人的通话类型
            const createContactBoolean = userConfig.autoCreateConfig?.direction === direction || userConfig.autoCreateConfig?.direction === 'All'

            // 不是Wave联系人，也不是CRM联系人 且配置自动创建联系人
            if (!contact.ID && !callContactInfo && userConfig.autoCreate && createContactBoolean) {
                createContact(userConfig, callNum, unCallAction);
                return
            }

            notification(contact, callNum, unCallAction);
        });
    }, [userConfig]);

    /**
     * 创建新的联系人
     * @param userConfig
     * @param callNum
     * @param unCallAction
     */
    const createContact = (userConfig: LooseObject, callNum: string, unCallAction: boolean) => {
        const userInfoParams = {
            Agent: waveUserInfo.current.userName,
            AgentEmail: waveUserInfo.current.email,
            AgentFirstName: waveUserInfo.current.firstName,
            AgentLastName: waveUserInfo.current.lastName,
            Number: callNum
        }

        const fields = {
            NAME: formatDescription(userConfig.autoCreateConfig.firstName, userInfoParams),
            LAST_NAME: formatDescription(userConfig.autoCreateConfig.lastName, userInfoParams),
            PHONE: [{
                VALUE: callNum,
            }],
        };

        const attributesType = userConfig.autoCreateConfig.entityType;

        const payload = {
            fields: {
                fields
            },
            webhook: userConfig.webhook,
            attributesType,
        };

        createNewContact(payload).then(contact => {
            newContactInfo.current = contact;
            contact.displayNotification = true;
            console.log("createNewContact", contact);
            notification(contact, callNum, unCallAction)
        });
    }

    const notification = (contact: any, callNum: string, unCallAction: boolean) => {
        // 展示联系人信息时，不受配置影响
        if (!contact?.displayNotification || !unCallAction && (!callState.current.get(callNum) || !userConfig.notification)) {
            return;
        }
        callNumber.current = callNum;
        const url = getUrl(contact);
        const pluginPath = sessionStorage.getItem("pluginPath");

        // body对象，
        const body: LooseObject = {
            logo: `<div style="margin-bottom: 12px"><img src="${pluginPath}/logo.svg" alt=""/> Bitrix24</div>`,
        }
        if (contact?.ID) {
            // 将showConfig重复的删除
            const configList = [...new Set<string>(Object.values(userConfig.notificationConfig))]
            console.log(configList);
            for (const key in configList) {
                console.log(configList[key])
                if (!configList[key]) {
                    continue;
                }

                // 取出联系人的信息用于展示
                let configValue = getValueByConfig(contact, configList[key]);
                console.log(configValue);
                if (configList[key] === 'Phone') {
                    const phone = formatPhoneNumber(callNum);
                    configValue = phone;
                }
                if (configValue) {
                    body[`config_${key}`] = `<div style="font-weight: bold; display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 5;overflow: hidden;word-break: break-all;text-overflow: ellipsis;">${configValue}</div>`
                }
            }
        }
        else {
            body.phone= `<div style="font-weight: bold; display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 5;overflow: hidden;word-break: break-all;text-overflow: ellipsis;">${formatPhoneNumber(callNum)}</div>`
        }
        body.action = `<div style="margin-top: 10px;display: flex;justify-content: flex-end;"><button style="background: none; border: none;">
                     <a href=${url} target="_blank" style="color: #62B0FF">
                         ${contact?.ID ? formatMessage({ id: 'home.detail' }) : formatMessage({ id: 'home.edit' })}
                     </a>
                 </button></div>`;


        console.log("displayNotification");
        // @ts-ignore
        pluginSDK.displayNotification({
            notificationBody: getNotificationBody(body)
        });
    };

    useEffect(() => {
        /**
         * 监听号码
         * 回调函数参数：callType,callNum
         **/
        // @ts-ignore
        pluginSDK.eventEmitter.on(EVENT_KEY.onViewCustomerInfos, function ({ phoneNumber }) {
            console.log("onViewCustomerInfos", phoneNumber);
            newContactInfo.current = {}
            initCallInfo(phoneNumber, true, undefined, '');
        });

        /**
         * 监听收到语音/视频来电
         * 回调函数参数：callType,callNum
         **/
        // @ts-ignore
        pluginSDK.eventEmitter.on(EVENT_KEY.recvP2PIncomingCall, function ({ callType, callNum, callContactInfo }) {
            console.log("onRecvP2PIncomingCall", callType, callNum);
            callState.current.set(callNum, true);
            newContactInfo.current = {}
            initCallInfo(callNum, false, callContactInfo, 'Inbound')
        });

        /**
         * 监听wave发起语音/视频
         * 回调函数参数：callType,callNum
         */
        // @ts-ignore
        pluginSDK.eventEmitter.on(EVENT_KEY.initP2PCall, function ({ callType, callNum, callContactInfo }) {
            console.log("onInitP2PCall", callType, callNum);
            callState.current.set(callNum, true);
            newContactInfo.current = {}
            initCallInfo(callNum, false, callContactInfo, 'Outbound');
        });

        return function cleanup() {
            // @ts-ignore
            pluginSDK.eventEmitter.off(EVENT_KEY.onViewCustomerInfos);

            // @ts-ignore
            pluginSDK.eventEmitter.off(EVENT_KEY.recvP2PIncomingCall);

            // @ts-ignore
            pluginSDK.eventEmitter.off(EVENT_KEY.initP2PCall);
        }
    }, [initCallInfo])

    useEffect(() => {
        /**
         * 监听拒绝语音/视频
         * 回调函数参数：callType,callNum
         */
        // @ts-ignore
        pluginSDK.eventEmitter.on(EVENT_KEY.rejectP2PCall, function ({ callType, callNum }) {
            console.log("onRejectP2PCall", callType, callNum);
            uploadCallInfo(callNum, 0, 0, WAVE_CALL_TYPE.in);
            console.log("hideNotification, callNum, callState", callNum, callState);
            callState.current.set(callNum, false);
            if (callNumber.current === callNum) {
                // @ts-ignore
                pluginSDK.hideNotification();
            }
        });

        /**
         * 监听挂断语音/视频
         * 回调函数参数：callType,callNum
         */
        // @ts-ignore
        pluginSDK.eventEmitter.on(EVENT_KEY.hangupP2PCall, function (data) {
            console.log("onHangupP2PCall", data);
            let { callNum, callStartTimeStamp, callEndTimeStamp, callDirection } = data;
            callDirection = callDirection === "in" ? WAVE_CALL_TYPE.in : WAVE_CALL_TYPE.out;
            uploadCallInfo(callNum, callStartTimeStamp ?? 0, callEndTimeStamp ?? 0, callDirection);
            console.log("hideNotification, callNum, callState", callNum, callState);
            callState.current.set(callNum, false);
            if (callNumber.current === callNum) {
                // @ts-ignore
                pluginSDK.hideNotification();
            }
        });

        // @ts-ignore
        pluginSDK.eventEmitter.on(EVENT_KEY.p2PCallCanceled, function ({ callType, callNum }) {
            console.log("p2PCallCanceled", callType, callNum);
            uploadCallInfo(callNum, 0, 0, WAVE_CALL_TYPE.miss);
            console.log("hideNotification, callNum, callState", callNum, callState);
            callState.current.set(callNum, false);
            if (callNumber.current === callNum) {
                // @ts-ignore
                pluginSDK.hideNotification();
            }
        });

        return function cleanup() {
            // @ts-ignore
            pluginSDK.eventEmitter.off(EVENT_KEY.rejectP2PCall);

            // @ts-ignore
            pluginSDK.eventEmitter.off(EVENT_KEY.hangupP2PCall);

            // @ts-ignore
            pluginSDK.eventEmitter.off(EVENT_KEY.p2PCallCanceled);
        };

    }, [uploadCallInfo]);

    useEffect(() => {
        return function closeNotification() {
            // @ts-ignore
            pluginSDK.hideNotification();
        }
    }, [])

    useEffect(() => {
        // @ts-ignore
        pluginSDK.contact.getMe(({ data }) => {
            console.log('getMe', data);
            if (!data) {
                return
            }
            waveUserInfo.current = data;
        })
    }, [])

    return (<></>)
}

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        user: global.user,
        userConfig: global.userConfig,
    }),
    (dispatch: Dispatch) => ({
        getContact: (payload: LooseObject) =>
            dispatch({
                type: "home/getContact",
                payload
            }),
        createNewContact: (payload: LooseObject) => dispatch({
            type: "home/createNewContact",
            payload
        }),
        putCallInfo: (payload: LooseObject) =>
            dispatch({
                type: "home/putCallInfo",
                payload
            })
    })
)(IndexPage);