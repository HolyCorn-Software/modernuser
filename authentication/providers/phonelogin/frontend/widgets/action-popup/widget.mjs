/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * The Modern Faculty of Users
 * 
 * This widget is owned by the phonelogin provider
 * 
 * It accomplishes one thing... Shows the user a loading UI while something is ongoing in the background
 * When done, the loading UI stops
 */



import { handle } from "/$/system/static/errors/error.mjs";
import { ActionButton } from "/$/system/static/lib/hc/action-button/button.js";
import { HCTSBrandedPopup } from "/$/system/static/lib/hc/branded-popup/popup.js";
import { Spinner } from "/$/system/static/lib/hc/infinite-spinner/spinner.js";
import { hc } from "/$/system/static/lib/hc/lib/index.js";
import { Widget } from "/$/system/static/lib/hc/lib/widget.js";


export default class ActionPopup extends HCTSBrandedPopup {

    /**
     * 
     * @param {object} param0
     * @param {()=>Promise<void>} param0.action The action to be done by the popup
     * @param {{pending:string, complete:string}} param0.strings
     */
    constructor({ action, strings, done } = {}) {
        super();

        let content_widget = new ActionPopupContent({ action, strings });

        done ||= () => {
            window.location = `/$/modernuser/static/login/`
        }

        content_widget.addEventListener('done', () => {
            this.hide()
            let success_popup = new HCTSBrandedPopup({
                content: hc.spawn({
                    innerHTML: strings?.complete || `Your account has been activated. We're taking you back to the login page.`
                })
            });
            success_popup.show();
            success_popup.addEventListener('hide', done)
            setTimeout(done, 2000);
        });

        content_widget.addEventListener('error', (event) => {

            handle(event.detail);
        })

        this.content = content_widget.html

        this.hideOnOutsideClick = false;
    }

}


export class ActionPopupContent extends Widget {

    /**
    * 
    * @param {object} param0
    * @param {()=>Promise<void>} param0.action The action to be done by the popup
    * @param {{pending:string, complete:string}} param0.strings
    */
    constructor({ action, strings }) {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-phonelogin-action-popup-content'],
            innerHTML: `
                <div class='container'>
                    <div class='caption'>${strings?.pending || 'Activating your account, please wait'}</div>
                    <div class='main'></div>
                </div>
            `
        });

        /** @type {[HTMLElement]} */ this.content
        this.pluralWidgetProperty({
            selector: '*',
            parentSelector: '.container >.main',
            property: 'content',
            childType: 'html'
        });

        /** @type {string} */ this.caption
        this.htmlProperty('.container >.caption', 'caption', 'innerHTML')


        /** @type {Spinner} */ this.spinner

        /** @type {function(('done'|'error'), function(CustomEvent), AddEventListenerOptions)} */ this.addEventListener


        this.action = action || this.action

        this.#execute()
    }

    start_loadAnim() {
        this.spinner ??= new Spinner()

        this.spinner.start();

        this.spinner.attach(this.html.$('.main'))
    }

    stop_loadAnim() {
        this.spinner?.detach()
        this.spinner?.stop();
    }

    async action() {
        throw new Error(`Engineering error.\n<br>\nNo action() method was defined for an instance of the ActionPopupContent widget`)
    }


    async #execute() {
        this.start_loadAnim()

        try {
            await this.action()
            this.dispatchEvent(new CustomEvent('done'))
        } catch (e) {
            let retry_widget = new ActionButton({ content: 'Try Again' });
            this.caption = `There was an error<br>${e.message}`;

            this.dispatchEvent(new CustomEvent('error', { detail: e }))

            this.content = [retry_widget.html];

            retry_widget.onclick = () => {
                console.log(`retrying...`)
                this.#execute()
            }

        }

        this.stop_loadAnim()
    }

}


