/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module allows clients to receive notifications of the faculty, over public rpc
 */

import JSONRPC from "/$/system/static/comm/rpc/json-rpc/json-rpc.mjs";
import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { report_error_direct } from "/$/system/static/errors/error.mjs";


/** @type {ModernuserEventClient} */
let instance
const authSymbol = Symbol()
let skipFirstCall = true;


/**
 * @extends JSONRPC.EventChannel.Client<modernuser.ui.notification.ClientFrontendEvents>
 */
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
        this.events.addEventListener('modernuser-authentication-login-complete', () => {
            console.log(`Login is complete, so the event client will re-initialize`)
            this.forceInit()
        });
    }

    static async get() {
        if (instance) {
            return instance
        }
        await hcRpc.modernuser.notification.events.register()

        return instance = new this(hcRpc.modernuser.$jsonrpc, async () => {
            if (skipFirstCall) { // If we're to skip the first call (because the events.register() has already been called during the get() method.)
                skipFirstCall = false
                return
            }
            await hcRpc.modernuser.notification.events.register()
        }, authSymbol)
    }

}

async function init() {
    (window.libModernuser ||= {}).eventChannel ||= await ModernuserEventClient.get()
    await window.libModernuser.eventChannel.init()
    window.dispatchEvent(
        new CustomEvent('modernuser-event-client-ready')
    )
}

init().catch(e => {
    if (e.accidental) {
        report_error_direct(`Failed to initialize event client `, e)
    }
})
