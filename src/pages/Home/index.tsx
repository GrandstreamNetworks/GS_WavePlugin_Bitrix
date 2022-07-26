import React, { useCallback } from "react";
import { connect, Dispatch, GlobalModelState, useIntl } from "umi";
import moment from "moment-timezone";
import { getNotificationBody, getValueByConfig } from "@/utils/utils";
import { CallAction, ConfigBlock, ConnectError, ConnectState, Footer } from "@/components";
import { DATE_FORMAT } from "@/constant";
import styles from "./index.less";


interface HomeProps {
    getContact: (obj: LooseObject) => Promise<LooseObject>;
    putCallInfo: (obj: LooseObject) => Promise<LooseObject>;
    user: LooseObject
    uploadCall: boolean
    webhook: string
    host: string
    showConfig: ShowConfig
    callState: Map<string, boolean>
}

const HomePage: React.FC<HomeProps> = (props) => {
    const {
        getContact,
        putCallInfo,
        uploadCall,
        user,
        webhook,
        host,
        showConfig,
        callState,
    } = props;
    const { formatMessage } = useIntl();

    /**
     * 上报通话
     */
    const uploadCallInfo = useCallback((callNum: string, callStartTimeStamp: number, callEndTimeStamp: number, callDirection: number) => {
        if (!uploadCall) {
            return;
        }
        callNum = callNum.replace(/\b(0+)/gi, "");
        getContact({ callNum, webhook }).then(contactInfo => {
            if (!contactInfo?.ID) {
                return;
            }
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
                SUBJECT: contactInfo.NAME && contactInfo.LAST_NAME ? `${contactInfo.NAME} ${contactInfo.LAST_NAME} 's call` : `New call`,
                START_TIME: moment(callStartTimeStamp || undefined).format(DATE_FORMAT.format_4),
                END_TIME: moment(callEndTimeStamp || undefined).format(DATE_FORMAT.format_4),
                COMPLETED: "N",
                PRIORITY: 3, // see crm.enum.activitypriority 3 - "high" type
                RESPONSIBLE_ID: user.ID,
                // DESCRIPTION: "Important call",
                STATUS: 2, // 已完成
                // DESCRIPTION_TYPE: 3, // see crm.enum.contenttype
                DIRECTION: callDirection, // see crm.enum.activitydirection
            };
            const params = {
                fields: {
                    fields
                },
                webhook,
            }
            putCallInfo(params).then(res => {
                console.log("putCallInfo:", params, res);
            });
        });
    }, [webhook, uploadCall]);

    const getUrl = (contact: LooseObject) => {
        return contact?.ID ? `${host}crm/contact/details/${contact.ID}/` : host + "crm/contact/details/0/";
    };

    const initCallInfo = useCallback((callNum: string) => {
        // callNum 去除前面的0
        callNum = callNum.replace(/\b(0+)/gi, "");
        getContact({ callNum, webhook }).then(contact => {
            console.log("callState", callState);
            if (!contact?.displayNotification || !callState.get(callNum)) {
                return;
            }
            const url = getUrl(contact);
            const pluginPath = sessionStorage.getItem("pluginPath");

            // body对象，
            const body: LooseObject = {
                logo: `<div style="margin-bottom: 12px"><img src="${pluginPath}/logo.svg" alt=""/> Bitrix24</div>`,
            }
            if (contact?.ID) {
                // 将showConfig重复的删除
                const configList = [...new Set<string>(Object.values(showConfig))]
                console.log(configList);
                for (const key in configList) {
                    console.log(configList[key])
                    if (!configList[key]) {
                        continue;
                    }

                    // 取出联系人的信息用于展示
                    const configValue = getValueByConfig(contact, configList[key]);
                    console.log(configValue);
                    if (configList[key] === 'Phone') {
                        body[`config_${key}`] = `<div style="font-weight: bold">${callNum}</div>`
                    }
                    else if (configValue) {
                        body[`config_${key}`] = `<div style="font-weight: bold; display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 5;overflow: hidden;word-break: break-all;text-overflow: ellipsis;">${configValue}</div>`
                    }
                }
            }
            else {
                body.phone = `<div style="font-weight: bold;">${callNum}</div>`
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
        });
    }, [webhook, host, showConfig, callState]);

    return (
        <>
            <CallAction initCallInfo={initCallInfo} uploadCallInfo={uploadCallInfo} />
            <ConnectError />
            <div className={styles.homePage}>
                <ConnectState />
                <ConfigBlock />
            </div>
            <Footer url={host} message={formatMessage({ id: "home.toCRM" })} />
        </>
    );
};

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        user: global.user,
        uploadCall: global.uploadCall,
        showConfig: global.showConfig,
        host: global.host,
        webhook: global.webhook,
        callState: global.callState
    }),
    (dispatch: Dispatch) => ({
        getContact: (payload: LooseObject) =>
            dispatch({
                type: "home/getContact",
                payload
            }),
        putCallInfo: (payload: LooseObject) =>
            dispatch({
                type: "home/putCallInfo",
                payload
            })
    })
)(HomePage);
