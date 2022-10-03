/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * The group module simply keeps track of the various user groups
 * It only tracks the data about groups. That is, id's labels, etc
 * 
 * The group module comes with custom errors located in errors.json
 */

import { Collection } from "mongodb"
import shortUUID from "short-uuid";
import { Exception } from "../../../../system/errors/backend/exception.js"


export default class GroupDataController {

    /**
     * 
     * @param {object} param0
     * @param {import("./types.js").GroupsCollection} param0.collection
     */
    constructor({ collection }) {
        if (!collection instanceof Collection) {
            throw new Exception(`Please pass a MongoDB collection for the parameter called 'collection'`, {
                code: 'error.input.validation'
            })
        }
        /** @type {import("./types.js").GroupsCollection} */
        this[collection_symbol] = collection;
    }

    /**
     * This method creates a group
     * @param {object} param0 
     * @param {string} param0.label The human-friendly name of the group
     * @returns {Promise<string>} Returns the id of the group
     */
    async createGroup({ label }) {

        const id = shortUUID.generate();

        await this[collection_symbol].insertOne({
            id: id,
            label
        });

        return id;
    }

    /**
     * Deletes a group
     * @param {string} id id of group
     * @returns {Promise<void>}
     */
    async deleteGroup(id) {
        await this[collection_symbol].deleteOne({
            id
        })
    }

    /**
     * This method modifies the label on a group
     * @param {string} id id of group
     * @param {object} label New label of group 
     * @returns {Promise<void>}
     */
    async renameGroup(id, label) {
        let results = await this[collection_symbol].updateOne({ id }, {
            $set: {
                label
            }
        });
        if (results.modifiedCount === 0) {
            throw new Exception(`Could not rename group because it was not found`, {
                code: 'groupManager.notFound'
            })
        }
    }

    /**
     * Some operations done on a collection prior to use
     * @param {import("./types.js").GroupsCollection} collection
     */
    static prepareCollection(collection) {
        collection.createIndex({ id: 1 }, { unique: true }).catch(e => {
            console.warn(`Failed to perform necessary operation on a collection meant to store group info `, e)
        })
    }

}


const collection_symbol = Symbol(`GroupDataController.prototype.collection`)