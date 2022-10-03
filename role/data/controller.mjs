/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * The role module simply keeps track of the roles that users can play
 */

import { Collection } from "mongodb"
import shortUUID from "short-uuid";
import util, { checkArgs } from "../../../../system/util/util.js";
import { Exception } from "../../../../system/errors/backend/exception.js"
import commonlogic from "../../public/common/role/logic.mjs";
import EventEmitter from 'node:events'
import { FacultyPlatform } from "../../../../system/lib/libFaculty/platform.mjs";


const permission_grants_controller_symbol = Symbol()

const faculty = FacultyPlatform.get()

export default class RoleDataController {

    /**
     * 
     * @param {object} param0
     * @param {import("./types.js").RoleDataCollection} param0.collection
     * @param {import("faculty/modernuser/permission/grants/controller.mjs").default} param0.permission_grants_controller
     */
    constructor({ collection, permission_grants_controller }) {
        if (!collection instanceof Collection) {
            throw new Exception(`Please pass a MongoDB collection for the parameter called 'collection'`, {
                code: 'error.input.validation'
            })
        }
        /** @type {import("./types.js").RoleDataCollection} */
        this[collection_symbol] = collection;

        this[permission_grants_controller_symbol] = permission_grants_controller

        RoleDataController.prepareCollection(collection)
    }

    /**
     * This method creates a role
     * @param {object} param0 
     * @param {string} param0.label The human-friendly name of the role
     * @param {string} param0.description The description of the role
     * @param {[string]} param0.owners
     * @param {string} param0.userid
     * @returns {Promise<string>} Returns the id of the role
     */
    async createRole({ label, description, owners, userid }) {

        if (userid) {


            await this[permission_grants_controller_symbol].userPermitted(
                {
                    userid,
                    permissions: ['permissions.modernuser.role.create'],
                    intent: { freedom: 'use' },
                }
            )

        }
        const id = shortUUID.generate();

        checkArgs(arguments[0], { label: 'string', description: 'string' }, 'input')

        await this[collection_symbol].insertOne({
            id: id,
            label,
            description,
            owners: [...owners],
            time: Date.now()
        });

        return id;
    }

    /**
     * Deletes a role
     * @param {object} param0
     * @param {string} param0.id id of role
     * @param {string} param0.userid The id of the user performing the action, used for security checks
     * @returns {Promise<void>}
     */
    async deleteRole({ id, userid }) {

        await this.rolePermissionCheck({ userid, role: id })


        //Find all roles that have the given id in their array of super_roles and remove it from the array.
        await this[collection_symbol].updateMany(
            {
                super_roles: {
                    $elemMatch: { $eq: id }
                }
            },
            {
                $pull: { super_roles: id }
            }
        );

        faculty.events.emit(`${faculty.descriptor.name}.role-delete`, id)


        await this[collection_symbol].deleteOne({
            id
        })
    }

    /**
     * This method modifies the label on a role
     * @param {object} param0
     * @param {string} param0.id id of role
     * @param {string} param0.label New label of role 
     * @param {string} param0.userid The userid of the user making this action
     * @returns {Promise<void>}
     */
    async renameRole({ id, label, userid }) {

        await this.rolePermissionCheck({ userid, role: id })

        let results = await this[collection_symbol].updateOne({ id }, {
            $set: {
                label
            }
        });
        if (results.modifiedCount === 0) {
            throw new Exception(`Could not rename role because it was not found`, {
                code: 'error.system.unplanned'
            })
        }
    }

    /**
     * This method updates specific data about a role. Either it's super_roles, label or description
     * @param {object} param0 
     * @param {string} param0.id
     * @param {import("./types.js").RoleData} param0.data
     * @param {userid} param0.userid If specified, the action of updating the role will be checked, with respect to the user's permissions
     * @returns  {Promise<void>}
     */
    async updateRole({ id, data, userid }) {

        //First things first, security checks
        await this.rolePermissionCheck({ userid, role: id })


        data = util.pickOnlyDefined(data, ['label', 'description', 'owners', 'super_roles', 'supervised_roles'])

        data.id = id;



        if (data.super_roles?.length > 0) { //If the user is updating super_roles, let's make sure there's no cyclic inheritance
            const all_roles = await this.getAll()
            const this_index = all_roles.findIndex(role => role.id === id)
            Object.assign(all_roles[this_index], data);
            commonlogic.check_cyclic_role_inheritance(all_roles)
        }

        await this[collection_symbol].updateOne({ id }, { $set: data })
    }

    /**
     * This method returns all roles
     * @returns {Promise<[import("./types.js").RoleData]>}
     */
    async getAll() {
        return [...await this[collection_symbol].find({}).toArray()]
    }

    /**
     * This method fetches all the roles that have the given text in it's description or label
     * @param {string} filter 
     * @returns {Promise<[import("./types.js").RoleData]>}
     */
    async fetchRoles(filter = '') {


        if (filter.length < 2) {
            return [];
        }

        const parts = filter.split(/[^A-Za-z0-9 ]/);


        let roles = await this[collection_symbol].find({
            label: {
                $regex: new RegExp(parts.join('.*'), 'i')
            },

        }).toArray();

        return roles;
    }

    /**
     * This method get's info of a single role
     * @param {string} id 
     * @returns {Promise<import("./types.js").RoleData>}
     */
    async getRole(id) {
        return await this[collection_symbol].findOne({ id })
    }



    /**
     * This method is used to check if the user is the owner of the role, or has the power to modify it
     * @param {object} param0 
     * @param {string} param0.role
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async rolePermissionCheck({ userid, role }) {
        if (userid) {

            //Only two questions?
            //Did the user create the role? Or does he have the power to manage other's roles

            const data = await this[collection_symbol].findOne({ id: role })
            if (!data) {
                throw new Exception(`The role you're trying to deal with, doesn't exist.`)
            }

            await this[permission_grants_controller_symbol].whitelistedPermissionCheck(
                {
                    userid,
                    whitelist: data.owners,
                    intent: {
                        freedom: 'use',
                    },
                    permissions: ['permissions.modernuser.role.supervise']
                }
            )

        }
    }


    /**
     * Some operations done on a collection prior to use
     * @param {import("./types.js").RoleDataCollection} collection
     */
    static prepareCollection(collection) {
        collection.createIndex({ id: 1 }, { unique: true }).catch(e => {
            console.warn(`Failed to perform necessary operation on a collection meant to store role info `, e)
        });

        collection.createIndex({ label: "text", description: "text" }).catch(e => {
            console.warn(`Failed to perform necessary operation on a collection meant to store role info `, e)
        });


    }

}


const collection_symbol = Symbol(`RoleDataController.prototype.collection`)


/**
 * @type {[import("faculty/modernuser/permission/data/types.js").PermissionData]}
 */
export const permissions = [
    {
        label: `Create roles`,
        name: 'permissions.modernuser.role.create',
        inherit: ['permissions.modernuser.profiles.search']
    },
    {
        label: `Manage roles created by others`,
        name: 'permissions.modernuser.role.supervise',
        inherit: ['permissions.modernuser.profiles.search']
    }
]
