/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System Project
 * 
 * The Modern Faculty of Users
 * This module contains code that manages the data of zones
 * 
 * It can give basic information about a zone as well as the sub-zones it contains and the zone it belongs to
 */

import shortUUID from "short-uuid";
import { Exception } from "../../../../system/errors/backend/exception.js";




export default class ZonationDataController {


    /**
     * 
     * @param {object} param0 
     * @param {import("./types.js").ZoneDataCollection} param0.collection
     */
    constructor({ collection }) {

        /** @type {import("./types.js").ZoneDataCollection} */
        this[collection_symbol] = collection


        this[collection_symbol].findOne({ id: '0' }).then(v => {
            if (v === null) {

                this[collection_symbol].insertOne(
                    {
                        id: '0',
                        label: `Root Zone`,
                        superzone: '',
                        time: Date.now()
                    },
                    { upsert: true }
                );

            }
        })


    }

    /**
     * This method returns info of the specified zone
     * @param {string} id 
     * @returns {Promise<import("./types.js").ZoneData>}
     */
    async getZone(id) {
        return await this[collection_symbol].findOne({ id })
    }

    /**
     * Fetches all zones in the entire system
     * @returns {Promise<[import("./types.js").ZoneData]>}
     */
    async getAllZones() {
        return await this[collection_symbol].find().toArray()
    }

    /**
     * This method returns all the zone under a given zone
     * @param {string} id 
     * @returns {Promise<[import("./types.js").ZoneData]>}
     */
    async getChildZones(id) {
        const zones = await this.getAllZones()

        return zones.filter(zone => {
            if (zone.id === id) {
                return false
            }
            return this.isChildOf0(zone.id, id, zones)
        })
    }

    /**
     * This method returns the parent, the parent of the parent, the parent of the parent of the parent ... zone 
     * @param {string} id 
     * @param {import("./types.js").ZoneData} zone_data
     * @returns {[import("./types.js").ZoneData]}
     */
    getAncestors0(id, zone_data) {
        const zone_info = zone_data.find(z => z.id == id)
        if (!zone_info) {
            throw new Exception(`Zone with id ${id} not found!`)
        }
        const ancestors = []
        let current_zone = zone_info;
        while (current_zone?.superzone) {
            current_zone = zone_data.find(z => z.id === current_zone.superzone)
            if (current_zone) {
                ancestors.push(current_zone)
            }
        }
        return ancestors
    }

    /**
     * This method retrieves all direct ancestors of a given zone.
     * 
     * That is the parent, th parent of the parent, and the parent of the parent of the parent ... 
     * @param {string} id 
     * @returns {Promise<[import("./types.js").ZoneData]>}
     */
    async getAncestors(id) {
        return this.getAncestors0(id, await this.getAllZones())
    }

    /**
     * This method returns the distance between two zones
     * @param {string} zone1 
     * @param {string} zone2 
     * @returns {Promise<number>}
     */
    async distance(zone1, zone2) {

        const zonation_data = await this.getAllZones()

        /** @param {string} id @returns {import("./types.js").ZoneData} */
        const get_zone = (id) => zonation_data.find(z => z.id === id)

        /**
         * This method calculates the distance, with respect to a start point
         * @param {('zone1'|'zone2')} point 
         * @returns {number}
         */
        const calculate = (point) => {
            const points = { zone1, zone2 }

            if (points.zone1 === points.zone2) {
                return 0;
            }
            if (points[point] === '0') {
                return -1;
            }

            const other_point = point === 'zone1' ? 'zone2' : 'zone1'

            let distance = 0;

            let current_zone = points[point]

            while (current_zone !== points[other_point]) {
                distance++

                const current_zone_data = get_zone(current_zone)
                current_zone = current_zone_data.superzone;
                if (current_zone === '0' && current_zone !== points[other_point]) {
                    distance = -1;
                    break;
                }

            }

            return distance;

        }

        return (await Promise.all(
            [
                (async () => {
                    return await calculate('zone1')
                })(),

                (async () => {
                    return await calculate('zone2')
                })()
            ]
        )).sort((a, b) => {
            if (a < 0) {
                return 1
            }
            if (b < 0) {
                return -1
            }
            throw new Error(`This is unlikely! How can ${get_zone(points['point1']).label} (${points['point2']}) be a child and parent of ${get_zone(points.point1).label}(${points.point2}). a is actually ${a} and b is ${b}`)
        })[0]

    }



