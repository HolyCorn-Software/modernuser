/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module is responsible for providing the methods that are accessible to the public
 */

import { FacultyPublicMethods } from "../../../system/comm/rpc/faculty-public-methods.mjs";
import GroupDataController from "../group/data/controller.mjs";
import GroupMembershipController from "../group/membership/controller.mjs";
import UserGroupPublicMethods from "../group/terminals/public.mjs";
import UserProfileController from "../profile/controller.mjs";
import UserAuthenticationController from "../authentication/controller.mjs";
import UserAuthenticationPublicMethods from "../authentication/terminals/public.mjs";
import ZonationDataController from "../zonation/data/controller.mjs";
import ZoneMembershipController from "../zonation/membership/controller.mjs";
import ZonationPublicMethods from "../zonation/terminals/public.mjs";
import UserProfilePublicMethods, { permissions as profilePermissions } from "../profile/terminals/public.mjs";
import UserRolePublicMethods from "../role/terminals/public.mjs";
import PermissionsPublicMethods from '../permission/terminals/public.mjs'
import PermissionDataController, { ULTIMATE_PERMISSION } from "../permission/data/controller.mjs";
import PermissionGrantsController from "../permission/grants/controller.mjs";
import NotificationPublicMethods from "../notification/terminals/public.mjs";
import NotificationController from "../notification/controller.mjs";
import OnboardingPublicMethods from "../onboarding/terminals/public.mjs";
import OnboardingController from "../onboarding/controller.mjs";
import RoleController from "../role/controller.mjs";
import { FacultyPlatform } from "../../../system/lib/libFaculty/platform.mjs";
import { FacultyPublicJSONRPC } from "../../../system/comm/rpc/faculty-public-rpc.mjs";

const faculty = FacultyPlatform.get()

const permission_grants_controller_symbol = Symbol()
const profile_controller_symbol = Symbol(`UserPublicMethods.prototype.profile_controller`)
const authentication_controller_symbol = Symbol(`UserPublicMethods.prototype.authentication_controller`)

export default class UserPublicMethods extends FacultyPublicMethods {

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
     * @param {RoleController} param0.role
     * @param {object} param0.permissions
     * @param {PermissionDataController} param0.permissions.data
     * @param {PermissionGrantsController} param0.permissions.grants
     * @param {NotificationController} param0.notification
     * @param {OnboardingController} param0.onboarding
     */
    constructor({ authentication, zonation, groups, profile, role, permissions, notification, onboarding }) {
        super();

        this.authentication = new UserAuthenticationPublicMethods(authentication)

        this.zonation = new ZonationPublicMethods(zonation.data, zonation.membership);

        this.groups = new UserGroupPublicMethods(groups.data, groups.membership)

        this.permissions = new PermissionsPublicMethods(permissions.data, permissions.grants)

        this.profile = new UserProfilePublicMethods(profile, authentication, permissions.grants)

        /** @type {UserProfileController} */ this[profile_controller_symbol] = profile
        /** @type {UserAuthenticationController} */ this[authentication_controller_symbol] = authentication
        /** @type {PermissionGrantsController} */ this[permission_grants_controller_symbol] = permissions.grants

        this.role = new UserRolePublicMethods({ role_controller: role, user_profile_controller: profile, permission_grants_controller: permissions.grants })

        this.notification = new NotificationPublicMethods(notification)

        this.onboarding = new OnboardingPublicMethods(onboarding)

    }

    /**
     * This is method is called by a client when creating a new account
     * @param {string} provider 
     * @param {object} data 
     * @returns {Promise<object>}
     */
    async signup(provider, data) {

        let clientRpc = arguments[0]
        provider = arguments[1]
        data = arguments[2]

        let userid = await this[profile_controller_symbol].createProfile()
        try {
            let token = await this[authentication_controller_symbol].createLogin({
                userid,
                data,
                provider,
                clientRpc
            });

            //Now, if this is the first profile, then grant it the superuser permission
            if (await this[profile_controller_symbol].onlyOneProfileExists()) {
                this[permission_grants_controller_symbol].setPermission({
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
            }

            return token
        } catch (e) {
            console.error(`Failed to create a login, deleting the profile ${userid}\nDetails of the error\n`, e)
            this[profile_controller_symbol].deleteProfile(userid);
            throw e
        }
    }


    /**
     * This is method is called by a client when he wishes to add another user account to the login
     * @param {string} provider 
     * @param {object} data 
     * @returns {Promise<{token: string, expires:string}>}
     */
    async addTenant(provider, data) {
        provider = arguments[1]
        data = arguments[2]

        let userid = await this[profile_controller_symbol].createProfile()

        
        const login = await this[authentication_controller_symbol].login({ data, provider })

        await this[authentication_controller_symbol].bindLogin({ userid, login: login.login_data.id })

        const credentials = await this[authentication_controller_symbol].advancedLogin({ data, provider, userid })



        /** @type {FacultyPublicJSONRPC} */
        const client = arguments[0];


        let session = await client.resumeSessionFromMeta();

        session.setVar(`${faculty.descriptor.name}-authentication-token`, credentials.token)


        return credentials;

    }

}


export { profilePermissions }