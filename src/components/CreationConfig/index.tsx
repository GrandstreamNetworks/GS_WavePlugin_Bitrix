import { ConfigFooter, Navigation, SwitchConfig } from "@/components";
import { CREATION_CONFIG_CONTACT_TYPE } from "@/constant";
import { Button, Form, Input, Modal, Select } from "antd";
import React, { useState } from "react";
import { Dispatch, GlobalModelState, connect } from "umi";
import styles from "./index.less";

interface Props {
    userConfig: any
    userConfigChange: (obj: any) => void
    connectState: string
}

const CreationConfig: React.FC<Props> = ({ userConfig, userConfigChange, connectState }) => {

    const [form] = Form.useForm();
    const [changed, setChanged] = useState(false);

    const autoCreate = (checked: boolean) => {
        if (checked) {
            // @ts-ignore
            pluginSDK.getCommonInfo(({ data }) => {
                const { waveVersion } = data
                if (waveVersion && waveVersion.split('.')[1] >= 22) {
                    userConfigChange({ autoCreate: checked });
                    return
                }

                Modal.error({
                    title: 'Auto create new contact is not supported in this Wave version, please upgrade to 1.23.x or above.',
                    okText: 'OK',
                })
            })
            return
        }
        userConfigChange({ autoCreate: checked });
    }

    const saveConfig = (values: any) => {
        userConfigChange({ autoCreateConfig: values });
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
        <div className={styles.creationConfig}>
            <Navigation title={"Auto Create New Contact"} />
            <div className={styles.configBlock}>
                <SwitchConfig
                    checked={userConfig.autoCreate}
                    label={"Auto Create New Contact"}
                    onSwitchChange={autoCreate} />
                {userConfig.autoCreate &&
                    <Form
                        className={styles.configForm}
                        form={form}
                        layout="vertical"
                        labelAlign="left"
                        initialValues={userConfig.autoCreateConfig}
                        onFinish={saveConfig}
                        onValuesChange={onchange}
                        disabled={connectState !== 'SUCCESS'}
                    >
                        <Form.Item
                            name={"direction"}
                            label={"Create Contacts on Call Direction"}
                            rules={[{ required: true }]}
                        >
                            <Select
                                options={[
                                    { value: 'Inbound', label: 'Inbound' },
                                    { value: 'Outbound', label: 'Outbound' },
                                    { value: 'All', label: 'All' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name='entityType'
                            label='Contact Type'
                            rules={[{ required: true }]}
                        >
                            <Select
                                options={CREATION_CONFIG_CONTACT_TYPE.map(item => ({
                                    value: item,
                                    label: item
                                }))}
                            />
                        </Form.Item>
                        <Form.Item
                            name='firstName'
                            label='New Contact First Name'
                            rules={[{ required: true }]}
                        >
                            <Input placeholder='First Name' maxLength={50} />
                        </Form.Item>
                        <Form.Item
                            name='lastName'
                            label='New Contact Last Name'
                            rules={[{ required: true }]}
                        >
                            <Input placeholder='Lase Name' maxLength={50} />
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
)(CreationConfig);