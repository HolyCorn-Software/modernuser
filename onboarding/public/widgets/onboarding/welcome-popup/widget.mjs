/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget shows a welcome message to newcomers of the platform. That is, those who have recently completed the onboarding phase
 */

import ActionButton from "/$/system/static/html-hc/widgets/action-button/button.mjs"
import HCTSBrandedPopup from "/$/system/static/html-hc/widgets/branded-popup/popup.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";

hc.importModuleCSS()



export default class WelcomePopup extends HCTSBrandedPopup {

    constructor() {
        super(
            {
                content: hc.spawn(
                    {
                        classes: ['hc-cayofedpeople-onboarding-welcome-popup'],
                        innerHTML: `
                            <div class='container'>
                                <div class='title'>Welcome to the Platform</div>
                                <div class='content'>
                                    You are now a member of this online community.<br><br>
                                    Messages have been sent to contact persons, and they will assign you a role. You can get started with using the platform.
                                </div>
                                <div class='actions'></div>
                            </div>
                        `
                    }
                )
            }
        );


        /** @type {ActionButton[]} */ this.actions
        this.pluralWidgetProperty(
            {
                selector: `.${ActionButton.classList.join('.')}`,
                parentSelector: '.container >.actions',
                property: 'actions',
                childType: 'widget'
            }
        );

        this.actions = [
            new ActionButton(
                {
                    content: `Get Started`,
                    onclick: () => {
                        window.location = new URLSearchParams(window.location.search).get('continue') || document.referrer || '/'
                    }
                }
            )
        ]

    }

}