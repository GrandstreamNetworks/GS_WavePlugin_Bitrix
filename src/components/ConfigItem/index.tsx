import React from "react";
import { Image } from "antd";
import Right from '@/asset/home/right.svg'
import styles from "./index.less";

interface Props {
    onClick: (e: any) => void
    title: string
    state?: boolean
}

const ConfigItem: React.FC<Props> = ({ title, onClick, state }) => {

    return (
        <div className={styles.configItem} onClick={onClick}>
            <div className={styles.itemName}>{title}</div>
            <div className={styles.itemState}>
                <div className={styles.state}>{state ? 'on' : 'off'}</div>
                <Image src={Right} className={styles.icon} preview={false}/>
            </div>
        </div>
    )
}

export default ConfigItem