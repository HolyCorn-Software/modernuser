/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows a new user to setup certain details, e.g names, photo
 */

import Progress from "./progress.form.multiform.js";
import WelcomePopup from "./welcome-popup/widget.mjs";
import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { ActionButton } from "/$/system/static/lib/hc/action-button/button.js";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";
import { SlideContainer } from "/$/system/static/lib/hc/slide-container/container.mjs";



export default class CAYOFEDOnboarding extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-onboarding'],
            innerHTML: `
                <div class='container'>
                    <div class='title'>Setup your account</div>
                    <div class='navigation'></div>
                    <div class='slider'></div>
                    <div class='action'></div>
                </div>
            `
        });



        /** @type {SlideContainer} */ this.slider
        this.widgetProperty(
            {
                selector: '.' + SlideContainer.classList.join('.'),
                parentSelector: '.container >.slider',
                property: 'slider',
                childType: 'widget',
            }
        );


        this.slider = new SlideContainer()


        /** @type {ActionButton} */ this.action
        this.widgetProperty(
            {
                selector: '.' + ActionButton.classList.join("."),
                parentSelector: '.container >.action',
                childType: 'widget',
                property: 'action'
            }
        );

        /** @type {Progress} */ this.navigation
        this.widgetProperty(
            {
                selector: '.hc-multiform-progress',
                parentSelector: '.container >.navigation',
                childType: 'widget',
                property: 'navigation'
            }
        );
        this.navigation = new Progress({ enums: ['a', 'b', 'c'], length: 3 })

        this.navigation.addEventListener('value_change', (ev) => {
            this.navigation.silent_value = this.slider.index = Math.min(this.navigation.value, this.max_screen_index)
            this.action.content = this.navigation.value === this.navigation.length - 1 ? `Complete` : `Next`
        })


        this.action = new ActionButton({
            content: 'Next',
            onclick: () => {
                try {
                    this.slider.screens[this.navigation.value].widgetObject.isComplete();

                    if (this.navigation.value === this.navigation.length - 1) {
                        // setTimeout(()=> window.location = '/', 1000);
                        muserRpc.modernuser.onboarding.onboard(this.value).then(() => this.postOnboarding(), (e) => {
                            handle(e)
                        })
                    } else {
                        this.navigation.value = Math.min(this.navigation.value + 1, this.navigation.length - 1)
                    }
                } catch (e) {
                    handle(e)
                }
            }
        });


        this.waitTillDOMAttached().then(() => this.begin())



    }
    postOnboarding() {
        new WelcomePopup().show()
    }

    async begin() {

        const names_screen = new (await import('./screens/names/screen.mjs')).default
        const role_screen = new (await import('./screens/role/screen.mjs')).default
        const contact_screen = new (await import('./screens/contact/screen.mjs')).default


        this.slider.screens = [
            names_screen.html,
            role_screen.html,
            contact_screen.html
        ]


        this.navigation.value = 0

        /** @type {import("faculty/modernuser/onboarding/types.js").OnboardingInputData} */ this.value
        Reflect.defineProperty(this, 'value', {
            /**
             * 
             * @returns {import("faculty/modernuser/onboarding/types.js").OnboardingInputData}
             */
            get: () => {
                return {
                    profile: {
                        icon: names_screen.value.icon,
                        label: names_screen.value.label
                    },
                    roles: role_screen.value,
                    notification: contact_screen.value
                }
            },
            enumerable: true,
            configurable: true
        })
    }


    get max_screen_index() {
        let max = 0;

        for (max = 0; max < this.slider.screens.length; max++) {
            let widget = this.slider.screens[max].widgetObject
            try {
                if (!widget.isComplete()) {
                    break; //If the widget returns false, then we stop
                }
            } catch (e) {
                break; //And if the widget throws an error, we still stop
            }
        }

        return max;
    }

}