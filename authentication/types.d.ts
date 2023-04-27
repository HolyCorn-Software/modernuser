/**
 * Copyright 2022 HolyCorn Software
 * 
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module contains type definitions for the security component of the Faculty
 * 
 */

import { Collection } from 'mongodb'

import _AuthenticationPlugin from './plugin/model.mjs'




/**
 * @deprecated use modernuser.authentication.UserAuthToken
 */
export declare interface UserAuthToken extends modernuser.authentication.UserAuthToken { }



/**
 * @deprecated use  modernuser.authentication.UserLogin
 */
export declare interface UserLogin extends modernuser.authentication.UserLogin { }


/**
 * @deprecated use modernuser.authentication.AuthPluginPublicData instead
 */
export declare interface AuthPluginPublicData extends modernuser.authentication.AuthPluginPublicData { }


/**
 * @deprecated use modernuser.authentication.UserLoginCollection
 */
export type UserLoginCollection = modernuser.authentication.UserLoginCollection





global {
    class AuthenticationPlugin<CredentialsType, ClientDataSchema, ClientUniqueDataSchema> extends _AuthenticationPlugin<CredentialsType, ClientDataSchema, ClientUniqueDataSchema> { }

    namespace modernuser.authentication {
        type AuthAction = ("login" | "signup" | "reset")
        /**
         * Plugins extend this interface to provide smooth auto-complete for their methods
         */
        interface PluginMethods {

        }
        interface UserAuthToken {
            userid: string,
            token: string,
            lastRefresh: number
        }
        type UserAuthTokenCollection = Collection<UserAuthToken>

        declare interface PublicTokenData {
            token: string,
            expires: number
        }

        interface UserLogin {
            id: string,
            userid: string,
            plugin: string,
            data: object,
            active: boolean,
            creationTime: number
        }
        type UserLoginCollection = Collection<UserLogin>

        interface AuthPluginPublicData {
            name: string,
            credentials: object
        }


    }

}
