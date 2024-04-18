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

export function createContact(params: LooseObject) {
    return request(`${params.webhook}/crm.contact.add.json?${stringify(params.fields)}`)
}

export function createLead(params: LooseObject) {
    return request(`${params.webhook}/crm.lead.add.json?${stringify(params.fields)}`)
}

export function getContactById(params: LooseObject) {
    return request(`${params.webhook}/crm.contact.get.json?${stringify(params.id)}`)
}

export function getLeadById(params: LooseObject) {
    return request(`${params.webhook}/crm.lead.get.json?${stringify(params.id)}`)
}