/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * The Modern Faculty of Users
 * 
 * This module provides remote methods to other faculties that they can use to manipulate zonation information
 */

import ZonationDataController from "../data/controller.mjs";
import ZoneMembershipController from "../membership/controller.mjs";


const data_controller_symbol = Symbol()
const membership_controller_symbol = Symbol()


export default class ZonationInternalMethods {

    /**
     * 
     * @param {ZonationDataController} data_controller 
     * @param {ZoneMembershipController} membership_controller
     */
    constructor(data_controller, membership_controller) {
        this[data_controller_symbol] = data_controller
        this[membership_controller_symbol] = membership_controller
    }
    async getZones() {
        return await this[data_controller_symbol].getAllZones()
    }
    /**
     * This method retrieves information about a single zone
     * @param {string} id 
     * @returns {Promise<import("../data/types.js").ZoneData>}
     */
    async getZone(id) {
        return await this[data_controller_symbol].getZone(arguments[1])
    }

    /**
     * This method is used to get all zones beneath a given zone
     * @param {string} id 
     * @returns {Promise<[import("../data/types.js").ZoneData]>}
     */
    async getChildZones(id) {
        return await this[data_controller_symbol].getChildZones(arguments[1])
    }

    /**
     * This method is used to get all child zones, then add information about the subject zone
     * @param {string} id 
     * @returns {Promise<[import("../data/types.js").ZoneData]>}
     */
    async getChildZonesPlus(id) {
        return (
            await Promise.all(
                [
                    this[data_controller_symbol].getZone(arguments[1]),
                    this.getChildZones(arguments[0], arguments[1])
                ]
            )
        ).flat()


    }

}