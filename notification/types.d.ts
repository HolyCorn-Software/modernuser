/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module contains type definitions for the notification module in the faculty
 */

import { Collection } from "mongodb"



export declare interface MessageData {

    content: string,
    subject: string

}

export declare interface UserContact {
    provider: string,
    data: object,
    userid: string,
    id: string
}

export declare interface ContactData {
    provider: string,
    data: object
}


export type UserContactsCollection = Collection<UserContact>



export type NotificationProviderCredentialsCollection = Collection<{ name: string }>


export declare interface TextMessageData {
    message: MessageData,
    userid: string,
    provider: string
}