/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * This module is interested in which user belongs to which role
 * 
 */

import PermissionGrantsController from "../../permission/grants/controller.mjs";
import ZonationDataController from "../../zonation/data/controller.mjs";
import RoleDataController from "../data/controller.mjs";


const permission_grants_controller_symbol = Symbol()
const zonation_data_controller_symbol = Symbol()
const role_data_controller_symbol = Symbol()

export default class RolePlayController {

    /**
     * 
     * @param {object} param0 
     * @param {import("./types.js").RolePlayCollection} param0.collection
     * @param {PermissionGrantsController} param0.permission_grants_controller
     * @param {ZonationDataController} param0.zonation_data_controller
     * @param {RoleDataController} param0.role_data_controller
     */
    constructor({ collection, permission_grants_controller, zonation_data_controller, role_data_controller }) {

        RolePlayController.prepareCollections(collection);
        /**  @type {import("./types.js").RolePlayCollection} */
        this.collection = collection
        this[permission_grants_controller_symbol] = permission_grants_controller
        this[zonation_data_controller_symbol] = zonation_data_controller
        this[role_data_controller_symbol] = role_data_controller
    }

    /**
     * This method gets all the roles the user plays
     * @param {string} userid The id of the user
     * @returns {Promise<import("./types.js").RolePlay[]>}
     */
    async getUserRoles(userid) {
        return await this.collection.find({ userid }).toArray()
    }

    /**
     * This method gets all roleplay information
     * @returns {Promise<import('./types.js').RolePlay[]>}
     */
    async getAll() {
        return await this.collection.find({}).toArray()
    }

    /**
     * This gets all the users who play a role
     * @param {object} param0 
     * @param {string} param0.role
     * @param {string} param0.zone
     * @param {string} param0.specific_user If specified, only the user's info will be fetched
     * @returns {Promise<import("./types.js").RolePlay[]>}
     */
    async getUsers({ role, zone, specific_user }) {
        const query = {
            role
        }
        if (zone) {
            query.zone = zone
        }
        if (specific_user) {
            query.userid = specific_user
        }

        return await this.collection.find(query).toArray()
    }

    /**
     * This methods adds a role to a user
     * The user making this change is specified by the user id
     * The subject of the change is specified by 'subject'. It could be a user or a role
     * @param {object} param0 
     * @param {object} param0.subject
     * @param {string} param0.role
     * @param {string} param0.zone
     * @param {string} param0.userid
     * @returns {Promise<void>}
     */
    async addRoleToUser({ subject, role, zone, userid, }) {
        soulUtils.checkArgs(arguments[0], {
            subject: 'string',
            role: 'string',
            zone: 'string'
        })
        const role_data = await this[role_data_controller_symbol].getRole(role)

        if (!role_data) {
            throw new Exception(`The role you want to grant doesn't exist.`)
        }

        if (userid) {
            if (!await this.userCanGrantRole({ userid, role, zone })) {
                throw new Exception(`Sorry, you cannot give what you don't have. You don't have the power to grant the role of ${role_data.label}.`)
            }
        }

        const data = { userid: subject, role, zone }
        await this.collection.updateOne(data, { $set: { ...data } }, { upsert: true })
    }

