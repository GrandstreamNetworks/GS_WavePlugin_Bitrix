import ConfigItem from "@/components/ConfigItem";
import React from "react";
import { connect, GlobalModelState, history } from "umi";
import styles from "./index.less";

interface Props {
    userConfig: LooseObject
}

const ConfigBlock: React.FC<Props> = ({ userConfig }) => {

    const goSync = () => {
        history.push('syncConfig')
    }

    const goNotification = () => {
        history.push('notificationConfig')
    }

    const goCreation = () => {
        history.push('creationConfig')
    }

    return (
        <div className={styles.configPage}>
            <ConfigItem onClick={goSync} title={"Sync Wave Call History to CRM"} state={userConfig.uploadCall} />
            <ConfigItem onClick={goNotification} title={"Custom Contact Display Information"} state={userConfig.notification} />
            <ConfigItem onClick={goCreation} title={"Auto Create Contact to CRM"} state={userConfig.autoCreate} />
        </div>
    )
}

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        userConfig: global.userConfig
    }),
    () => ({})
)(ConfigBlock);