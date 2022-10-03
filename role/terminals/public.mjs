/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This module provides methods related to user roles (in general)
 */

import RolePlayPublicMethods from './play.mjs';
import RoleDataPublicMethods from "./data.mjs";
import UserProfileController from "../../profile/controller.mjs";
import RoleContactPublicMethods from "./contact.mjs";
import RoleController from "../controller.mjs";
import PermissionGrantsController from '../../permission/grants/controller.mjs';

export default class UserRolePublicMethods {

    /**
     * 
     * @param {object} param0
     * @param {RoleController} param0.role_controller 
     * @param {UserProfileController} param0.user_profile_controller
     * @param {PermissionGrantsController} param0.permission_grants_controller
     */
    constructor({ role_controller, user_profile_controller, permission_grants_controller }) {

        this.data = new RoleDataPublicMethods(role_controller.data)

        this.role_play = new RolePlayPublicMethods(role_controller.roleplay, user_profile_controller, permission_grants_controller);

        this.contact = new RoleContactPublicMethods(role_controller.contact, user_profile_controller)

    }



}