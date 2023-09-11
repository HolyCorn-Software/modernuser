/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * The role module
 * This controller is responsible for the logic behind user roles, both for keeping information about roles as well as information on who plays which role
 */

import PermissionGrantsController from "../permission/grants/controller.mjs";
import ZonationDataController from "../zonation/data/controller.mjs";
import RoleContactController, { contact_permissions } from "./contact/controller.mjs";
import RoleDataController, { permissions as roledata_permissions } from "./data/controller.mjs";
import RolePlayController, { roleplay_permissions } from "./membership/controller.mjs";

const faculty = FacultyPlatform.get()



export default class RoleController {

    /**
     * 
     * @param {object} param0
     * @param {modernuser.role.Collections} param0.collections 
     * @param {PermissionGrantsController} param0.permission_grants_controller
     * @param {ZonationDataController} param0.zonation_data_controller
     */
    constructor({ collections, permission_grants_controller, zonation_data_controller }) {
        this.data = new RoleDataController({ collection: collections.data, permission_grants_controller })
        this.roleplay = new RolePlayController(
            {
                collection: collections.roleplay,
                permission_grants_controller,
                role_data_controller: this.data,
                zonation_data_controller
            }
        )
        this.contact = new RoleContactController({
            collection: collections.contact,
            role_data_controller: this.data,
            role_play_controller: this.roleplay,
            zonation_data_controller,
            permission_grants_controller
        });

        faculty.events.addListener(`${faculty.descriptor.name}.role-delete`, async (id) => {
            //TODO: Notify the contacts by saying, "Hello, you have been removed from the role of ... because the role was removed"
            await this.contact.removeAllContacts({ role: id })
            //Remove all permissions granted to the role
            await permission_grants_controller.unsetAllPermissions({ subject: id })
        });

    }


}


export const role_permissions = [
    ...roleplay_permissions,
    ...contact_permissions,
    ...roledata_permissions
]