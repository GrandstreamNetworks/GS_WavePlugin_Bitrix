import { stringify } from "qs";
import request from "@/utils/request";

export function getContact(params: LooseObject) {
    return request(`${params.webhook}/crm.contact.list.json?${stringify(params.filter)}`)
}

export function getLead(params: LooseObject) {
    return request(`${params.webhook}/crm.lead.list.json?${stringify(params.filter)}`)
}

export function putCallInfo(params: LooseObject) {
    return request(`${params.webhook}/crm.activity.add.json?${stringify(params.fields)}`)
}

export function getCompanyInfo(params: LooseObject) {
    return request(`${params.webhook}/crm.company.get.json?${stringify(params.fields)}`)
}