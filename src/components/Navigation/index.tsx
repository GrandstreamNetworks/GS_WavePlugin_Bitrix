import React from "react";
import { Image } from "antd";
import { history } from "umi";
import Back from '@/asset/home/back.svg';

import styles from './index.less'

interface Props {
    title: string
}

const Navigation: React.FC<Props> = ({ title }) => {

    const goBack = () => {
        history.goBack();
    }

    return (
        <div className={styles.navigation}>
            <Image className={styles.backIcon} onClick={goBack} src={Back} preview={false}/>
            <div className={styles.title}>{title}</div>
        </div>
    )
}

export default Navigation;