/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * This module contains type definitions for the notification module in the faculty
 * 
 * Updated 2023 to support plugins
 */

import { Collection } from 'mongodb'
import _NotificationPlugin from './plugin/model.mjs'





global {
    class NotificationPlugin<CredentialsType, ContactStructure> extends _NotificationPlugin<CredentialsType, ContactStructure> { }



    namespace modernuser {

        namespace notification {

            /**
             * This data structure defines the information contained in a template
             */
            interface Template {
                /** A unique name for the template */
                name: string

                /** A user-friendly name for the template, especially useful
                 * for the developer
                 */
                label: string

                /**
                 * This object can contain an arbitary set of properties
                 * 
                 * These fields are created by the template creator, 
                 * and if the plugin detects a field it knows, it is going to use the data
                 * of the field, when sending a message with this template.
                 * So, everything here is based on convention
                 * Standard fields such as text, and html are used by multiple plugins.
                 */
                fields: {
                    [language: string]: modernuser.plugins.notification.TemplatesGlobal & {
                        text: string
                        html: string
                        inApp: InAppNotificationInput
                    }
                }
            }

            /**
             * This is the type of data that is returned from a plugin,
             * when it is asked to approve a template
             */
            interface TemplateReviewResult {

                /** If the template can be used by the plugin */
                usable: boolean

                /** Does the template meet the requirements of the plugin? (Obviously it should be usable first) */
                correct: boolen

                /** If the template is not correct, this field should describe what the problem is */
                remark: string

            }

            /**
             * This is data about a user's contact
             */
            interface Contact<T = {}> {
                id: string
                provider: string
                data: T
                userid: string
            }

            type MinContactData<T> = Pick<Contact<T>, "data" | "provider">

            /**
             * This is the structure of the data returned by a plugin, when asked to review a contact
             */
            interface ContactReviewResult {
                /** This tells us if the contact data is correct */
                valid: boolean
                /** This message is added when the validity is false, to indicate why */
                message: string
            };

            /**
             * This data structure defines the caption data of a contact.
             * 
             * "text" should be a short one-line universal representation of the contact.
             * 
             * "html" can be any fancy representation of the contact, displayable in browser environments.
             */
            interface ContactCaption {
                text: string
                html: string
            }

            interface ContactExtra extends Contact {
                caption: ContactCaption
            }


            interface InAppNotification extends InAppNotificationInput {
                id: string
                target: string
                time: number
                expires: number
                seen: number
            }

            interface InAppNotificationInput {
                title: string
                caption: string
                icon?: string
                html?: string
                text: string
            }


            type UserContactsCollection = Collection<Contact>;

            type TemplatesCollection = Collection<Template>

            interface NotificationJob {
                userid: string
                template: string
                language: string
                data: string[]
            }

            type NotificationJobsCollection = soul.util.workerworld.TaskCollection<NotificationJob>
            type InAppNotificationsCollection = Collection<InAppNotification>
            interface InAppNotificationsCollections {
                read: InAppNotificationsCollection
                unread: InAppNotificationsCollection
            }


            interface Collections {
                contacts: UserContactsCollection
                jobs: NotificationJob,
                inApp: InAppNotificationsCollections
                templates: TemplatesCollection
            }

        }
    }
    namespace modernuser.permission {
        interface AllPermissions {
            'permissions.modernuser.notification.contacts.view': true
            'permissions.modernuser.notification.contacts.modify': true
            'permissions.modernuser.notification.inApp.markRead': true
            'permissions.modernuser.notification.inApp.read': true
            'permissions.modernuser.notification.inApp.delete': true
        }
    }
    namespace modernuser.plugins.notification {

        /**
         * Notification plugins should override this interface to provide information about the data needed to create its
         * compatible plugin
         */
        interface TemplatesGlobal {

        }
    }


    namespace modernuser.ui.notification {
        interface ClientFrontendEvents {
            'modernuser-notification-new-inApp-notification': modernuser.notification.InAppNotification
        }
    }
}


export class EventServer extends JSONRPC.EventChannel.Server<undefined> { }