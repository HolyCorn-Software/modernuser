/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget is a complete login page.
 * It just needs to be instantiated and appended
 */

import LoginWidget from "../login-widget/widget.mjs";
import Footer from "../borrowed/footer/widget.mjs";
import  Navbar  from "../borrowed/navbar/widget.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";



export default class LoginPage extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-login-page'],
            innerHTML: `
                <div class='container login-page-container'>
                    <div class='navbar'></div>
                    <div class='main'></div>
                    <div class='footer'></div>
                </div>
            `
        });


        let struct = {
            navbar: '.hc-donorforms-navbar',
            main: '.hc-cayofedpeople-login',
            footer: '.hc-donorforms-footer',
        }

        /** @type {Navbar} */ this.navbar
        /** @type {LoginWidget} */ this.main
        /** @type {Footer} */ this.footer

        for (let item in struct) {
            this.widgetProperty({
                selector: `${struct[item]}`,
                parentSelector: `.container.login-page-container >.${item}`,
                property: item,
                childType: 'widget',
                immediate: true
            });
        }

        this.navbar = new Navbar()
        this.main = new LoginWidget()
        this.footer = new Footer()



        Object.assign(this, arguments[0]);

    }

}

