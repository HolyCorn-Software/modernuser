/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * 
 * The Modern Faculty of Users
 * 
 * This module contains useful functions used by the zonation-manager widget
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs"



/**
 * This method is used to create a new zone.
 * 
 * It returns the id of the newly created zone
 * @param {object} param0 
 * @param {string} param0.label The label for the new zone
 * @param {string} param0.superzone The parent zone
 * @returns {Promise<string>}
 */
export async function createZone({ label, superzone }) {
    let id = await hcRpc.modernuser.zonation.createZone({ label, superzone })
    zones_cache.push(
        {
            id,
            label,
            superzone,
        }
    )
    return id;
}



/** @type {modernuser.zonation.ZoneData]} */
let zones_cache;
/**
 * Fetches all the zones in the system
 * @returns {Promise<modernuser.zonation.ZoneData]>}
 */
export async function fetchZones() {

    return zones_cache ||= await hcRpc.modernuser.zonation.getZones()

}



/**
 * Converts data from from zone structure into something in the nature of a directory structure
 * @param {modernuser.zonation.ZoneData]} data
 * @returns {[import("/$/system/static/html-hc/widgets/file-explorer/types.js").DirectoryData]}
 */
export function toFileStructure(data) {
    return data.map(zone => {
        return {
            id: zone.id,
            label: zone.label,
            parent: zone.superzone,
            icon: new URL('./res/zone.png', import.meta.url).href
        }
    })
}



/**
 * Renames a zone (changes the label on the zone)
 * @param {string} id
 * @param {string} newlabel
 * @returns {Promise<void>}
 */
export async function renameZone(id, newlabel) {
    await hcRpc.modernuser.zonation.renameZone(id, newlabel)
    zones_cache.filter(x => x.id === id)[0].label = newlabel
}


/**
 * This method deletes a zone
 * @param {string} id 
 * @returns {Promise<void>}
 */
export async function deleteZone(id) {
    await hcRpc.modernuser.zonation.deleteZone(id)
    zones_cache = zones_cache.filter(x => x.id !== id)
}