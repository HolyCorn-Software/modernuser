/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains functions that have been made available to other faculties. 
 */



import RoleController from "../controller.mjs";


const controller_symbol = Symbol()

export default class UserRoleInternalMethods {

    /**
     * 
     * @param {RoleController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller
    }


    /**
     * This method returns a list of all the roles played by the user
     * @param {string} userid 
     * @returns {Promise<[{data:import("../data/types.js").RoleData, play: Omit<import("../membership/types.js").RolePlay, "userid">}]>}
     */
    async getUserRoles(userid) {
        const roles = await this[controller_symbol].roleplay.getUserRoles(arguments[1])

        /** @type {[import("../data/types.js").RoleData]} */
        let data_storage = [];

        /**
         * @returns {Promise<[import("../data/types.js").RoleData]>}
         */
        const get_role = async (id) => {

            const actually_get = async () => {
                const new_role = await this[controller_symbol].data.getRole(id)
                data_storage.push(new_role)
                return new_role
            }

            data_storage.find(x => x.id === id) || await actually_get()
        }

        const promises = roles.map(
            async role => {
                let { role: id, ...rest } = role
                return {
                    play: {
                        ...rest
                    },
                    data: await get_role(id)
                }
            }
        );
        return await Promise.all(promises)
    }

}