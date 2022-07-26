import { Effect, Reducer } from 'umi';
import { get } from 'lodash';
import { MODULES, MODULE_IDS, REQUEST_CODE } from '@/constant';
import { getCompanyInfo, getContact, getLead, putCallInfo } from '../services';

export interface HomeModelState {
}

export interface HomeModelType {
    namespace: string
    state: HomeModelState
    effects: {
        getContact: Effect
        putCallInfo: Effect
    }
    reducers: {
        save: Reducer<HomeModelState>
    }
}

const HomeModal: HomeModelType = {
    namespace: 'home',
    state: {},

    effects: {
        * getContact({ payload }, { call, put }) {
            const params = {
                ...payload,
                filter: {
                    filter: {
                        PHONE: payload.callNum,
                    }
                },
            }
            let res = yield call(getContact, params);
            if (res?.status === REQUEST_CODE.noAuthority) {
                console.log(REQUEST_CODE.noAuthority)
            }
            let module = MODULES.contact;
            let moduleId = MODULE_IDS.contact;
            // 异常判断
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save',
                payload: {
                    connectState,
                }
            })
            if (!res || !res.result) {
                module = MODULES.lead;
                moduleId = MODULE_IDS.lead;
                res = yield call(getLead, params);
            }
            const contactInfo = get(res, ['result', 0]) || {};
            let company = null;
            if (contactInfo.COMPANY_ID) {
                const CompanyParams = {
                    webhook: payload.webhook,
                    fields: {
                        id: contactInfo.COMPANY_ID,
                    }
                }
                const companyInfo = yield call(getCompanyInfo, CompanyParams)
                company = get(companyInfo, ['result', 'TITLE']);
            }
            contactInfo.Module = module;
            contactInfo.ModuleId = moduleId;
            contactInfo.displayNotification = connectState === 'SUCCESS';
            contactInfo.Company = company;
            return contactInfo;
        },

        * putCallInfo({ payload }, { call, put }) {
            let res = yield call(putCallInfo, payload);
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save', payload: { connectState, }
            })
            return res;
        }
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload }
        }
    }
}

export default HomeModal;
