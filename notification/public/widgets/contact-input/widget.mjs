/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * The Notification module
 * This widget allows a user to enter his preferred means of contact
 */

import ContactInputItem from "./item.mjs";
import ContactInputOverview from "./overview/overview.mjs";
import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs"
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


export default class ContactInput extends Widget {



    /**
     * 
     * @param {object} param0 
     * @param {string} param0.label
     * @param {string} param0.name Pretty optional parameter. This parameter is simply stored within the widget and changes nothing
     */
    constructor({ label, name } = {}) {
        super();

        this.html = hc.spawn(
            {
                classes: ['hc-cayofedpeople-notification-contact-input'],
                innerHTML: `
                    <div class='container'>
                        <div class='label'>Select your preferred means of contact</div>
                        <div class='overview-section'></div>
                        <div class='icons-select'></div>
                        <div class='content-section'></div>
                    </div>
                `
            }
        );

        /** @type {import("./types.js").StateData} */ this.statedata
        this.statedata = new AlarmObject()
        this.statedata.contacts = []

        /** @type {string} */ this.label
        this.htmlProperty('.container >.label', 'label', 'innerHTML')


        /** @type {HTMLElement} */ this.contentHTML
        this.widgetProperty(
            {
                selector: '*',
                parentSelector: '.container >.content-section',
                childType: 'html',
                property: 'contentHTML'
            }
        )


        /** @type {[ContactInputItem]} */ this.providerWidgets
        this.pluralWidgetProperty(
            {
                selector: '.hc-cayofedpeople-notification-contact-input-item',
                parentSelector: '.container >.icons-select',
                property: 'providerWidgets',
                childType: 'widget'
            }
        )



        /** @type {[{icon: string, path:string, selected: boolean, label: string}]} */ this.providers
        this.pluralWidgetProperty(
            {
                selector: '.hc-cayofedpeople-notification-contact-input-item',
                parentSelector: '.container >.icons-select',
                property: 'providers',
                transforms: {
                    set: (data) => {
                        let widget = new ContactInputItem({ ...data });
                        //Now load the ui for that provider
                        widget.waitTillDOMAttached().then(() => {
                            widget.loadUI(data)
                        })

                        widget.checkbox.addEventListener('change', () => {

                            if (widget.checkbox.value == true) {

                                for (let other of this.providerWidgets) {
                                    if (other !== widget) {
                                        other.checkbox.silent_value = false
                                    }
                                }

                                this.contentHTML = widget.contentHTML

                                if (typeof this.statedata.contact_edit_index !== 'undefined') {
                                    this.statedata.contacts[this.statedata.contact_edit_index] = {
                                        data: widget.value = {},
                                        provider: widget.provider
                                    }

                                }
                            }
                        });

                        const update_data = () => {

                            this.statedata.contacts[this.statedata.contact_edit_index] = {
                                data: widget.value,
                                provider: widget.provider
                            }
                        }

                        let update_timeout


                        widget.addEventListener('change', () => {
                            clearTimeout(update_timeout)
                            update_timeout = setTimeout(() => update_data(), 500)
                        })


                        return widget.html
                    },
                    get: (html) => {
                        /** @type {ContactInputItem} */
                        const widget = html?.widgetObject
                        return {
                            icon: widget.icon,
                            path: widget.path,
                            selected: widget.selected
                        }
                    }
                }
            }
        );

        /** @type {ContactInputOverview} */ this.overview
        this.widgetProperty(
            {
                selector: `.hc-cayofedpeople-contact-input-overview`,
                parentSelector: `.container >.overview-section`,
                property: 'overview',
                childType: 'widget',
            }
        )
        this.overview = new ContactInputOverview()

        const contacts_on_change = () => {
            this.overview.statedata.providers = this.statedata.contacts.map(x => x.provider)
            this.statedata.contact_edit_index ??= 0;
        }
        this.statedata.$0.addEventListener('contacts-change', contacts_on_change)
        this.statedata.$0.addEventListener('contacts-$array-item-change', (event) => {
            // this.overview.statedata.providers ||= this.statedata.contacts.map(x => x.provider)
            if (this.overview.statedata.providers[0] !== this.statedata.contacts[event.detail.field]) {
                this.overview.statedata.providers[event.detail.field] = this.statedata.contacts[event.detail.field].provider
            }
        })

        this.create_new_contact = () => {
            this.statedata.contacts.push({
                data: {},
                provider: this.providerWidgets[this.providerWidgets.length - 1].provider
            });

            this.overview.statedata.highlight = this.statedata.contacts.length - 1;
        }

        this.overview.addEventListener('new', this.create_new_contact);

        this.overview.statedata.$0.addEventListener('highlight-change', () => {
            //If the user clicked on a contact, then we make that contact the subject of our editing
            this.statedata.contact_edit_index = this.overview.statedata.highlight;
        })

        this.statedata.$0.addEventListener('contact_edit_index-change', () => {
            //When the contact we're editing changes, we update the UI accordingly
            const selected_contact = this.statedata.contacts[this.statedata.contact_edit_index];
            const selected_contact_provider_widget = this.providerWidgets.find(x => x.provider === selected_contact.provider);

            setTimeout(() => {

                try {
                    //So let's make the given provider the selected provider
                    selected_contact_provider_widget.selected = true
                    selected_contact_provider_widget.value = selected_contact.data
                } catch (e) {
                    console.log(`The error `, e, `\nOccurred. And the selected contact is `, selected_contact)
                }

            }, 50)
        })




        Object.assign(this, arguments[0])

        this.populateUI()

    }



    async populateUI() {
        this.loadBlock();

        try {


            //Fetch all providers
            let providers = await muserRpc.modernuser.notification.getProviders()
            this.providers = providers.map(x => {
                return {
                    provider: x.name,
                    icon: `/$/modernuser/notification/providers/${x.name}/public/icon.png`,
                    path: `/$/modernuser/notification/providers/${x.name}/public/input-widget.mjs`,
                    label: x.label
                }
            });

            await Promise.race( //For any of the providers that load first...
                this.providerWidgets.map(x => x.ready())
            )

            //Create a new contact if necessary (This is for reasons of user experience. Instead of allowing the user to discover the create button)
            //Because, he might never find it
            setTimeout(async () => {

                if (this.statedata.contacts.length === 0) {
                    this.create_new_contact()
                }
            }, 500)

        } catch (e) {
            handle(e)
        }

        this.loadUnblock()
    }


    /**
     * @returns {[import("faculty/modernuser/notification/types.js").ContactData]}
     */
    get value() {
        return this.statedata.contacts
    }
    set value(v) {
        this.statedata.contacts = [...v]
    }


}