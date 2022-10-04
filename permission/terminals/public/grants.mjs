/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module provides the publicly available methods of the Modern Faculty of Users related to managing the assignment of permissions
 */

import muser_common from "muser_common";
import { FacultyPublicJSONRPC } from "../../../../../system/comm/rpc/faculty-public-rpc.mjs";
import { Exception } from "../../../../../system/errors/backend/exception.js";
import PermissionGrantsController from "../../grants/controller.mjs";


export default class PermissionGrantsPublicMethods {

    /**
     * 
     * @param {PermissionGrantsController} controller 
     */
    constructor(controller) {

        this[controller_symbol] = controller
    }

    /**
     * This method is used to grant one or more permissions to a subject
     * @param {object} param0 
     * @param {object} param0.subject
     * @param {('user'|'role')} param0.subject.type
     * @param {string} param0.subject.id
     * @param {[{name: string, freedom: {grant:boolean, use:boolean}, zone: string, expires: number }]} param0.permissions
     * @returns {Promise<void>}
     */
    async grantPermissions({ subject, permissions } = {}) {

        subject = arguments[1].subject
        permissions = arguments[1].permissions

        let user = await muser_common.getUser(arguments[0]);




        let promises = []

        for (let permission of permissions) {
            if (typeof permission?.expires !== 'number' || typeof permission?.freedom !== 'object' || typeof permission?.name !== 'string' || typeof permission?.zone !== 'string') {
                throw new Exception(`Please check the information you entered. Make sure you have filled all the inputs.`)
            }
            await client_can_grant({ client: arguments[0], permission: permission.name, zone: permission.zone, controller: this[controller_symbol] })
        }

        for (let permission of permissions) {


            promises.push(
                new Promise((resolve, reject) => {

                    this[controller_symbol].setPermission({
                        subject: subject.id,
                        subject_type: subject.type,
                        freedom: permission.freedom,
                        permission: permission.name,
                        ...(() => {
                            if (subject.type === 'role') {
                                return
                            }
                            return {
                                zone: permission.zone,
                                expires: permission.expires,
                            }
                        })()
                    }).then(() => resolve()).catch((e) => {
                        console.warn(`Could not assign permission ${permission.name.blue} by user ${user.label.yellow}(${user.id.yellow}) because\n `, e)
                        reject(`Unexpected error when assigning ${permission.name}`)
                    })
                })
            )
        }


        let error_string = undefined;

        await Promise.allSettled(promises).then((results) => {
            for (let result of results) {
                if (result.status === 'rejected') {
                    error_string ||= ''
                    error_string = result.status
                }
            }
        })

        if (error_string) {
            throw new Exception(error_string, {
                code: 'error.system.unplanned',
            })
        }


    }

    /**
     * This method revokes a permission granted
     * @param {object} param0 
     * @param {string} param0.string
     * @param {string} param0.subject
     * @param {string} param0.zone
     * @returns {Promise<void>}
     */
    async revokePermission({ permission, subject, zone }) {

        await client_can_grant(
            {
                client: arguments[0],
                permission: arguments[1]?.permission,
                controller: this[controller_symbol],
                zone: arguments[1]?.zone
            }
        )

        await this[controller_symbol].unsetPermission({
            ...arguments[1]
        })
    }


    /**
     * Gets all permission grants
     */
    async getAll() {
        const userid = (await muser_common.getUser(arguments[0])).id
        return await this[controller_symbol].getPermissions({ userid })
    }

    /**
     * This method updates an already existing permission grant
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.permission
     * @param {import("../../grants/types.js").PermissionGrant} param0.data
     * @returns {Promise<void>}
     */
    async update({ subject, permission, data }) {
        await client_can_grant({ client: arguments[0], permission: arguments[1]?.permission, controller: this[controller_symbol], zone: arguments[1]?.data?.zone })
        return await this[controller_symbol].updatePermission({ ...arguments[1] })
    }


}


/**
 * This method checks if the user has one or more permissions
 * @param {object} param0
 * @param {FacultyPublicJSONRPC} param0.client 
 * @param {string} param0.permission 
 * @param {string} param0.zone
 * @param {PermissionGrantsController} param0.controller
 * @returns {Promise<void>}
 */
const client_can_grant = async ({ client, permission, zone, controller }) => {

    const userid = (await muser_common.getUser(client)).id

    try {
        await controller.hasPermission(
            {
                userid,
                intent: {
                    freedom: 'grant',
                    zone
                },
                flags: {
                    throwError: true
                },
                permission
            }
        )
    } catch (e) {
        if (/you.*do.*not.*permissions/gi.test(e)) {
            throw new Exception(`You don't have the power to issue this permission, so you can neither grant it nor revoke it from someone else.`)
        }
        throw e
    }


}


const controller_symbol = Symbol(`PermissionGrantsPublicMethods.prototype.controller`)
