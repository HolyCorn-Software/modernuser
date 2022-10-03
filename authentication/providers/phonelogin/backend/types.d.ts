/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This method contains type definitions for the Google login provider
 */


import { Collection } from 'mongodb'
import { WhatsAppTemplateMap } from './notification/whatsapp/types'


/** The structure of data returned from the toUniqueCredentials() method*/
export declare interface PhoneLoginUniqueData {
    gid: string,
    password: string,
    phone: string
}



export declare interface PhoneLoginPendingLogin {
    phone: string
    password: string
    auth: string
    created: number
    used: boolean
}

export declare interface PhoneLoginPendingReset {
    phone: string,
    password: string,
    auth: string,
    created: number
}


export type PhoneLoginPendingLoginsCollection = Collection<PhoneLoginPendingLogin>


export type PhoneLoginPendingResetsCollection = Collection<PhoneLoginPendingReset>



export declare interface PhoneLoginCredentials {
    name: 'phonelogin',
    whatsapp_api_bearer_auth_token: string
    whatsapp_template_map: WhatsAppTemplateMap
}


