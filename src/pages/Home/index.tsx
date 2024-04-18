import { ConfigBlock, ConnectError, ConnectState, Footer } from "@/components";
import React from "react";
import { GlobalModelState, connect, useIntl } from "umi";
import styles from "./index.less";

interface HomePageProps {
    userConfig: LooseObject;
}

const HomePage: React.FC<HomePageProps> = ({ userConfig }) => {

    const { formatMessage } = useIntl();

    return (
        <>
            <ConnectError />
            <div className={styles.homePage}>
                <ConnectState />
                <ConfigBlock />
            </div>
            <Footer url={userConfig.host} config={{ webhook: userConfig.webhook }} message={formatMessage({ id: "home.toCRM" })} />
        </>
    );
};

export default connect(({ global }: { global: GlobalModelState }) => ({
    userConfig: global.userConfig,
}))(HomePage);
