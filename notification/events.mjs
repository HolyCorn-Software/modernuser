/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This controller deals with direct dispatch of events to clients
 */

import muser_common from "muser_common"



/**
 * @extends JSONRPC.EventChannel.Server<undefined>
 */
export default class ModernuserEventsServer extends JSONRPC.EventChannel.Server {

    constructor() {
        super()
    }

    /**
     * 
     * @type {import("./types").EventServer['register']}
     */
    async register({ data, client }) {
        return [
            (await muser_common.getUser(client)).id
        ]
    }


}