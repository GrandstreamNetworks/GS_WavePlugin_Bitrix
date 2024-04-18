import React from 'react';
import { Switch } from 'antd';
import { connect, GlobalModelState } from 'umi';
import styles from './index.less'

interface Props {
    checked: boolean // 开关状态
    label: string // 开关的label
    onSwitchChange: (checked: boolean) => void // 当开关变化时要调用的方法
    connectState: string // 网络连接状态
}

const IndexPage: React.FC<Props> = ({ checked, label, onSwitchChange, connectState }) => {

    return (
        <div className={styles.switchConfig}>
            <div className={styles.spanLabel}>{label}</div>
            <div className={styles.switch}>
                <Switch
                    checked={checked}
                    onChange={onSwitchChange}
                    disabled={connectState !== 'SUCCESS'}/>
            </div>
        </div>

    )
}

export default connect(
    ({ global }: {global: GlobalModelState}) => ({
        connectState: global.connectState,
    }),
    () => ({})
)(IndexPage);