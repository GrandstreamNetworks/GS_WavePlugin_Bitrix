import { ConfigFooter, SwitchConfig } from "@/components";
import Navigation from "@/components/Navigation";
import { Button, Form, Input } from "antd";
import React, { useState } from "react";
import { Dispatch, GlobalModelState, connect, useIntl } from "umi";
import styles from './index.less';

interface Props {
    userConfig: any
    userConfigChange: (obj: any) => void
    connectState: string
}

const SyncConfig: React.FC<Props> = ({ userConfig, userConfigChange, connectState }) => {

    const { formatMessage } = useIntl()

    const [form] = Form.useForm();
    const [changed, setChanged] = useState(false);


    const canUploadCallChange = (checked: boolean) => {
        userConfigChange({ uploadCall: checked });
    }

    const saveConfig = (values: any) => {
        userConfigChange({ uploadCallConfig: values });
        setChanged(false)
    }

    const onchange = () => {
        setChanged(true)
    }

    const reset = () => {
        form.resetFields();
        setChanged(false)
    }

    return (
        <div className={styles.syncConfig}>
            <Navigation title={"Sync Wave Call History to CRM"} />
            <div className={styles.configBlock}>
                <SwitchConfig
                    checked={userConfig.uploadCall}
                    label={formatMessage({ id: 'home.Synchronize' })}
                    onSwitchChange={canUploadCallChange} />
                {userConfig.uploadCall &&
                    <Form
                        className={styles.configForm}
                        form={form}
                        layout="vertical"
                        labelAlign="left"
                        initialValues={userConfig.uploadCallConfig}
                        onFinish={saveConfig}
                        onValuesChange={onchange}
                        disabled={connectState !== 'SUCCESS'}
                    >
                        <Form.Item
                            name='subject'
                            label='Call Subject'
                            rules={[{ required: true }]}
                        >
                            <Input placeholder='Wave Phone call' />
                        </Form.Item>
                        <Form.Item
                            name='Inbound'
                            label='Answered Inbound Call'
                            rules={[{ required: true }]}
                        >
                            <Input placeholder='Wave Phone call' />
                        </Form.Item>
                        <Form.Item
                            name='Missed'
                            label='Missed Call'
                            rules={[{ required: true }]}
                        >
                            <Input placeholder='Wave Phone call' />
                        </Form.Item>
                        <Form.Item
                            name='Outbound'
                            label='Answered and Unanswered Outbound Call'
                            rules={[{ required: true }]}
                        >
                            <Input placeholder='Wave Phone call' />
                        </Form.Item>
                        <Form.Item>
                            {changed && <ConfigFooter>
                                <Button onClick={reset} type="ghost">Cancel</Button>
                                <Button type={"primary"} htmlType={"submit"}>Save</Button>
                            </ConfigFooter>}
                        </Form.Item>
                    </Form>}
            </div>
        </div>
    )

}

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        userConfig: global.userConfig,
        connectState: global.connectState,
    }),
    (dispatch: Dispatch) => ({
        userConfigChange: (payload: boolean) =>
            dispatch({
                type: 'global/userConfigChange',
                payload,
            }),
    })
)(SyncConfig);