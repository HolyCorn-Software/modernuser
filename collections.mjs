/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module controls and streamlines access to database collections
 */

import { Collection } from "mongodb";
import { CollectionProxy } from "../../system/database/collection-proxy.js";



/**
 * @type {{
 * zonation: modernuser.zonation.Collections
 * authentication_tokens: modernuser.authentication.UserAuthTokenCollection,
 * authentication_logins: modernuser.authentication.UserLoginCollection,
 * authentication_provider_credentials: Collection,
 * permission: modernuser.permission.PermissionCollections,
 * group_data: modernuser.group.GroupsCollection
 * group_membership: import("./group/membership/types.js").GroupMembershipCollection,
 * profile: modernuser.profile.UserProfileCollection
 * role: modernuser.role.Collections,
 * onboarding_requests: modernuser.onboarding.OnboardingRequestsCollection,
 * rolegroups: modernuser.rolegroup.RoleGroupCollection,
 * notification: modernuser.notification.Collections
 * }}
 */
let collections = new CollectionProxy({
    'zonation': {
        'data': 'zonation.data',
        'membership': 'zonation.membership',
    },
    'authentication_tokens': 'authentication.tokens',
    'authentication_provider_credentials': 'authentication.providers.credentials',
    'permission': {
        'data': 'permission.data',
        'grants': 'permission.grants',
    },
    'group_data': 'group.data',
    'group_membership': 'group.membership',
    'profile': 'profile',
    'authentication_logins': 'authentication.logins',
    'role_contact': 'role.contact',
    'role': {
        'roleplay': 'role.play',
        'data': 'role.data',
        'contact': 'role.contacts',
    },
    'onboarding_requests': 'onboarding.requests',
    'rolegroups': 'rolegroup.rolegroups',
    'notification': {
        'templates': 'notification.templates',
        'contacts': 'notification.contacts',
        'jobs': 'notification.jobs',
        'inApp': {
            'read': 'notification.inApp.read',
            'unread': 'notification.inApp.unread'
        }

    }

})

export default collections