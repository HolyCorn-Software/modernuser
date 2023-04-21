/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * 
 * This module simply tracks how permissions are granted and revoked. 
 * It can tell if a user or group has a certain permission
 * 
 */



import PermissionDataController, { ULTIMATE_PERMISSION } from "../data/controller.mjs";

const faculty = FacultyPlatform.get();



const data_controller_symbol = Symbol(`PermissionGrantsController.prototype.data_controller`)
const zonation_data_controller_symbol = Symbol(`PermissionGrantsController.prototype.zonation_data_controller`)

export default class PermissionGrantsController {

    /**
     * 
     * @param {object} param0 
     * @param {modernuser.permission.PermissionGrantsCollection} param0.collection
     * @param {PermissionDataController} param0.data_controller
     * @param {import("faculty/modernuser/zonation/data/controller.mjs").default} param0.zonation_data_controller
     */
    constructor({ collection, data_controller, zonation_data_controller }) {


        this.collection = collection

        this[data_controller_symbol] = data_controller
        this[zonation_data_controller_symbol] = zonation_data_controller



        faculty.connectionManager.events.addListener(`${faculty.descriptor.name}.profile-genesis`, (userid) => {
            this.setPermission({
                subject: userid,
                freedom: {
                    grant: true,
                    use: true,
                },
                permission: ULTIMATE_PERMISSION.name,
                subject_type: 'user',
                zone: '0',
                expires: (Date.now() + (30 * 24 * 60 * 60 * 1000)) //Grant him those permissions for a period of thirty(30) days so he can setup the platform,
            })
        })
    }


    /**
     * This method is expected to be implemented externally.
     * It returns all the roles played by a user
     * @param {string} userid 
     * @returns {Promise<import("faculty/modernuser/role/membership/types.js").RolePlay[]>}
     */
    async getUserRoles(userid) {
        throw new Error(`The getUserRoles() method was not implemented. This method is probably supposed to come from the RolePlayController`)
    }

    /**
     *  This searches for data about a permission that was granted to a particular subject
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.permission
     */
    async getPermission({ subject, permission } = {}) {
        return await this.collection.findOne({
            subject,
            permission
        })
    }

    /**
     * Checks if a user has at least one of the stated permissions for the mentioned intent
     * @param {object} param0
     * @param {string} param0.userid The user
     * @param {modernuser.permission.PermissionIntent} param0.intent
     * @param {string[]} param0.permissions An array of permissions to checked
     * @param {object} param0.flags
     * @param {boolean} param0.flags.throwError If set to false, we'll not throw a not authorized error
     * @returns {Promise<boolean>}
     */
    async userPermitted({ userid, intent, permissions, flags: { throwError = true } = {} } = {}) {

        for (let permission of permissions) {
            if (await this.hasPermission({ flags: { ...arguments[0].flags, throwError: false }, intent, userid, permission })) {
                return true
            }
        }


        if (throwError) {
            throw new Exception(`You don't have sufficient permissions to do this`, { code: `error.${faculty.descriptor.name}.not_permitted` })
        }

        return false;
    }

    /**
     * This method will validate a user, if he has any of the stated permissions, or his id, or role is in the whitelist
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string[]} param0.permissions
     * @param {modernuser.permission.PermissionIntent} param0.intent
     * @param {object} param0.flags
     * @param {boolean} param0.flags.throwError
     * @param {string[]} param0.whitelist
     * @returns {Promise<boolean>}
     */
    async whitelistedPermissionCheck({ userid, permissions, intent, flags, whitelist = [] }) {
        if (whitelist.findIndex(x => x === userid) !== -1) { //Check if the user is in the whitelist. 
            //If so, we're good
            return true;
        }

        if (!
            await this.userPermitted({ userid, permissions, intent, flags: { throwError: false } })
        ) {
            if ((await this.getUserRoles(userid)).findIndex(role => whitelist.findIndex(w => w === role.data.id) !== -1) !== -1) { //The user has a role in the whitelist
                return true;
            }
        }

        //Now, it's clear that the user doesn't have sufficient permissions
        if (flags?.throwError ?? true) {
            //So, do we throw an error, or do we return false ?
            throw new Exception(`Dear user, you do not have sufficient permissions to continue.`)
        }

        return false;
    }

    /**
     * Gets all granted permissions. If the subject is specified, only his permissions will be returned
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.userid If specified, checks will be made to be sure the user has the right to view permission info on the platform
     * @returns {Promise<modernuser.permission.PermissionGrant[]>}
     */
    async getPermissions({ subject, userid } = {}) {

        if (userid) {
            //In this case we need to be sure that the user has the right to even view permission details of others.

            await this.userPermitted(
                {
                    userid,
                    permissions: ['permissions.modernuser.permissions.manage'],
                    intent: {
                        freedom: 'use'
                    },
                    flags: {
                        throwError: true
                    }
                }
            )
        }

        let query = {}
        if (subject) {
            query.subject = subject
        }
        return await this.collection.find({
            ...query
        }).toArray()
    }

