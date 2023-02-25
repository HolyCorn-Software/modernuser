/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module is responsible for providing useful methods to other faculties
 */

import GroupDataController from "../group/data/controller.mjs";
import GroupMembershipController from "../group/membership/controller.mjs";
import UserGroupInternalMethods from "../group/terminals/internal.mjs";
import UserProfileController from "../profile/controller.mjs";
import UserProfileInternalMethods from "../profile/terminals/internal.mjs";
import UserAuthenticationController from "../authentication/controller.mjs";
import UserAuthenticationInternalMethods from "../authentication/terminals/internal.mjs";
import ZonationDataController from "../zonation/data/controller.mjs";
import ZoneMembershipController from "../zonation/membership/controller.mjs";
import ZonationInternalMethods from "../zonation/terminals/internal.mjs";
import PermissionsInternalMethods from "../permission/terminals/internal.mjs";
import PermissionDataController from "../permission/data/controller.mjs";
import PermissionGrantsController from "../permission/grants/controller.mjs";
import UserRoleInternalMethods from "../role/terminals/internal.mjs";
import RoleController from "../role/controller.mjs";


export default class UserInternalMethods extends FacultyPublicMethods {

    /**
     * 
     * @param {object} param0 
     * @param {UserAuthenticationController} param0.authentication
     * @param {object} param0.zonation
     * @param {ZonationDataController} param0.zonation.data
     * @param {ZoneMembershipController} param0.zonation.membership
     * @param {object} param0.groups
     * @param {GroupDataController} param0.groups.data
     * @param {GroupMembershipController} param0.groups.membership
     * @param {UserProfileController} param0.profile
     * @param {object} param0.permissions
     * @param {PermissionDataController} param0.permissions.data
     * @param {PermissionGrantsController} param0.permissions.grants
     * @param {RoleController} param0.role
     */
    constructor({ authentication, zonation, groups, profile, permissions, role }) {
        super();

        this.authentication = new UserAuthenticationInternalMethods(authentication)

        this.zonation = new ZonationInternalMethods(zonation.data, zonation.membership);

        this.groups = new UserGroupInternalMethods(groups.data, groups.membership);

        this.profile = new UserProfileInternalMethods(profile, authentication)

        this.permissions = new PermissionsInternalMethods(permissions.data, permissions.grants)

        this.roles = new UserRoleInternalMethods(role)

    }
    
}