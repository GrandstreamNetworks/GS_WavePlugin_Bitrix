import React from 'react';
import { message as Message } from 'antd';
import styles from './index.less'

interface Props {
    url: string
    message: string
    config?: any
}

const IndexPage: React.FC<Props> = ({ url, message, config }) => {

    const copyConfig = () => {
        const copyText = JSON.stringify(config);
        // 拷贝内容
        navigator.clipboard.writeText(copyText).then(() => {
            Message.success('Copied').then()
        })
    }
    const onClick = () => {
        window.open(url)
    }

    return (
        <div className={styles.footer}>
            <span className={styles.openUrl} onClick={onClick}>{message}</span>
            {config && <>
                <span>|</span>
                <a className={styles.copy} onClick={copyConfig}>Copy Account Configuration</a>
            </>}
        </div >
    )
}

export default IndexPage;