import { get } from 'lodash';
import { CONFIG_SHOW } from '@/constant';

export function getNotificationBody(body: LooseObject): string {
    let result = `<div style="color: #f0f0f0">`
    for (const property in body) {
        if (body.hasOwnProperty(property)) {
            if (body[property]) {
                result += `${body[property]}`
            }
        }
    }
    result += `</div>`
    return result;
}

// 这里声明了两个泛型 T 和 K
// T 代表函数第一个参数的类型，K 代表函数第二个参数的类型这个类型指向第一个参数类型中包含的key的值
export function getPropertyValue<T extends Object, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key]
}

export function getHostByWebHook(webHook: string) {
    const indexOf = webHook.indexOf('rest');
    return webHook.substring(0, indexOf);
}

// 根据CONFIG_SHOW的属性值获取Object的属性值。
export function getValueByConfig<T extends Object, K extends keyof CONFIG_SHOW>(obj: LooseObject, key: string) {
    if (!key) {
        return null;
    }
    const T_key = get(CONFIG_SHOW, [key]);
    if (Array.isArray(T_key)) {
        let result = null;
        for (const item in T_key) {
            const value = get(obj, T_key[item]);
            if (['string', 'number', 'bigint'].includes(typeof value)) {
                result = result && value ? result + ' ' + value : result || value;
            }
            continue;
        }
        return result;
    }
    return get(obj, T_key);
}