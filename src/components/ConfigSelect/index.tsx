import React, { useState } from 'react';
import { Form, Select } from "antd";
import { get } from "lodash";
import { connect, GlobalModelState, Dispatch } from "umi";
import { CONFIG_SHOW, NotificationConfig } from "@/constant";
import styles from './index.less'


interface IndexProps {
    showConfig: LooseObject
    connectState: string
    saveShowConfig: (obj: LooseObject) => void
}

const Index: React.FC<IndexProps> = ({ saveShowConfig, showConfig, connectState }) => {
    const [form] = Form.useForm();
    const [currentDisableOption, setCurrentDisableOption] = useState<string | null>(null);

    const layout = {
        labelCol: {
            xs: { span: 7 },
            sm: { span: 7 },
        },
        wrapperCol: {
            xs: { span: 17 },
            sm: { span: 17 },
        },
    };

    const onchange = (_: any, allValues: any) => {
        console.log(allValues);
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
        else {
            setCurrentDisableOption('');
        }
        saveShowConfig(allValues);
    }

    return (
        <div className={styles.configPage}>
            <div className={styles.configTitle}>Contact card information</div>
            <Form
                form={form}
                className={styles.configForm}
                onValuesChange={onchange}
                initialValues={showConfig}
                layout="horizontal"
                labelAlign="left"
                colon={false}
                {...layout}
            >
                {
                    Object.keys(NotificationConfig).map(item => (
                        <Form.Item name={item} key={item} label={get(NotificationConfig, item)}>
                            <Select disabled={connectState !== 'SUCCESS'}>
                                {Object.keys(CONFIG_SHOW)
                                    .map(element => <Select.Option value={element}
                                        key={element} disabled={item === currentDisableOption && element === 'None'}>{element}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    ))
                }
            </Form>
        </div>
    )
}

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        showConfig: global.showConfig,
        connectState: global.connectState,
    }),
    (dispatch: Dispatch) => ({
        saveShowConfig: (payload: LooseObject) =>
            dispatch({
                type: 'global/saveShowConfig',
                payload,
            })
    })
)(Index);