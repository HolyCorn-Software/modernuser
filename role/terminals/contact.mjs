/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains public methods related to rolecontact
 */

import muser_common from "muser_common";
import UserProfileController from "../../profile/controller.mjs";
import RoleContactController from "../contact/controller.mjs";


export default class RoleContactPublicMethods {

    /**
     * 
     * @param {RoleContactController} controller 
     * @param {UserProfileController} profile_controller
     */
    constructor(controller, profile_controller) {
        this[rolecontact_controller_symbol] = controller
        this[profile_controller_symbol] = profile_controller
    }

    /**
     * This returns all the information about the contacts in the system
     * @returns {Promise<[import("../contact/types.js").RoleContact]>}
     */
    async fetchAll() {
        return await this[rolecontact_controller_symbol].getAll()
    }

    /**
     * Gets all the contacts of a role within a zone
     * @param {object} param0 
     * @param {string} param0.role
     * @param {string} param0.zone
     * @param {string} param0.specific_user If specified, only the named user's info will be fetched
     * @returns {Promise<[{profile:import("faculty/modernuser/profile/types.js").UserProfileData, zone: string}]>}
     */
    async getUsersInfoFormatted({ role, zone, specific_user }) {
        //TODO: Check permissions of the user
        let role_contact_data = await this[rolecontact_controller_symbol].getUsers({ ...arguments[1], userid: (await muser_common.getUser(arguments[0])).id })

        let promises = role_contact_data.map(async rp => {
            return {
                profile: await this[profile_controller_symbol].getProfile({ id: rp.userid }),
                zone: rp.zone
            }
        })
        let combined = await Promise.allSettled(promises)

        return combined.filter(cmb => {
            if (cmb.status === 'rejected') {
                console.warn(`Failed to get user data for a roleplay `, cmb.reason)
                return false;
            }
            return true
        }).map(x => x.value)

    }

    /**
     * This method is used to add a role to a user.
     * 
     * The role is mindful of zonation limits
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.role
     * @param {string} param0.zone
     * @returns {Promise<void>}
     */
    async addContact({ subject, role, zone }) {
        return await this[rolecontact_controller_symbol].addContact({ ...arguments[1], userid: (await muser_common.getUser(arguments[0])).id })
    }

    /**
     * This method removes a contact from a role in a zone
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.role
     * @param {string} param0.zone
     */
    async removeContact({ subject, role, zone }) {
        //TODO: Check permissions
        await this[rolecontact_controller_symbol].removeContact({ ...arguments[1], userid: (await muser_common.getUser(arguments[0])).id })
    }

}



const rolecontact_controller_symbol = Symbol(`RolePlayPublicMethods.prototype.roleplay_controller`)
const profile_controller_symbol = Symbol(`RolePlayPublicMethods.prototype.profile_controller`)