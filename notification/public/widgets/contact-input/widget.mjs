/**
 * Copyright 2024 HolyCorn Software
 * The Modern Faculty of Users
 * This widget allows someone to input contacts
 */

import hcRpc from "/$/system/static/comm/rpc/aggregate-rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import AlarmObject from "/$/system/static/html-hc/lib/alarm/alarm.mjs";
import DelayedAction from "/$/system/static/html-hc/lib/util/delayed-action/action.mjs";
import { Widget, hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs";
import HCTSBrandedPopup from "/$/system/static/html-hc/widgets/branded-popup/popup.mjs";
import MultiFlexForm from "/$/system/static/html-hc/widgets/multi-flex-form/flex.mjs";



export default class ContactInput extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {string} param0.label
     * @param {string} param0.name
     * @param {ContactInput['value']} param0.value
     */
    constructor({ label, name, value } = {}) {
        super()

        super.html = hc.spawn({
            classes: ContactInput.classList,
            innerHTML: `
                <div class='container'>
                    <div class='label'>Contact Input</div>
                    <div class='main'>
                        <div class='icon'></div>
                        <div class='caption'>Tap to add contact</div>
                    </div>
                </div>
            `
        });

        /** @type {string} */ this.label
        this.htmlProperty(':scope >.container >.label', 'label', 'innerText')
        /** @type {string} */ this.name

        /** @type {modernuser.ui.notification.contact_input.Statedata} */ this.statedata = new AlarmObject({ abortSignal: this.destroySignal })



        /** @type {string} */ this.icon
        this.defineImageProperty({
            selector: ':scope >.container >.main >.icon',
            mode: 'inline',
            property: 'icon'
        });

        /** @type {HCTSBrandedPopup} */
        let popup

        this.html.addEventListener('click', () => {
            (popup ||= (() => {
                return new HCTSBrandedPopup(
                    {
                        content: (() => {
                            const widget = new ContactInput.PopupContent(this.statedata)
                            widget.addEventListener('done', () => {
                                popup.hide()
                                popup = null
                            })

                            setTimeout(() => {
                                widget.refresh()
                            }, 250)

                            return widget
                        })().html
                    }
                )
            })()).show()
        });

        this.statedata.$0.addEventListener('contact-change', () => {
            setTimeout(() => {
                this.dispatchEvent(new CustomEvent('change'))
                onProviderChange()
                onCaptionChange()
            }, 250)
        })
        /** @type {(event: 'change', cb: (event: CustomEvent)=> void, opts?:AddEventListenerOptions)=> void} */ this.addEventListener

        const onCaptionChange = () => {
            this.html.$(':scope >.container >.main >.caption').innerHTML = this.value?.caption
        }
        this.statedata.$0.addEventListener('contact.caption-change', onCaptionChange);

        const onProviderChange = () => {
            if (!this.statedata.contact.provider) return;
            this.icon = `/$/modernuser/$plugins/${this.statedata.contact.provider}/@public/icon.png`
        }
        this.statedata.$0.addEventListener('contact.provider-change', onProviderChange)

        Object.assign(this, arguments[0])



    }

    static PopupContent = class extends Widget {

        /**
         * 
         * @param {ContactInput['statedata']} statedata 
         */
        constructor(statedata) {
            super();

            super.html = hc.spawn({
                classes: ContactInput.PopupContent.classList,
                innerHTML: `
                    <div class='container'>
                        <div class='select-provider'>
                            <div class='label'>Select Type of Contact</div>
                            <div class='main'></div>
                        </div>
                        <div class='form'></div>
                        <div class='action'></div>
                    </div>
                `
            });

            const onProviderchange = new DelayedAction(() => {
                this.dispatchEvent(new CustomEvent('provider-change'))
            }, 250)
            /** @type {(event: 'provider-change'|'done', cb: (event: CustomEvent)=> void, opts?:AddEventListenerOptions)=> void} */ this.addEventListener

            /** @type {string[]} */ this.providers
            this.pluralWidgetProperty({
                selector: ['', ...ContactInput.PopupContent.ProviderItem.classList].join("."),
                parentSelector: ':scope >.container >.select-provider >.main',
                transforms: {
                    set: (input) => {
                        const itemW = new ContactInput.PopupContent.ProviderItem(input);
                        itemW.html.addEventListener('click', () => {
                            if (itemW.html.classList.contains('selected')) {
                                this.providerWidgets.forEach(wid => wid.html != itemW.html ? wid.html.classList.remove('selected') : undefined)
                                setTimeout(() => {
                                    (this.statedata.contact ||= {}).provider = input
                                    onProviderchange();
                                }, 250)
                            }
                        })
                        return itemW.html
                    },
                    get: ({ widgetObject: widget }) => widget.provider
                },
            }, 'providers');

            /** @type {(typeof ContactInput)['PopupContent']['ProviderItem']['prototype'][]} */ this.providerWidgets

            this.pluralWidgetProperty({
                selector: ['', ...ContactInput.PopupContent.ProviderItem.classList].join("."),
                parentSelector: ':scope >.container >.select-provider >.main',
                childType: 'widget'
            }, 'providerWidgets');

            /** @type {MultiFlexForm} */ this.form
            this.widgetProperty({
                parentSelector: ":scope >.container >.form",
                selector: ['', ...MultiFlexForm.classList].join("."),
                childType: 'widget'
            }, 'form');

            this.form = new MultiFlexForm();

            const done = new ActionButton({
                content: `Save`,
                onclick: async () => {
                    try {
                        // The process of captioning the contact too would validate the correctness of the contact.
                        this.statedata.contact.caption = (await hcRpc.modernuser.notification.captionContact({ contact: this.statedata.$0data.contact })).html
                        this.dispatchEvent(new CustomEvent('done'))
                    } catch (e) {
                        handle(e)
                    }
                },
                state: 'disabled'
            })

            this.html.$(':scope >.container >.action').appendChild(done.html)

            /** @type {modernuser.ui.notification.contact_input.Statedata} */ this.statedata = statedata

            const updateFormStructure = () => {
                this.form.quickStructure = this.statedata.providers.find(x => x.name == this.statedata.$0data.contact?.provider)?.contactForm || []
                setTimeout(() => this.form.values = this.statedata.contact?.data, 250)
            }
            this.addEventListener('provider-change', updateFormStructure)

            this.form.addEventListener('change', () => {
                done.state = Reflect.ownKeys(this.form.value).some(key => this.form.value[key]) ? 'initial' : 'disabled';
                (this.statedata.$0data.contact ||= {}).data = this.form.value
            })

            this.statedata.$0.addEventListener('providers-change', () => {
                this.providers = this.statedata.$0data.providers.map(x => x.name)
            });

            const contactProviderChange = () => {
                setTimeout(() => {
                    this.providerWidgets.forEach(provider => provider.html.classList.toggle('selected', provider.provider == this.statedata.$0data.contact?.provider))
                }, 250)
            }

            this.statedata.$0.addEventListener('contact.provider-change', contactProviderChange)

            this.refresh = () => {
                contactProviderChange()
                updateFormStructure()
            }

            this.blockWithAction(async () => {
                this.statedata.providers = await hcRpc.modernuser.notification.getProviders()
            })


        }

        static ProviderItem = class extends Widget {

            /**
             * 
             * @param {string} provider 
             */
            constructor(provider) {
                super();

                super.html = hc.spawn({
                    classes: ContactInput.PopupContent.ProviderItem.classList,
                    innerHTML: `
                        <div class='container'>
                            <div class='icon'></div>
                        </div>
                    `
                });

                this.html.addEventListener('click', () => {
                    this.html.classList.toggle('selected')
                })

                /** @type {string} */ this.provider

                const icon = Symbol()

                this.defineImageProperty({
                    selector: ':scope >.container >.icon',
                    property: icon,
                    mode: 'background',
                })

                Reflect.defineProperty(this, 'provider', {
                    set: (v) => {
                        this[icon] = `/$/modernuser/$plugins/${v}/@public/icon.png`
                    },
                    get: () => this[icon]?.split('$plugins')[1]?.split('/@public')[0]?.split('/')[1],
                    configurable: true,
                    enumerable: true
                })

                this.provider = provider
            }

            /** @readonly */
            static classList = ['hc-modernuser-notification-contact-input-popup-content-provider']
        }

        /** @readonly */
        static classList = ['hc-modernuser-notification-contact-input-popup-content']
    }

    set value(value) {
        this.statedata.contact = value
    }

    get value() {
        return this.statedata.$0data.contact
    }

    /** @readonly */
    static classList = ['hc-modernuser-notification-contact-input']

}