import { useIntl } from 'umi';
import { ConfigSelect, SwitchBtn } from "@/components";
import styles from "./index.less";

const ConfigBlock = () => {

    const { formatMessage } = useIntl();

    return (
        <div className={styles.configPage}>
            <div className={styles.callConfig}>
                <div className={styles.spanLabel}>{formatMessage({ id: 'home.Synchronize' })}</div>
                <SwitchBtn />
            </div>
            <ConfigSelect />
        </div>
    )
}

export default ConfigBlock;