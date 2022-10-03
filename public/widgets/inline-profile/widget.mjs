/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget is used to display a user's profile smooth easy way for developers
 */

import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";


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


        this.html = hc.spawn({
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


        /** @type {string} */ this.icon
        Reflect.defineProperty(this, 'icon', {
            get: () => /url('(.+)')/.exec(this.html.style.getPropertyValue('--image'))[1],
            set: v => {
                //When setting the image url, calculate it relative to the caller
                this.html.style.setProperty('--image', `url('${new URL(v, hc.getCaller(1)).href}')`)
            },
            enumerable: true,
            configurable: true
        });

        /** @type {string} */ this.label
        this.htmlProperty('.container >.main >.label', 'label', 'innerHTML')

        /** @type {string} */ this.id

        Object.assign(this, arguments[0])



    }
    static get classList() {
        return ['hc-hcts-modernuser-inline-profile']
    }

}