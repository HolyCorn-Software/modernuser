/**
 * Copyright 2023 HolyCorn Software
 * The Modern Faculty of Users
 * This module (rolegroup), provides a special functionality whereby
 * roles belong to a given group, such that users belong to groups by 
 * assuming roles
 */

import shortUUID from "short-uuid";
import RolePlayController from "../role/membership/controller.mjs";
import ZonationDataController from "../zonation/data/controller.mjs";
import muser_common from "muser_common";


const collection = Symbol();
const controllers = Symbol()



export default class RoleGroupController {

    /**
     * 
     * @param {modernuser.rolegroup.RoleGroupCollection} _collection 
     * @param {object} _controllers
     * @param {RolePlayController} _controllers.roleplay
     * @param {ZonationDataController} _controllers.zonation
     */
    constructor(_collection, _controllers) {
        this[collection] = _collection
        this[controllers] = _controllers
    }

    /**
     * This method is used to create a rolegroup
     * @param {modernuser.rolegroup.RoleGroupInit & {userid: string}} data 
     * @returns {Promise<string>}
     */
    async create(data) {

        if (data.userid) {
            await muser_common.whitelisted_permission_check(
                {
                    userid: data.userid,
                    permissions: ['permissions.modernuser.rolegroup.supervise'],
                    intent: {
                        freedom: 'use',
                    },
                }
            )
        }

        const id = shortUUID.generate()

        this[collection].insertOne(
            {
                ...data,
                id,
                time: Date.now(),
            }
        );

        return id
    }

    /**
     * This method updates information about a rolegroup
     * @param {modernuser.rolegroup.RoleGroupData} data 
     * @returns {Promise<void>}
     */
    async update(data) {
        return await this[collection].updateOne(
            {
                id: data.id,
                ...data
            }
        );
    }

    /**
     * This method deletes a set of rolegroups
     * @param {object} param0 
     * @param {string[]} param0.ids
     * @returns {Promise<void>}
     */
    async delete({ ids }) {
        await this[collection].updateMany(
            {
                rolegroups: {
                    $in: ids
                }
            },
            {
                $pull: {
                    id: {
                        $in: ids
                    }
                }
            }
        );

        await this[collection].deleteMany(
            {
                id: { $in: ids }
            }
        )
    }

    /**
     * This method gets the members of a set of rolegroups
     * @param {object} param0
     * @param {string} param0.ids 
     * @param {string[]} param0.zones
     * @returns {AsyncGenerator<string, never, unknown>}
     */
    async* getMembers({ ids, zones }) {
        const roleplay = await this[controllers].roleplay.getMembers(
            {
                roles: await this.getAssociated({ ids }),
                zones: await this[controllers].zonation.getChildZones(zones),
            }
        );
        for await (const item of roleplay) {
            yield item.userid
        }
    }

    /**
     * This method returns the number of members of a given set of rolegroups
     * @param {object} param0 
     * @param {string[]} param0.ids
     * @param {string[]} param0.zones
     * @returns {Promise<number>}
     */
    async countMembers({ ids, zones }) {
        return await this[controllers].roleplay.countMembers(
            {
                roles: await this.getAssociated({ ids }),
                zones: await this[controllers].zonation.getChildZones(zones),
            }
        );
    }

    /**
     * This method returns all the rolegroups associated to a given set of rolegroups
     * @param {object} param0
     * @param {string[]} param0.ids 
     * @returns {Promise<string[]>}
     */
    async getAssociated({ ids }) {
        const data = await this[collection].find({ id: { $in: ids } }).toArray()
        return [
            ids,
            ...(data.map(x => x.rolegroups || []))
        ]
    }
    /**
     * This method gets full information about a rolegroup
     * @param {object} param0 
     * @param {string} param0.id
     * @returns {Promise<modernuser.rolegroup.RoleGroupData>}
     */
    async getRolegroup({ id }) {
        const data = await this[collection].findOne({ id })
        if (!data) {
            throw new Error(`Sorry, the role group '${id}' was not found.`)
        }
        return data
    }

    /**
     * This method retrieve all the rolegroups
     */
    async getAll() {
        return await this[collection].find({}).toArray()
    }

}


/**
 * @type {modernuser.permission.PermissionDataInput[]}
 */
export const PERMISSIONS = [
    {
        label: `Manage role groups`,
        name: 'permissions.modernuser.rolegroup.supervise',
        inherit: [
            'permissions.modernuser.role.supervise'
        ],
    }
]