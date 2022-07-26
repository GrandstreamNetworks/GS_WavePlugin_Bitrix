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