import { get } from "lodash";
import { Effect, Reducer, history } from "umi";
import { getUser } from '@/services/global';

export interface GlobalModelState {
    userConfig: LooseObject
    user: LooseObject
    connectState: string
}

export interface GlobalModelType {
    namespace: 'global'
    state: GlobalModelState
    effects: {
        getUser: Effect
        userConfigChange: Effect
        saveUserConfig: Effect
        logout: Effect
    }
    reducers: {
        save: Reducer<GlobalModelState>
    }
}

const GlobalModal: GlobalModelType = {
    namespace: 'global',
    state: {
        user: {},
        userConfig: {},
        connectState: 'SUCCESS',
    },

    effects: {
        * getUser({ payload }, { call, put }): any {
            const res = yield call(getUser, payload);
            const user = get(res, 'result') || res;
            const connectState = res?.code || 'SUCCESS';
            if (user.ID) {
                yield put({
                    type: 'save',
                    payload: {
                        user,
                        connectState,
                    }
                })
            }
            else {
                yield put({
                    type: 'save',
                    payload: {
                        connectState,
                    }
                })
            }
            return user;
        },

        * logout(_, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global);
            userConfig.autoLogin = false;
            yield put({
                type: 'saveUserConfig',
                payload: userConfig
            });
            history.replace({ pathname: 'login' })
        },

        * userConfigChange({ payload }, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global);
            const newConfig = {
                ...userConfig,
                ...payload,
            }
            yield put({
                type: 'saveUserConfig',
                payload: newConfig,
            })
        },

        * saveUserConfig({ payload }, { put }) {
            console.log(payload);
            // @ts-ignore
            pluginSDK.userConfig.addUserConfig({ userConfig: JSON.stringify(payload) }, function ({ errorCode }) {
                console.log(errorCode);
            })
            yield put({
                type: 'save', payload: {
                    userConfig: payload
                },
            })
        }
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },
};

export default GlobalModal;
