/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module contains functions that have been made publicly available. 
 * 
 * This functions are strictly related to role_data
 */
import muser_common from "muser_common";
import RoleDataController from "../data/controller.mjs";



export default class RoleDataPublicMethods {

    /**
     * 
     * @param {RoleDataController} role_data_controller 
     */
    constructor(role_data_controller) {


        /** @type {RoleDataController} */
        this[data_controller_symbol] = role_data_controller
    }


    /**
     * This method returns all the roles in the system
     * @returns {Promise<modernuser.role.data.Role[]>}
     */
    async getAll() {
        return await this[data_controller_symbol].getAll()
    }

    /**
     * This method fetches the roles that match the given filter
     * @param {string} filter 
     * @returns {Promise<modernuser.role.data.Role[]>}
     */
    async fetchRoles(filter) {
        return await this[data_controller_symbol].fetchRoles(arguments[1])
    }

    /**
     * This method creates a new role
     * @param {Omit<modernuser.role.data.Role, "id"|"super_roles"|"supervised_roles"|"time"|"owners">} data
     * @returns {Promise<string>}
     */
    async create(data) {
        const userid = (await muser_common.getUser(arguments[0])).id
        return await this[data_controller_symbol].createRole({ ...arguments[1], userid, owners: [userid] })
    }

    /**
     * This method deletes a role
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<void>}
     */
    async delete({ id }) {
        return await this[data_controller_symbol].deleteRole({ id: arguments[1].id, userid: (await muser_common.getUser(arguments[0])).id })
    }

    /**
     * This method updates the details about a role
     * @param {object} param0 
     * @param {string} param0.id
     * @param {modernuser.role.data.Role} param0.data
     * @returns {Promise<void>}
     */
    async update({ id, data }) {
        return await this[data_controller_symbol].updateRole({ ...arguments[1], userid: (await muser_common.getUser(arguments[0])).id })
    }

}

const data_controller_symbol = Symbol(`UserGroupPublicMethods.prototype.controller`)