    /**
     * This is used to set new or modify an existing permission grant
     * @param {Omit<modernuser.permission.PermissionGrant, "time">} data 
     */
    async setPermission(data, upsert = true) {
        await this.collection.updateOne({
            subject: data.subject,
            permission: data.permission,
        },
            {

                $set: {
                    subject: data.subject,
                    ...(() => {

                        //Set only the fields that are present
                        let values = {
                            subject_type: data.subject_type,
                            permission: data.permission,
                            "freedom.grant": data.freedom?.grant,
                            "freedom.use": data.freedom?.use,
                            "zone": data.zone,
                            "expires": data.expires,
                        }

                        let final = {}
                        for (let key in values) {
                            if (typeof values[key] !== 'undefined') {
                                final[key] = values[key]
                            }
                        }
                        return final
                    })()
                },

                $setOnInsert: {
                    time: Date.now()
                },
            },
            {
                upsert
            }
        )
    }

    /**
     * This can only remove a permission from one subject at a time
     * @param {object} param0
     * @param {string} param0.subject
     * @param {string} param0.permission 
     * @param {string} param0.zone
     */
    async unsetPermission({ subject, permission, zone }) {

        soulUtils.checkArgs(arguments[0], {
            subject: 'string',
            permission: 'string',
            zone: 'string'
        })

        await this.collection.deleteOne({
            subject,
            permission,
            zone
        })
    }

    /**
     * This method removes all the permissions from a subject
     * @param {object} param0 
     * @param {string} param0.subject
     * @returns {Promise<void>}
     */
    async unsetAllPermissions({ subject }) {

        soulUtils.checkArgs(arguments[0], {
            subject: 'string'
        })

        await this.collection.deleteMany(
            {
                subject
            }
        )
    }


    /**
     * This method updates an already existing permission grant
     * @param {object} param0 
     * @param {string} param0.subject
     * @param {string} param0.permission
     * @param {modernuser.permission.PermissionGrant} param0.data
     * @returns {Promise<void>}
     */
    async updatePermission({ subject, permission, data }) {
        return await this.setPermission({
            subject,
            permission,
            ...data
        })
    }


    /**
     * This method checks whether or not a user has a named permission. 
     * It takes into consideration the parameters of zonation, and how a permission can extend another
     * @param {object} param0 
     * @param {string} param0.userid
     * @param {string} param0.permission
     * @param {object} param0.intent
     * @param {string} param0.intent.zone
     * @param {modernuser.permission.Freedom} param0.intent.freedom
     * @param {object} param0.flags
     * @param {boolean} param0.flags.throwError
     * @returns {Promise<boolean>}
     */
    async hasPermission({ userid, permission, intent, flags }) {
        let permissions = await this[data_controller_symbol].getPermissionAndChildren(permission)
        if (permissions.length === 0) {
            throw new Exception(`permission ${permission} not found !`)
        }

        //Get all the roles played by the user
        let roles = await this.getUserRoles(userid)

        //Find all the permission grants for the given permissions, for the subject
        let grants = await this.collection.find(
            {
                $or: permissions.map(perm => {
                    return {
                        $or: [...roles.map(role => role.role), userid].map(role => {
                            return {
                                subject: role
                            }
                        }),
                        permission: perm.name
                    }
                })
            }
        ).toArray()


        //This function is used to check if a user-zone holds up to scrutiny against the intent zone

        const zone_is_valid = async (zone) => {
            //Now a zone is only valid if it is the intent zone or the intent zone is a child of it
            return (typeof intent.zone === 'undefined') || (zone === null) || (zone === '0') || (zone === intent.zone) || await this[zonation_data_controller_symbol].isChildOf(intent.zone, zone)
        }

        //First things first, filter out the ones that don't have the necessary freedom
        grants = grants.filter(grant => grant.freedom[intent.freedom] === true)


        let validated = false; //This variable holds the results of our judgement. Is the permission validated ?

        for (let grant of grants) {

            if (grant.subject_type === 'role') {
                //Now check if the zone in which the user plays this role is valid against the intent zone
                const role_data = roles.find(x => x.role === grant.subject)
                if (await zone_is_valid(role_data.zone)) {
                    validated = true;
                    break;
                } else {
                    console.log(`The zone of `, grant, `\nis invalid`)
                }
            }

            if (grant.subject_type === 'user') {
                if (await zone_is_valid(grant.zone)) {
                    validated = true;
                    break;
                } else {
                    console.log(`The zone of `, grant, `\nis invalid`)
                }
            }

        }


        if (flags?.throwError && !validated) {
            throw new Exception(`You do not have sufficient permissions.`)
        }

        return validated;

    }




    /**
     * This is an internal method used to prepare collections to be used by the association manager
     * @param {modernuser.permission.PermissionGrantsCollection} collection 
     */
    static async prepareCollections(collection) {
        await collection.createIndex({ subject: 1, permission: 1 }, { unique: true })
    }

}



/**
 * @type {modernuser.permission.PermissionData[]}
 */
export const permissions = [
    {
        label: `Manage Permissions`,
        name: 'permissions.modernuser.permissions.manage',
        inherit: ['permissions.modernuser.profiles.search']
    }
]