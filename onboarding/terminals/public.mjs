/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module provides the general public with features within the scope of the onboarding process
 */

import muser_common from "../../../../common/modules/modernuser.mjs"
import OnboardingController from "../controller.mjs"



const controller_symbol = Symbol()

export default class OnboardingPublicMethods {

    /**
     * 
     * @param {OnboardingController} controller 
     */
    constructor(controller) {
        this[controller_symbol] = controller
    }

    /**
     * This method is used to onboard new users unto the platform.
     * The onboarding set's the client's profile name, picture, as well as notification settings
     * @param {import("faculty/modernuser/onboarding/types.js").OnboardingInputData} data 
     * @returns {Promise<void>}
     */
    async onboard(data) {
        return await this[controller_symbol].onboard({ data: arguments[1], userid: (await muser_common.getUser(arguments[0])).id })
    }

    /**
     * This method is used to get a single onboarding request
     * @param {string} param0.id 
     * @returns {Promise<import("faculty/modernuser/onboarding/types.js").AdminOnboardingData>}
     */
    async getRequest({ id }) {
        id = arguments[1]?.id
        return await this[controller_symbol].getSimplifiedRequest({ id, userid: (await muser_common.getUser(arguments[0])).id })
    }

    /**
     * This method adds a role to a request
     * @param {object} param0 
     * @param {string} param0.id The request to be modified
     * @param {object} param0.role
     * @param {string} param0.role.role
     * @param {string} param0.role.zone
     * @returns {Promise<void>}
     */
     async addRoleToRequest({ id, role }) {

        
        await this[controller_symbol].addRoleToRequest(
            {
                id: arguments[1]?.id,
                role: arguments[1]?.role,
                userid: (await muser_common.getUser(arguments[0])).id
            }
        )
    }
    /**
     * This method removes a role from a request
     * @param {object} param0 
     * @param {string} param0.id The request to be modified
     * @param {object} param0.role
     * @param {string} param0.role.role
     * @param {string} param0.role.zone
     * @returns {Promise<void>}
     */
    async removeRoleFromRequest({ id, role }) {

        
        await this[controller_symbol].removeRoleFromRequest(
            {
                id: arguments[1]?.id,
                role: arguments[1]?.role,
                userid: (await muser_common.getUser(arguments[0])).id
            }
        )
    }


}