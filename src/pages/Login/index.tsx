import React, { useEffect, useState } from 'react';
import { connect, history, useIntl, Loading, Dispatch } from 'umi';
import { Button, Checkbox, Form, Image, Input } from 'antd';
import { Footer } from '@/components';
import { getHostByWebHook } from "@/utils/utils";
import AccountIcon from '@/asset/login/account-line.svg';
import styles from './index.less';

interface LoginProps {
    getUser: (obj: LooseObject) => Promise<LooseObject>
    saveUserConfig: (obj: LooseObject) => void
    save: (obj: Object) => void
    loginLoading: boolean | undefined
}

const IndexPage: React.FC<LoginProps> = ({ getUser, saveUserConfig, save, loginLoading }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [remember, setRemember] = useState(true);
    const [form] = Form.useForm();
    const { formatMessage } = useIntl();

    const onCheckChange = (e: { target: { checked: boolean | ((prevState: boolean) => boolean) } }) => {
        setRemember(e.target.checked);
    };

    const onfocus = () => {
        setErrorMessage('');
    }

    const loginSuccess = () => {
        history.replace({ pathname: '/home', });
    }

    const onFinish = (values: LooseObject) => {
        getUser(values).then(res => {
            console.log(res);
            if (res?.status || res?.error || res?.code) {
                setErrorMessage('error.host');
                return;
            }
            if (res.ID) {
                const host = getHostByWebHook(values.webhook);
                const userConfig = {
                    ...values,
                    host,
                    autoLogin: remember ?? true,
                    uploadCall: values.uploadCall ?? true,
                    showConfig: values.showConfig ?? {
                        first: 'Name',
                        second: 'Phone',
                        third: 'None',
                        forth: 'None',
                        fifth: 'None',
                    }
                }
                save({
                    webhook: values.webhook,
                    host,
                    uploadCall: values.uploadCall ?? true,
                    showConfig: values.showConfig ?? {
                        first: 'Name',
                        second: 'Phone',
                        third: 'None',
                        forth: 'None',
                        fifth: 'None',
                    }
                })
                saveUserConfig(userConfig);
                loginSuccess();
            }
        });
    };

    useEffect(() => {
        try {
            // @ts-ignore
            pluginSDK.userConfig.getUserConfig(function ({ errorCode, data }) {
                console.log(errorCode, data);
                if (errorCode === 0 && data) {
                    const userInfo = JSON.parse(data);
                    console.log(userInfo);
                    form.setFieldsValue(userInfo);
                    if (userInfo.autoLogin) {
                        onFinish(userInfo);
                    }
                }
            })
        } catch (e) {
            console.error(e)
        }
    }, [])

    return (
        <>
            {errorMessage && <div className={styles.errorDiv}>
                <div className={styles.errorMessage}>{formatMessage({ id: errorMessage })}</div>
            </div>}
            <div className={styles.homePage}>
                <Form
                    className={styles.form}
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onFocus={onfocus}
                >
                    <div className={styles.formContent}>
                        <Form.Item
                            name="webhook"
                            rules={
                                [{
                                    required: true,
                                    message: formatMessage({ id: 'login.username.error' })
                                }]
                            }>
                            <Input placeholder={formatMessage({ id: 'login.username' })}
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
            <Footer url="https://documentation.grandstream.com/knowledge-base/wave-crm-add-ins/#overview"
                message={formatMessage({ id: 'login.user.guide' })} />
        </>
    );
};

export default connect(
    ({ loading }: { loading: Loading }) => ({
        loginLoading: loading.effects['global/getUser']
    }),
    (dispatch: Dispatch) => ({
        getUser: (payload: LooseObject) => dispatch({
            type: 'global/getUser',
            payload
        }),
        saveUserConfig: (payload: LooseObject) => dispatch({
            type: 'global/saveUserConfig',
            payload,
        }),
        save: (payload: LooseObject) => dispatch({
            type: 'global/save',
            payload
        })
    })
)(IndexPage);
