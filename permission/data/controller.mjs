/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * 
 * This module simply keeps track of permissions. That is... their definitions
 * 
 * Updated 2023 to allow faculties to declare permissions in the faculty.json
 */

import { Collection } from "mongodb"

export const ULTIMATE_PERMISSION = {
    label: `Superuser Permission`,
    name: 'permissions.modernuser.superuser'
}


export default class PermissionDataController {

    /**
     * 
     * @param {object} param0
     * @param {modernuser.permission.PermissionsDataCollection} param0.collection
     */
    constructor({ collection }) {
        if (!collection instanceof Collection) {
            throw new Exception(`Please pass a MongoDB collection for the parameter called 'collection'`, {
                code: 'error.input.validation'
            })
        }
        /** @type {modernuser.permission.PermissionsDataCollection} */
        this.collection = collection;

        this.init(collection)
    }

    /**
     * This method creates a permission
     * @param {modernuser.permission.PermissionDataInput} param0 
     * @returns {Promise<void>}
     */
    async createPermission({ name, label, inherit }) {

        await this.collection.updateOne(
            {
                name
            },

            {
                $set: {
                    name,
                    label,
                    inherit,
                    time: Date.now()
                }
            },
            { upsert: true }
        );
    }

    /**
     * Deletes a permission
     * @param {string} name Name of permission
     * @returns {Promise<void>}
     */
    async deletePermission(name) {
        await this.collection.deleteOne({
            name
        })
    }

    /**
     * Fetches all permissions that match the given filter
     * @param {string} filter 
     * @returns {Promise<modernuser.permission.PermissionData[]>}
     */
    async fetchPermissions(filter) {

        if (filter.length < 2) {
            return [];
        }

        //Clean the input
        // filter = filter.replaceAll(/[^A-Za-z0-9@_ ]/g, '');
        const parts = filter.split(/[^A-Za-z0-9 ]/);


        let users = await this.collection.find({
            label: {
                $regex: new RegExp(parts.join('.*'), 'i')
            },

        }).toArray();

        return users;
    }

    /**
     * This method is used to retrieve information about a particular permission.
     * @param {object} param0 
     * @param {modernuser.permission.PermissionEnum} param0.name
     * @returns {Promise<modernuser.permission.PermissionData>}
     */
    async getPermission({ name }) {
        return await this.collection.findOne({ name })
    }


    /**
     * Returns all the permissions
     * @returns {Promise<modernuser.permission.PermissionData[]>}
     */
    async getAll() {
        return await this.collection.find({}).toArray()
    }

    /**
     * This method gets a permission as well as all the permissions that inherit it
     * @param {string} name 
     * @returns {Promise<modernuser.permission.PermissionData[]>}
     */
    async getPermissionAndChildren(name) {

        //Find all permissions whose name is <name> or that contain <name> in the 'inherit' field
        return await this.collection.find({
            $or: [
                {
                    name
                },

                {
                    inherit: {
                        $elemMatch: {
                            $eq: name
                        }
                    }
                },
                {
                    name: ULTIMATE_PERMISSION.name
                }
            ]
        }).toArray()
    }

    /**
     * This method is called when the system starts, and it is meant to initialize the system
     * @param {modernuser.permission.PermissionsDataCollection} collection
     * @returns {Promise<void>}
     */
    async init(collection) {
        await PermissionDataController.prepareCollection(collection)
        await this.createPermission(ULTIMATE_PERMISSION)

        const faculties = await FacultyPlatform.get().base.channel.remote.faculties()


        for (const faculty of faculties) {
            for (const permission of faculty.meta?.modernuser?.permissions || []) {
                this.createPermission(permission).catch(e => console.error(e))
            }
        }

    }


    /**
     * Some operations done on a collection prior to use
     * @param {modernuser.permission.PermissionsDataCollection} collection
     */
    static async prepareCollection(collection) {
        await collection.dropIndexes()

        await collection.createIndex({ name: 1 }, { unique: true }).catch(e => {
            console.warn(`Failed to perform necessary operation on a collection meant to store permission info `, e)
        });

    }

}