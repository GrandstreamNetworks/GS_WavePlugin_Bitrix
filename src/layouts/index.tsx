import React from "react";
import { ConnectProps } from 'umi';
import { CallAction } from "@/components";

interface LayoutProps extends ConnectProps {

}

const Layouts: React.FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <CallAction/>
            {children}
        </>
    )
}

export default Layouts;