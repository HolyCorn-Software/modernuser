/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People Project
 * 
 * The Modern Faculty of Users
 * This file is responsible for booting up the Faculty
 * 
 */

import collections from "./collections.mjs";
import GroupDataController from "./group/data/controller.mjs";
import GroupMembershipController from "./group/membership/controller.mjs";
import UserProfileController from "./profile/controller.mjs";
import UserAuthenticationController from "./authentication/controller.mjs";
import UserInternalMethods from "./terminals/internal.mjs";
import UserPublicMethods, { profilePermissions } from "./terminals/public.mjs";
import ZonationDataController, { zonation_permissions } from "./zonation/data/controller.mjs";
import ZoneMembershipController from "./zonation/membership/controller.mjs";
import PermissionDataController, { ULTIMATE_PERMISSION } from "./permission/data/controller.mjs";
import PermissionGrantsController, { permissions as grants_permissions } from "./permission/grants/controller.mjs";
import NotificationController from "./notification/controller.mjs";
import OnboardingController from "./onboarding/controller.mjs";
import RoleController, { role_permissions } from "./role/controller.mjs";



const faculty = FacultyPlatform.get();

export default async function init() {



    let http = await HTTPServer.new()

    //Setup the logic (controllers)

    const group_membership_controller = new GroupMembershipController({ collection: collections.group_membership });

    const group_data_controller = new GroupDataController({ collection: collections.group_data });

    const profile_controller = new UserProfileController({ collection: collections.profile })

    const authentication_controller = new UserAuthenticationController({
        collections: {
            token: collections.authentication_tokens,
            login: collections.authentication_logins
        },
        user_profile_controller: profile_controller
    });

    const zonation_data_controller = new ZonationDataController({ collection: collections.zonation_data })

    const zonation_membership_controller = new ZoneMembershipController({ collection: collections.zonation_membership })

    const permission_data_controller = new PermissionDataController({ collection: collections.permission_data })

    const permission_grants_controller = new PermissionGrantsController({
        collection: collections.permission_grants,
        data_controller: permission_data_controller,
        zonation_data_controller: zonation_data_controller
    });



    const role_controller = new RoleController({
        collections: {
            data: collections.role_data,
            roleplay: collections.role_play,
            contact: collections.role_contact
        },
        permission_grants_controller,
        zonation_data_controller
    })

    permission_grants_controller.getUserRoles = (userid) => role_controller.roleplay.getUserRoles(userid)



    const notification_controller = new NotificationController(collections.notification_provider_crendentials, collections.notification_contacts)

    notification_controller.init().then(() => {
        console.log(`Notification Controller initialized!`)
    }).catch(e => {
        console.warn(`Failed to initialize notification controller \n`, e)
    })

    const onboarding_controller = new OnboardingController({
        collection: collections.onboarding_requests,
        notification_controller: notification_controller,
        profile_controller,
        role_contact_controller: role_controller.contact,
        roleplay_controller: role_controller.roleplay
    })


    //Setup public methods
    faculty.remote.public = new UserPublicMethods({
        groups: {
            data: group_data_controller,
            membership: group_membership_controller
        },
        authentication: authentication_controller,
        zonation: {
            membership: zonation_membership_controller,
            data: zonation_data_controller
        },
        profile: profile_controller,
        role: role_controller,
        permissions: {
            data: permission_data_controller,
            grants: permission_grants_controller
        },
        notification: notification_controller,
        onboarding: onboarding_controller
    });

    http.websocketServer.route({
        path: '/',
        callback: (msg, client) => {
            new FacultyPublicJSONRPC(client)
        }
    });

    await faculty.base.shortcutMethods.http.websocket.claim({
        base: {
            point: faculty.standard.publicRPCPoint,
        },
        local: {
            path: '/'
        },
        http
    })


    //Setup internal methods
    const internal_methods = new UserInternalMethods({
        groups: {
            data: group_data_controller,
            membership: group_membership_controller
        },
        authentication: authentication_controller,
        zonation: {
            membership: zonation_membership_controller,
            data: zonation_data_controller
        },
        profile: profile_controller,
        permissions: {
            data: permission_data_controller,
            grants: permission_grants_controller
        },
        role: role_controller
    })
    faculty.remote.internal = internal_methods


    //Claim our share of HTTP traffic

    faculty.base.shortcutMethods.http.claim({
        remotePath: faculty.standard.httpPath,
        localPath: '/',
        http
    });


    // Setup access to static public files


    //Now set the permissions that are ours (modernuser)
    let permissions = [
        ...zonation_permissions,
        ...role_permissions,
        ...grants_permissions,
        ...profilePermissions
    ]

    for (let permission of permissions) {
        await permission_data_controller.createPermission(permission)
    }


    async function isFirstTime() {
        return (await collections.role_data.find().toArray()).length === 0
    }

    if (await isFirstTime()) {

        const engineer_role = await role_controller.data.createRole(
            {
                label: `Engineer`,
                description: `Authorized staff of HolyCorn Software`,
                owners: []
            }
        );

        permission_grants_controller.setPermission(
            {
                subject: engineer_role,
                subject_type: 'role',
                freedom: {
                    grant: true,
                    use: true
                },
                permission: ULTIMATE_PERMISSION.name
            }
        )

        setTimeout(() => {
            console.warn(`This is the first time the system is running, we have created the role of Engineer`)
        }, 2000)


    }


    console.log(`Welcome to ${faculty.descriptor.label.magenta}`)

}



