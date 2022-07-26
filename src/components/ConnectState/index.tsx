import React from 'react';
import { Button, Image } from 'antd';
import { connect, GlobalModelState, useIntl, Dispatch } from 'umi';
import { REQUEST_CODE } from '@/constant';
import PicSuccess from '@/asset/ConnectState/success.png';
import PicFailure from '@/asset/ConnectState/failure.png';
import styles from './index.less'

interface IndexProps {
    connectState: string
    user: LooseObject
    logout: () => void
}

const IndexPage: React.FC<IndexProps> = ({ connectState, user, logout }) => {
    const { formatMessage } = useIntl();

    const logoutClick = () => {
        logout();
    };

    return (
        <div className={styles.resultPage}>
            <div hidden={connectState !== 'SUCCESS'}>
                <div className={styles.result}>
                    <Image src={PicSuccess} preview={false} />
                    <div>
                        <p>{user.NAME || user.EMAIL}</p>
                        <p>{formatMessage({ id: 'home.logged' })}</p>
                    </div>
                    <Button type="primary" onClick={logoutClick}>{formatMessage({ id: 'home.logout' })}</Button>
                </div>
            </div>
            <div hidden={connectState !== REQUEST_CODE.connectError && connectState !== REQUEST_CODE.reConnect}>
                <div className={styles.result}>
                    <Image src={PicFailure} preview={false} />
                    <div>
                        <p>{user.NAME || user.EMAIL}</p>
                        <p>{formatMessage({ id: 'home.connectError' })}</p>
                    </div>
                    <Button type="primary" onClick={logoutClick}>{formatMessage({ id: 'home.logout' })}</Button>
                </div>
            </div>
            <div hidden={connectState !== REQUEST_CODE.invalidToken}>
                <div className={styles.result}>
                    <Image src={PicFailure} preview={false} />
                    <div>
                        <p>{user.NAME || user.EMAIL}</p>
                        <p>{formatMessage({ id: 'home.invalidToken' })}</p>
                    </div>
                    <Button type="primary" onClick={logoutClick}>{formatMessage({ id: 'home.logout' })}</Button>
                </div>
            </div>
        </div>
    )
}

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        user: global.user,
        connectState: global.connectState,
    }),
    (dispatch: Dispatch) => ({
        logout: () => dispatch({
            type: 'global/logout',
        }),
    })
)(IndexPage);