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
 * zonation_data: import("./zonation/data/types.js").ZoneDataCollection,
 * zonation_membership: import("./zonation/membership/types.js").ZoneMembershipCollection,
 * authentication_tokens: modernuser.authentication.UserAuthTokenCollection,
 * authentication_logins: modernuser.authentication.UserLoginCollection,
 * authentication_provider_credentials: Collection,
 * permission_data: modernuser.permission.PermissionsDataCollection,
 * permission_grants: modernuser.permission.PermissionGrantsCollection,
 * group_data: import("./group/data/types.js").GroupsCollection,
 * group_membership: import("./group/membership/types.js").GroupMembershipCollection,
 * profile: modernuser.profile.UserProfileCollection
 * role_data: modernuser.role.data.RoleDataCollection,
 * role_play: import("./role/membership/types.js").RolePlayCollection,
 * role_contact: import("./role/contact/types.js").RoleContactCollection,
 * onboarding_requests: modernuser.onboarding.OnboardingRequestsCollection
 * notification_templates: modernuser.notification.TemplatesCollection,
 * notification_contacts: modernuser.notification.UserContactsCollection
 * }}
 */
let collections = new CollectionProxy({
    'zonation_data': 'zonation.data',
    'zonation_membership': 'zonation.membership',
    'authentication_tokens': 'authentication.tokens',
    'authentication_provider_credentials': 'authentication.providers.credentials',
    'permission_data': 'permission.data',
    'permission_grants': 'permission.grants',
    'group_data': 'group.data',
    'group_membership': 'group.membership',
    'profile': 'profile',
    'authentication_logins': 'authentication.logins',
    'role_data': 'role.data',
    'role_play': 'role.play',
    'role_contact': 'role.contact',
    'onboarding_requests': 'onboarding.requests',
    'notification_templates': 'notification.templates',
    'notification_contacts': 'notification.contacts',
})

export default collections