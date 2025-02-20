/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget is used to display a user's profile smooth easy way for developers
 */

import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";


hc.importModuleCSS(import.meta.url)

export default class InlineUserProfile extends Widget {


    /**
     * 
     * @param {object} param0 
     * @param {string} param0.id
     * @param {string} param0.label
     * @param {string} param0.icon
     */
    constructor({ id, label, icon } = {}) {

        super();


        super.html = hc.spawn({
            classes: InlineUserProfile.classList,
            innerHTML: `
                <div class='container'>
                    <div class='main'>
                        <div class='icon'></div>
                        <div class='label'></div>
                    </div>
                </div>
            `
        });


        /** @type {string} */ this.icon;
        this.defineImageProperty(
            {
                selector: '.container >.main >.icon',
                property: 'icon',
                mode: 'background',
                fallback: '/$/shared/static/logo.png',
            }
        )

        /** @type {string} */ this.label
        this.htmlProperty('.container >.main >.label', 'label', 'innerHTML')

        /** @type {string} */ this.id

        Object.assign(this, arguments[0])



    }
    static get classList() {
        return ['hc-hcts-modernuser-inline-profile']
    }

}