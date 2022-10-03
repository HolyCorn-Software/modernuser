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
 * authentication_tokens: import("./authentication/types.js").UserAuthTokenCollection,
 * authentication_logins: import("./authentication/types.js").UserLoginCollection,
 * authentication_provider_credentials: Collection,
 * permission_data: import("./permission/data/types.js").PermissionsDataCollection,
 * permission_grants: import("./permission/grants/types.js").PermissionGrantsCollection,
 * group_data: import("./group/data/types.js").GroupsCollection,
 * group_membership: import("./group/membership/types.js").GroupMembershipCollection,
 * profile: import("./profile/types.js").UserProfileCollection
 * role_data: import("./role/data/types.js").RoleDataCollection,
 * role_play: import("./role/membership/types.js").RolePlayCollection,
 * role_contact: import("./role/contact/types.js").RoleContactCollection,
 * notification_provider_crendentials: Collection<{name: string}>,
 * notification_contacts: import("./notification/types.js").UserContactsCollection
 * onboarding_requests: import("./onboarding/types.js").OnboardingRequestsCollection
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
    'notification_provider_crendentials': 'notification.providers.credentials',
    'notification_contacts': 'notification.contacts',
    'onboarding_requests': 'onboarding.requests'
})


export default collections