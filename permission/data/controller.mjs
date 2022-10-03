/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * 
 * This module simply keeps track of permissions. That is... their definitions
 */

import { Collection } from "mongodb"
import { Exception } from "../../../../system/errors/backend/exception.js"

export const ULTIMATE_PERMISSION = {
    label: `Superuser Permission`,
    name: 'permissions.modernuser.superuser'
}


export default class PermissionDataController {

    /**
     * 
     * @param {object} param0
     * @param {import("./types.js").PermissionsDataCollection} param0.collection
     */
    constructor({ collection }) {
        if (!collection instanceof Collection) {
            throw new Exception(`Please pass a MongoDB collection for the parameter called 'collection'`, {
                code: 'error.input.validation'
            })
        }
        /** @type {import("./types.js").PermissionsDataCollection} */
        this.collection = collection;

        this.createPermission(ULTIMATE_PERMISSION)
    }

    /**
     * This method creates a permission
     * @param {object} param0 
     * @param {string} param0.name The unique name of the permission
     * @param {string} param0.label The human-friendly name of the permission
     * @param {[string]} param0.inherit
     * 
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
     * @returns {Promise<[import("./types.js").PermissionData]>}
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
     * @param {string} param0.name
     * @returns {Promise<import("./types.js").PermissionData>}
     */
    async getPermission({name}){
        return await this.collection.findOne({name})
    }
    

    /**
     * Returns all the permissions
     * @returns {Promise<[import("./types.js").PermissionData]>}
     */
    async getAll() {
        return await this.collection.find({}).toArray()
    }

    /**
     * This method gets a permission as well as all the permissions that inherit it
     * @param {string} name 
     * @returns {Promise<[import("./types.js").PermissionData]>}
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
     * Some operations done on a collection prior to use
     * @param {import("./types.js").PermissionsDataCollection} collection
     */
    static prepareCollection(collection) {
        collection.createIndex({ name: 1 }, { unique: true }).catch(e => {
            console.warn(`Failed to perform necessary operation on a collection meant to store permission info `, e)
        })
    }

}