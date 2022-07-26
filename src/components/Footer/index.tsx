import React from 'react';
import styles from './index.less'

interface Props {
    url: string
    message: string
}

const IndexPage: React.FC<Props> = ({ url, message }) => {
    return (
        <div className={styles.footer}>
            <a href={url} target="_blank">{message}</a>
        </div >
    )
}

export default IndexPage;