    /**
     * This method returns true if the child is in someway a child of parent
     * @param {string} child 
     * @param {string} parent 
     * @param {import("./types.js").ZoneData} zones
     * @returns {boolean}
     */
    isChildOf0(child, parent, zones) {

        const get_zone = (zone) => zones.find(x => x.id == zone)

        let current = get_zone(child)

        let is_child = false;

        while (current.superzone !== '' && typeof current.superzone !== 'undefined') {
            if (current.superzone === parent) {
                is_child = true;
                break;
            }
            current = get_zone(current.superzone)
            if (!current) {
                break;
            }
        }

        return is_child;

    }


    /**
     * This method returns true if the child is in someway a child of parent
     * @param {string} child 
     * @param {string} parent 
     * @returns {Promise<boolean>}
     */
    async isChildOf(child, parent) {
        return this.isChildOf0(child, parent, await this.getAllZones())

    }


    /**
    * This method creates a zone
    * @param {object} param0 
    * @param {string} param0.label The human-friendly name of the zone
    * @param {string} param0.superzone The zone to which the zone belongs to. This may be left blank
    * @returns {Promise<string>} Returns the id of the zone
    */
    async createZone({ label, superzone }) {

        if (!superzone) {
            throw new Exception(`You cannot create a zone at this level!\nThe zone should be a part of another zone`, { code: 'error.system.unplanned' })
        }

        const id = shortUUID.generate();

        await this[collection_symbol].insertOne({
            id: id,
            label,
            superzone,
            time: Date.now()
        });

        return id;
    }

    /**
     * Deletes a Zone and everything beneath it
     * @param {string} id id of Zone
     * @returns {Promise<void>}
     */
    async deleteZone(id) {
        this.check_super_zone(id);
        await this[collection_symbol].deleteOne({
            id
        });

        await this[collection_symbol].deleteMany({
            superzone: id
        })
    }

    /**
     * This method modifies the label on a Zone
     * @param {string} id id of Zone
     * @param {object} label New label of Zone 
     * @returns {Promise<void>}
     */
    async renameZone(id, label) {
        let results = await this[collection_symbol].updateOne({ id }, {
            $set: {
                label
            }
        });
        if (results.modifiedCount === 0) {
            throw new Exception(`Could not rename zone because it was not found`)
        }
    }

    /**
     * This method moves a zone into another zone
     * @param {string} id The zone to be moved
     * @param {string} superzone The id of the zone to contain this zone. If not specifed, the zone will be placed at the top level
     * @returns {Promise<void>}
     */
    async moveZone(id, superzone) {
        this.check_super_zone(id);

        if (typeof superzone !== 'undefined') {
            if ((await this[collection_symbol].findOne({ id: superzone })) === null) {
                throw new Exception(`Cannot move to zone ${superzone}.It doesn't exist.`)
            }
        }

        if ((await this[collection_symbol].findOne({ id })) === null) {
            throw new Exception(`Zone (${id}) to be moved was not found.`)
        }

        await this[collection_symbol].updateOne({ id }, { $set: { superzone } })
    }

    check_super_zone(id) {
        if (id == '0') {
            throw new Exception(`You can only rename the root zone. You can neither move it, nor delete it`)
        }
    }


    /**
     * Some operations done on a collection prior to use
     * @param {import("./types.js").ZoneDataCollection} collection
     */
    static prepareCollection(collection) {
        collection.createIndex({ id: 1 }, { unique: true }).catch(e => {
            console.warn(`Failed to perform necessary operation on a collection meant to store group info `, e)
        })
    }


}


/**
 * @type {[import("faculty/modernuser/permission/data/types.js").PermissionData]}
 */
export const zonation_permissions = [
    {
        name: 'permissions.modernuser.zonation.admin',
        label: `Create, modify and delete zones`,
    }
]





const collection_symbol = Symbol(`ZonationDataController.prototype.collection`)