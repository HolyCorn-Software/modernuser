/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The contact-input widget
 * This widget (overview) shows the contacts that have been added, with the options to delete or modify them
 */

import ContactInputOverviewItem from "./item.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs"
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class ContactInputOverview extends Widget {

    constructor() {
        super()

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-contact-input-overview'],
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='items'></div>
                        <div class='add-btn'>+</div>
                    </div>
                </div>
            `
        })


        /** @type {function(('new'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        this.html.$('.container >.main >.add-btn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('new'))
        })

        /** @type {import("./types.js").StateData} */ this.statedata
        this.statedata = new AlarmObject()

        this.statedata.providers = []


        /** @type {string[]} A list of providers */ this.__items__
        this.pluralWidgetProperty(
            {
                selector: '.hc-cayofedpeople-contact-input-overview-item',
                parentSelector: '.container >.main >.items',
                property: '__items__',
                transforms: {
                    set: (provider) => {
                        let widget = new ContactInputOverviewItem(provider)
                        widget.addEventListener('highlight', () => {
                            this.statedata.highlight = this.__item_widgets__.findIndex(x => x.html === widget.html)
                        })
                        return widget.html;
                    },
                    get: (html) => {
                        return html?.widgetObject?.provider
                    }
                }
            }
        );

        /** @type {ContactInputOverviewItem[]} */ this.__item_widgets__
        this.pluralWidgetProperty(
            {
                selector: '.hc-cayofedpeople-contact-input-overview-item',
                parentSelector: '.container >.main >.items',
                property: '__item_widgets__',
                childType: 'widget'
            }
        )


        let change_effect_timeout
        const on_providers_change = () => {
            clearTimeout(change_effect_timeout)
            change_effect_timeout = setTimeout(() => {
                this.__items__ = [...this.statedata.providers]
            }, 20) //To prevent over-calling the change method
        }
        this.statedata.$0.addEventListener('providers-change', on_providers_change)

        /** When a single item within the array changes */
        this.statedata.$0.addEventListener('providers-$array-item-change', (event) => {
            const { field } = event?.detail
            if (field !== undefined) {
                if ((this.__items__[field] !== this.statedata[field]) || (typeof this.__items__[field] === 'undefined')) {
                    this.__items__[field] = this.statedata.providers[field]
                }
                do_highlight()
            }
        })

        const do_highlight = () => {
            this.__item_widgets__.forEach((widget, index) => {
                widget.highlighted = (index === this.statedata.highlight)
            })
        }


        this.statedata.$0.addEventListener('highlight-change', () => {
            do_highlight()
        })


    }

}