    /**
     * This method is used to check if a given user can grant a given role
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.role
     * @param {string} param0.zone
     * @returns {Promise<boolean>}
     */
    async userCanGrantRole({ userid, role, zone }) {


        //Two(2) criteria to determine if a user can grant a role

        // 1) He has the permission to grant any role
        if (
            await this[permission_grants_controller_symbol].userPermitted(
                {
                    userid,
                    permissions: ['permissions.modernuser.role.play.grant_all'],
                    intent: {
                        freedom: 'use',
                        zones: [zone]
                    },
                    flags: {
                        throwError: false
                    }
                }
            )
        ) {
            return true
        }


        // 2) He has a role that supervises the subject role

        //To effect that, we get all the roles he plays
        const users_roles = await this.getUserRoles(userid)

        //Then we filter the ones that are relevant to us

        //We do this by first figuring out which zones are applicable
        const all_zonation_data = await this[zonation_data_controller_symbol].getAllZones()
        const subject_zone_data = all_zonation_data.find(x => x.id === zone)
        if (!subject_zone_data) {
            console.trace(`Zone ${zone} not found.`)
            throw new Exception(`The zone was not found! Ouch`)
        }
        /** @type {import("faculty/modernuser/zonation/data/types.js").ZoneData[]} */
        const allowed_zones = [subject_zone_data, ...await this[zonation_data_controller_symbol].getChildZones(zone)]

        const role_data = await this[role_data_controller_symbol].getAll()
        if (!role_data.find(x => x.id === role)) {
            throw new Exception(`The role${x ? ` with id: ${role}` : ''} was not found`)
        }

        /**
         * This method Checks if a zone is somehow the parent of another
         * @param {string} parent 
         * @param {string} child 
         * @returns {boolean}
         */
        const zone_is_parent = (parent, child) => {
            let current_zone = child;
            if (parent === '0') {
                return true;
            }
            const get_zone = (x) => all_zonation_data.find(z => z.id === x)
            while (current_zone !== '0') {
                if (current_zone === parent) {
                    return true;
                }
                current_zone = get_zone(current_zone).superzone;
            }
        }

        //That is get data for the roles played by the user, including only the roles he plays within the allowed zones
        const users_roles_data = users_roles.filter(x => {
            if (allowed_zones.findIndex(az => az.id === x.zone) !== -1) { //Either a role is played directly in the allowed zone,
                return true;
            }

            // Or it is played in a zone containing the allowed zones
            return allowed_zones.some(allowed => zone_is_parent(x.zone, allowed.id))

        }).map(entry => role_data.find(r => r.id === entry.role))

        //Now, check if there's a role that supervises the named role

        /**
         * Checks if a single role supervises the role in question
         * @param {modernuser.role.data.Role} a_role 
         * @returns {boolean}
         */
        const check = (a_role) => {
            const can_sup = ([...(a_role.supervised_roles || [])]).find(sup => sup === role)
            if (can_sup) {//So, if the role can supervise the subject role
                return true //Then everything is great
            } else {
                //If not, then check the roles it inherits and see if one of them can supervise it
                for (const inheritance of (a_role.super_roles || [])) {
                    const full_inheritance = role_data.find(x => x.id === inheritance)
                    if (!full_inheritance) {
                        console.warn(`Unfortunately, there's no role with id ${inheritance}. Yet, in the database, it is made to supervise another role.`)
                        continue
                    }
                    if (check(full_inheritance)) { //So if there's just one of it's inherited roles that's capable of supervising the subject, then all is cool
                        return true;
                    }
                }
            }

        }

        for (const role of users_roles_data) {
            if (check(role)) {
                return true;
            }
        }


        return false;



    }



    /**
     * This method removes a role from a user
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.role
     * @param {string} param0.zone
     * @param {string} param0.userid If specified, checks will be made to be sure that the user can grant that role
     * @returns {Promise<void>}
     */
    async removeRoleFromUser({ subject, role, zone, userid }) {

        //The reason we are checking for the presence of these strings is because it is deadly to have an empty userid or an empty role name
        //For example, empty userid will remove a given role from all users
        //An empty role id will delete all roles from the user, or remove the wrong role from the user
        soulUtils.checkArgs(arguments[0], {
            subject: 'string',
            role: 'string',
            zone: 'string'
        });

        if (userid && !await this.userCanGrantRole({ userid, role, zone })) {
            throw new Exception(`Sorry, you don't have the ability to grant or revoke this role from someone.`)
        }

        await this.collection.deleteOne({ userid: subject, role, zone })
    }


    /**
     * This method checks if a user has a role
     * @param {object} param0 
     * @param {string} param0.userid The id of the user
     * @param {string} param0.role The id of the role
     * @returns {Promise<boolean>}
     */
    async userHasRole({ userid, role }) {
        return (await this.collection.findOne({ userid: userid, role })) !== null
    }

    /**
     * This method sets the zone to which a role grant can be exercised
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.role
     * @param {string} param0.zone
     * @returns {Promise<void>}
     */
    async setZone({ userid, role, zone }) {

        await this.collection.updateOne(
            {
                userid: userid,
                role
            },
            {
                $set: {
                    zone
                }
            }
        )
    }

    /**
     * This is an internal method used to prepare collections to be used by the module
     * @param {import("./types.js").RolePlayCollection} collections 
     */
    static async prepareCollections(collection) {
        await collection.createIndex({ userid: 1, role: 1, zone: 1 }, { unique: true })
    }

}


/**
 * @type {modernuser.permission.PermissionData}
 */
export let roleplay_permissions = [
    {
        name: 'permissions.modernuser.role.play.grant_all',
        label: `Grant any role to anyone`,
        inherit: ['permissions.modernuser.profiles.search']
    },
    {
        label: 'View members of roles',
        name: 'permissions.modernuser.role.play.view',
    }
]