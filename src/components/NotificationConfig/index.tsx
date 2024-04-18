import { ConfigFooter, Navigation, SwitchConfig } from "@/components";
import { CONFIG_SHOW, NotificationConfig } from "@/constant";
import { Button, Form, Select } from "antd";
import { get } from "lodash";
import React, { useState } from 'react';
import { Dispatch, GlobalModelState, connect } from "umi";
import styles from './index.less';


interface IndexProps {
    userConfig: LooseObject
    connectState: string
    userConfigChange: (obj: LooseObject) => void
}

const Index: React.FC<IndexProps> = ({ userConfigChange, userConfig, connectState }) => {
    const [form] = Form.useForm();
    const [currentDisableOption, setCurrentDisableOption] = useState<string | null>(null);
    const [changed, setChanged] = useState(false);

    const onchange = (_: any, allValues: any) => {
        console.log(allValues);
        setChanged(true)
        let noneNum = 0;
        let key = '';
        Object.keys(allValues).forEach(item => {
            if (allValues[item] === 'None') {
                noneNum++;
                return;
            }
            key = item;
        })
        if (noneNum >= 4) {
            setCurrentDisableOption(key);
        }
    }

    const onFinish = (values: any) => {
        userConfigChange({ notificationConfig: values });
        setChanged(false)
    }

    const reset = () => {
        form.resetFields();
        setChanged(false)
    }

    const notification = (checked: boolean) => {
        userConfigChange({ notification: checked })
    }

    return (
        <div className={styles.notificationConfig}>
            <Navigation title={"Custom Contact Display Information"} />
            <div className={styles.configBlock}>
                <SwitchConfig
                    checked={userConfig.notification}
                    label={"Display Wave Notification When Call."}
                    onSwitchChange={notification} />
                {userConfig.notification && <Form
                    form={form}
                    className={styles.configForm}
                    initialValues={userConfig.notificationConfig}
                    onValuesChange={onchange}
                    layout="vertical"
                    labelAlign="left"
                    colon={false}
                    onFinish={onFinish}
                    disabled={connectState !== 'SUCCESS'}
                >
                    {
                        Object.keys(NotificationConfig).map(item => (
                            <Form.Item name={item} key={item} label={get(NotificationConfig, item)}>
                                <Select>
                                    {Object.keys(CONFIG_SHOW)
                                        .map(element => <Select.Option value={element}
                                            key={element}
                                            disabled={item === currentDisableOption && element === 'None'}>{element}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        ))
                    }
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
        userConfigChange: (payload: LooseObject) =>
            dispatch({
                type: 'global/userConfigChange',
                payload,
            })
    })
)(Index);