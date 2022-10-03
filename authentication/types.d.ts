/**
 * Copyright 2022 HolyCorn Software
 * 
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module contains type definitions for the security component of the Faculty
 * 
 */

import { Collection } from 'mongodb'


export declare interface UserAuthToken {
    userid: string,
    token: string,
    lastRefresh: number
}

export type UserAuthTokenCollection = Collection<UserAuthToken>


export type UserLoginInput = {
    [key: string]: object
}


export declare interface PublicTokenData {
    token: string,
    expires: number
}



export declare interface UserLogin {
    id: string,
    userid: string,
    provider: string,
    data: object,
    active: boolean,
    creationTime: number
}


export declare interface SecurityProviderPublicData {
    name: string,
    credentials: object
}


export type UserLoginCollection = Collection<UserLogin>

