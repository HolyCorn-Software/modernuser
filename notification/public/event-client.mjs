/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module allows clients to receive notifications of the faculty, over public rpc
 */

import JSONRPC from "/$/system/static/comm/rpc/json-rpc/json-rpc.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";


let registrationComplete
const authSymbol = Symbol()

export default class ModernuserEventClient extends JSONRPC.EventChannel.Client {

    /**
     * @deprecated Don't directly instantiate. Use 
     * ```js
     *  ModernuserEventClient.get()
     * ```
     * @param {undefined} param0
     */
    constructor(jsonrpc, init, symbol) {
        if (symbol !== authSymbol) {
            throw new Error(`Use the ModernuserEventClient.new() method`)
        }
        super(jsonrpc, init)
    }

    static async get() {
        if (!registrationComplete) {
            await hcRpc.modernuser.notification.events.register()
        }
        registrationComplete = true
        return new this(hcRpc.modernuser.$jsonrpc, hcRpc.modernuser.notification.events.register, authSymbol)
    }

}