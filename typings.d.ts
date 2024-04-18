declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
    export function ReactComponent(
        props: React.SVGProps<SVGSVGElement>,
    ): React.ReactElement;
    const url: string;
    export default url;
}

interface LooseObject {
    [key: string]: any
}

interface ShowConfig {
    first?: string
    second?: string
    third?: string
    forth?: string
    fifth?: string
}

declare type CALL_CONFIG_VARIABLES = {
    CallType?: string
    Number: string
    CallDirection?: string
    Name: string
    EntityId: string
    EntityType: string
    Agent: string
    AgentFirstName?: string
    AgentLastName?: string
    AgentEmail?: string
    Duration: string
    DateTime: string
    CallStartTimeLocal: string
    CallStartTimeUTC: string
    CallEstablishedTimeLocal: string
    CallEstablishedTimeUTC: string
    CallEndTimeLocal: string
    CallEndTimeUTC: string
    CallStartTimeUTCMillis: number
    CallEstablishedTimeUTCMillis: number
    CallEndTimeUTCMillis: number
}