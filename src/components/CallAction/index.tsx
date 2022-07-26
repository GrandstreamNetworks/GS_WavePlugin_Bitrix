import React, { useEffect, useRef } from "react";
import { connect, Dispatch, GlobalModelState } from 'umi';
import { EVENT_KEY, WAVE_CALL_TYPE } from "@/constant";

interface IndexProps {
    callState: Map<string, boolean>
    initCallInfo: (obj: string) => void
    uploadCallInfo: (callNum: string, callStartTimeStamp: number, callEndTimeStamp: number, callDirection: number) => void
    save: (obj: LooseObject) => void
}

const IndexPage: React.FC<IndexProps> = ({ callState, initCallInfo, uploadCallInfo, save }) => {

    const callNumber = useRef(null);

    useEffect(() => {
        /**
         * 监听收到语音/视频来电
         * 回调函数参数：callType,callNum
         **/
        // @ts-ignore
        pluginSDK.eventEmitter.on(EVENT_KEY.recvP2PIncomingCall, function ({ callType, callNum }) {
            console.log("onRecvP2PIncomingCall", callType, callNum);
            callNumber.current = callNum;
            callState.set(callNum, true);
            save({ callState });
            initCallInfo(callNum);
        });

        /**
         * 监听wave发起语音/视频
         * 回调函数参数：callType,callNum
         */
        // @ts-ignore
        pluginSDK.eventEmitter.on(EVENT_KEY.initP2PCall, function ({ callType, callNum }) {
            console.log("onInitP2PCall", callType, callNum);
            callNumber.current = callNum;
            callState.set(callNum, true);
            save({ callState });
            initCallInfo(callNum);
        });

        return function cleanup() {

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
            if (callNumber.current === callNum) {
                console.log("hideNotification, callNum, callState", callNum, callState);
                callState.set(callNum, false);
                save({ callState });
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
            if (callNumber.current === callNum) {
                console.log("hideNotification, callNum, callState", callNum, callState);
                callState.set(callNum, false);
                save({ callState });
                // @ts-ignore
                pluginSDK.hideNotification();
            }
        });

        // @ts-ignore
        pluginSDK.eventEmitter.on(EVENT_KEY.p2PCallCanceled, function ({ callType, callNum }) {
            console.log("p2PCallCanceled", callType, callNum);
            uploadCallInfo(callNum, 0, 0, WAVE_CALL_TYPE.in);
            if (callNumber.current === callNum) {
                console.log("hideNotification, callNum, callState", callNum, callState);
                callState.set(callNum, false);
                save({ callState });
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

            save({ callState: new Map() });
        };

    }, [uploadCallInfo]);

    useEffect(() => {
        return function closeNotification() {
            // @ts-ignore
            pluginSDK.hideNotification();
        }
    }, [])

    return (<></>)
}

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        callState: global.callState
    }),
    (dispatch: Dispatch) => ({
        save: (payload: LooseObject) => dispatch({
            type: 'global/save',
            payload
        })
    })
)(IndexPage);