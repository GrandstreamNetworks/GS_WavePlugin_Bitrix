import request from '../utils/request';

/**
 * 获取联系人列表
 * @returns
 */
export function getUser(params: any) {
    return request(`${params.webhook}/user.current.json`);
}
