import AccountIcon from '@/asset/login/account-line.svg';
import { Footer } from '@/components';
import { AUTO_CREATE_CONFIG_DEF, NOTIFICATION_CONFIG_DEF, UPLOAD_CALL_CONFIG_DEF } from "@/constant";
import { getHostByWebHook } from '@/utils/utils';
import { Button, Checkbox, Form, Image, Input } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Dispatch, Loading, connect, history, useIntl } from 'umi';
import styles from './index.less';

interface LoginProps {
    getUser: (obj: LooseObject) => Promise<LooseObject>;
    saveUserConfig: (obj: LooseObject) => void;
    loginLoading: boolean | undefined;
}

const IndexPage: React.FC<LoginProps> = ({ getUser, saveUserConfig, loginLoading }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [remember, setRemember] = useState(true);
    const [form] = Form.useForm();
    const userConfig = useRef<LooseObject>({});
    const { formatMessage } = useIntl();

    const onCheckChange = (e: { target: { checked: boolean | ((prevState: boolean) => boolean) } }) => {
        setRemember(e.target.checked);
    };

    const onfocus = () => {
        setErrorMessage('');
    };

    const loginSuccess = (values: LooseObject) => {
        console.log('loginSuccess', values);
        const host = getHostByWebHook(values.webhook);
        const userConfig = {
            ...values,
            host,
            autoLogin: remember ?? true,
            uploadCall: values.uploadCall ?? true,
            notification: values.notification ?? true,
            autoCreate: values.autoCreate ?? false,
            autoCreateConfig: values.autoCreateConfig ?? AUTO_CREATE_CONFIG_DEF,
            uploadCallConfig: values.uploadCallConfig ?? UPLOAD_CALL_CONFIG_DEF,
            notificationConfig: values.notificationConfig ?? NOTIFICATION_CONFIG_DEF,
        };
        saveUserConfig(userConfig);
        history.replace({ pathname: '/home' });
    }

    const onFinish = (values: LooseObject) => {
        console.log('onFinish', values);
        getUser(values).then((res) => {
            console.log(res);
            if (res?.status || res?.error || res?.code) {
                setErrorMessage('error.host');
                return;
            }
            if (res.ID) {
                loginSuccess({
                    ...userConfig.current,
                    ...values,
                });
            }
        });
    }

    useEffect(() => {
        try {
            // @ts-ignore
            pluginSDK.userConfig.getUserConfig(function ({ errorCode, data }) {
                console.log(errorCode, data);
                if (errorCode === 0 && data) {
                    const userInfo = JSON.parse(data);
                    console.log(userInfo);
                    userConfig.current = userInfo;
                    form.setFieldsValue(userInfo);

                    // 已登录的与预装配置进行对比
                    let sameConfig = true;

                    // 有预装配置 走预装配置
                    const preParamObjectStr = sessionStorage.getItem('preParamObject');
                    if (preParamObjectStr) {
                        const preParamObject = JSON.parse(sessionStorage.getItem('preParamObject') || '');
                        if (preParamObject) {
                            const formParams: any = {};
                            Object.keys(preParamObject).forEach((item) => {
                                Object.keys(userInfo).forEach((element) => {
                                    if (item.toLowerCase() === element.toLowerCase()) {
                                        formParams[element] = preParamObject[item];
                                        if (!sameConfig) {
                                            return;
                                        }
                                        sameConfig = preParamObject[item] === userInfo[element];
                                    }
                                });
                            });
                            form.setFieldsValue({ ...formParams });
                        }
                    }
                    if (userInfo.autoLogin && sameConfig) {
                        onFinish(userInfo);
                    }
                }
                else {
                    // 有预装配置 走预装配置
                    const preParamObjectStr = sessionStorage.getItem('preParamObject');
                    if (!preParamObjectStr) {
                        return;
                    }
                    const preParamObject = JSON.parse(preParamObjectStr);
                    const userInfo: any = { webhook: '' };
                    if (preParamObject) {
                        Object.keys(preParamObject).forEach((item) => {
                            userInfo[item.toLowerCase()] = preParamObject[item];
                        });
                        form.setFieldsValue({ ...userInfo });
                    }
                    onFinish(userInfo);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }, []);

    return (
        <>
            {errorMessage && (
                <div className={styles.errorDiv}>
                    <div className={styles.errorMessage}>{formatMessage({ id: errorMessage })}</div>
                </div>
            )}
            <div className={styles.homePage}>
                <Form className={styles.form} form={form} layout="vertical" onFinish={onFinish} onFocus={onfocus}>
                    <div className={styles.formContent}>
                        <Form.Item
                            name="webhook"
                            rules={[
                                {
                                    required: true,
                                    type: 'url',
                                    message: formatMessage({ id: 'login.username.error' }),
                                },
                            ]}
                        >
                            <Input
                                placeholder={formatMessage({ id: 'login.username' })}
                                prefix={<Image src={AccountIcon} preview={false} />}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loginLoading}>
                            {formatMessage({ id: 'login.submit' })}
                        </Button>
                    </Form.Item>
                    <div className={styles.remember}>
                        <Checkbox checked={remember} onChange={onCheckChange}>
                            {formatMessage({ id: 'login.remember' })}
                        </Checkbox>
                    </div>
                </Form>
            </div>
            <Footer
                url="https://documentation.grandstream.com/knowledge-base/wave-crm-add-ins/#overview"
                message={formatMessage({ id: 'login.user.guide' })}
            />
        </>
    );
};

export default connect(
    ({ loading }: { loading: Loading }) => ({
        loginLoading: loading.effects['global/getUser'],
    }),
    (dispatch: Dispatch) => ({
        getUser: (payload: LooseObject) =>
            dispatch({
                type: 'global/getUser',
                payload,
            }),
        saveUserConfig: (payload: LooseObject) =>
            dispatch({
                type: 'global/saveUserConfig',
                payload,
            }),
    }),
)(IndexPage);
