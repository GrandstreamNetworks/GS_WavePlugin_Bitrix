import React from 'react';
import { Switch } from 'antd';
import { connect, GlobalModelState, Dispatch } from 'umi';
import styles from './index.less'

interface Props {
    connectState: string
    uploadCall: boolean
    uploadCallChange: (obj: boolean) => void
}

const IndexPage: React.FC<Props> = ({ uploadCall, uploadCallChange, connectState }) => {

    const onSwitchChange = (checked: boolean) => {
        uploadCallChange(checked);
    }

    return (
        <div className={styles.switch}>
            <Switch
                checked={uploadCall}
                onChange={onSwitchChange}
                disabled={connectState !== 'SUCCESS'} />
        </div>
    )
}

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        uploadCall: global.uploadCall,
        connectState: global.connectState,
    }),
    (dispatch: Dispatch) => ({
        uploadCallChange: (payload: boolean) =>
            dispatch({
                type: 'global/uploadCallChange',
                payload,
            }),
    })
)(IndexPage);