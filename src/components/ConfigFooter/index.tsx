import React from "react";
import styles from './index.less'

interface Props {}

const Index: React.FC<Props> = ({ children }) => {

    return (
        <div className={styles.configFooter}>
            {children}
        </div>
    )
}

export default Index;