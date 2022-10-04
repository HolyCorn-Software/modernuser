/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * The Modern Faculty of Users
 * 
 * This module provides remote methods to users on the public web
 * 
 * We expect that the parent module would have defined the permissions 
 *  modernuser.zonation.admin
 * 
 */

import muser_common from "muser_common";
import { FacultyPublicJSONRPC } from "../../../../system/comm/rpc/faculty-public-rpc.mjs";
import { FacultyPlatform } from "../../../../system/lib/libFaculty/platform.mjs";
import ZonationDataController from "../data/controller.mjs";
import ZoneMembershipController from "../membership/controller.mjs";

const faculty = FacultyPlatform.get();


export default class ZonationPublicMethods {

    /**
     * 
     * @param {ZonationDataController} data_controller 
     * @param {ZoneMembershipController} membership_controller
     */
    constructor(data_controller, membership_controller) {
        this[data_controller_symbol] = data_controller
        this[membership_controller_symbol] = membership_controller


    }

    /**
     * Fetches all the zones in the entire system
     * @returns {Promise<[import("../data/types.js").ZoneData]>}
     */
    async getZones() {
        return await this[data_controller_symbol].getAllZones()
    }


    /**
     * Changes the label of a zone
     * @param {string} id
     * @param {string} newlabel
     * @returns {Promise<void>}
     */
    async renameZone(id, newlabel) {

        await clientPermitted(arguments[0])

        id = arguments[1]
        newlabel = arguments[2]

        return await this[data_controller_symbol].renameZone(id, newlabel)
    }

    /**
     * This method is used to move a zone from one zone to another zone. NB zones can contain zones
     * @param {string} id The zone to be moved
     * @param {string} superzone The id of the zone to contain it
     * @returns {Promise<void>}
     */
    async moveZone(id, superzone) {

        await clientPermitted(arguments[0])
        id = arguments[1]
        superzone = arguments[2]

        return await this[data_controller_symbol].moveZone(id, superzone)
    }


    /**
     * This method is used to delete a zone and all the zones beneath it
     * @param {string} id The zone to be deleted
     * @returns {Promise<void>}
     */
    async deleteZone(id) {

        await clientPermitted(arguments[0])
        id = arguments[1]

        return await this[data_controller_symbol].deleteZone(id)
    }

    /**
     * This method is used to create a new zone
     * @param {object} param0
     * @param {string} param0.label The label of the new zone after this
     * @param {string} param0.superzone
     * @returns {Promise<string>}
     */
    async createZone({ label, superzone }) {

        await clientPermitted(arguments[0])
        label = arguments[1].label
        superzone = arguments[1].superzone

        return await this[data_controller_symbol].createZone({ label, superzone })
    }

}


/**
 * This checks if the client has the most important permission of this module: modernuser.zonation.modify
 * @param {FacultyPublicJSONRPC} client 
 * @returns {Promise<void>}
 */
async function clientPermitted(client) {
    const userid = (await muser_common.getUser(client)).id;

    await muser_common.whitelisted_permission_check(
        {
            userid,
            permissions: ['permissions.modernuser.zonation.admin'],
            intent: {
                freedom: 'use',
                zones: undefined
            },
            throwError: true,
        }
    );
}



const data_controller_symbol = Symbol(`ZonationPublicMethods.prototype.data_controller`)
const membership_controller_symbol = Symbol(`ZonationPublicMethods.prototype.membership_controller`)