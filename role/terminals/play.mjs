/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains public methods related to roleplay
 */

import PermissionGrantsController from "../../permission/grants/controller.mjs";
import muser_common from "../../../../common/modules/modernuser.mjs";
import UserProfileController from "../../profile/controller.mjs";
import RolePlayController from "../membership/controller.mjs";

const permission_grants_controller_symbol = Symbol()

export default class RolePlayPublicMethods {

    /**
     * 
     * @param {RolePlayController} controller 
     * @param {UserProfileController} profile_controller
     * @param {PermissionGrantsController} permission_grants_controller
     */
    constructor(controller, profile_controller, permission_grants_controller) {
        this[roleplay_controller_symbol] = controller
        this[profile_controller_symbol] = profile_controller
        this[permission_grants_controller_symbol] = permission_grants_controller
    }

    /**
     * This returns all the information about roleplay in the system
     * @returns {Promise<[import("../membership/types.js").RolePlay]>}
     */
    async fetchAll() {
        await this[permission_grants_controller_symbol].userPermitted(
            {
                userid: (await muser_common.getUser(arguments[0])).id,
                permissions: ['permissions.modernuser.role.play.view'],
                intent: {
                    freedom: 'use'
                }
            }
        )
        return await this[roleplay_controller_symbol].getAll()
    }

    /**
     * Gets all the users of a role
     * @param {object} param0 
     * @param {string} param0.role
     * @param {string} param0.zone
     * @param {string} param0.specific_user If specified, only the named user's info will be fetched
     * @returns {Promise<[{profile:import("faculty/modernuser/profile/types.js").UserProfileData, zone: string}]>}
     */
    async getUsersInfoFormatted({ role, zone, specific_user }) {
        await this[permission_grants_controller_symbol].userPermitted(
            {
                userid: (await muser_common.getUser(arguments[0])).id,
                permissions: ['permissions.modernuser.role.play.view'],
                intent: {
                    freedom: 'use'
                }
            }
        );

        let role_play_data = await this[roleplay_controller_symbol].getUsers({ ...arguments[1] })

        let promises = role_play_data.map(async rp => {
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
    async addRoleToUser({ subject, role, zone }) {
        return await this[roleplay_controller_symbol].addRoleToUser({ ...arguments[1], userid: (await muser_common.getUser(arguments[0])).id })
    }

    /**
     * This method removes a user from a role in a zone
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.role
     * @param {string} param0.zone
     */
    async removeRoleFromUser({ subject, role, zone }) {
        await this[roleplay_controller_symbol].removeRoleFromUser({ ...arguments[1], userid: (await muser_common.getUser(arguments[0])).id })
    }

}



const roleplay_controller_symbol = Symbol(`RolePlayPublicMethods.prototype.roleplay_controller`)
const profile_controller_symbol = Symbol(`RolePlayPublicMethods.prototype.profile_controller`)