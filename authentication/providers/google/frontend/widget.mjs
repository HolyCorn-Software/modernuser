/**
 * Copyright 2022 HolyCorn Software
 * This widget is a custom google sign in button
 * Reason for this custom button is to have a button with a large enough width
 */

import LoginProviderWidget from "../../../lib/widget-model.mjs";
import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import { Spinner } from "/$/system/static/lib/hc/infinite-spinner/spinner.js";
import { hc } from "/$/system/static/lib/hc/lib/index.js";


hc.importModuleCSS(import.meta.url);

export default class GoogleAuthenticationWidget extends LoginProviderWidget {


    constructor() {
        super();
        super.html = hc.spawn({
            classes: ['hc-cayofedpeople-google-widget'],
            innerHTML: `
                <div class='container'>
                    <div class='img'></div>
                    <div class='text'>Sign In with Google</div>
                </div>
            `
        });

        /** @type {function(('complete'), function(CustomEvent<{token: string}>), AddEventListenerOptions)} */ this.addEventListener

        this.render();
    }

    #loader_spinner;

    async loadBlock() {
        (this.#loader_spinner ||= new Spinner()).stop()
        this.#loader_spinner.start()
        this.#loader_spinner.attach(this.html.$('.container'))

    }

    async loadUnblock() {
        this.#loader_spinner?.detach()
        this.#loader_spinner?.stop();
    }

    async login({ token }) {
        this.__token__ = token;
        this.dispatchEvent(new CustomEvent('complete', { detail: token }))
    }


    async render() {

        await this.waitTillDOMAttached()

        this.loadBlock()

        try {

            /** @type {import('../backend/remote/public.mjs').default} */
            const googleRpc = muserRpc.modernuser.authentication.providers.google

            await Promise.all(
                [
                    hc.importJS('https://accounts.google.com/gsi/client'),
                    (async () => this.client_id = await googleRpc.getClientID())()
                ]
            );

            let clickable = hc.spawn({})

            this.html.addEventListener('click', () => {
                clickable.$('* > * > * >*').click()

            })


            google.accounts.id.initialize({
                client_id: this.client_id,
                callback: ({ credential }) => {
                    this.login({ token: credential })
                }
            })


            google.accounts.id.renderButton(clickable, {
                theme: 'outline',
                size: 'large',
                width: 800,
                height: 60
            });



        } catch (e) {
            handle(e)
        }
        this.loadUnblock();
    }

    onSystemAction({ action, data }) {
        alert(`Login successful`)
    }

    /**
     * @param {('login'|'signup'|'reset')} face
     */
    set face(face) {
        this.html.classList[face === 'login' || face === 'account_share' ? 'remove' : 'add']('disabled')
    }

    get values() {
        return { token: this.__token__ }
    }


}