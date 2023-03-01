/**
 * Copyright 2022 HolyCorn Software
 * The Donor Forms Project
 * This widget is a popup that helps the admin create a new payment
 */
import UserAndRoleInput from "../../../user-n-role-input/widget.mjs";
import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import DualSwitch from "/$/system/static/html-hc/widgets/dual-switch/switch.mjs";
import PopupForm from "/$/system/static/html-hc/widgets/popup-form/form.mjs";


export class PermissionGrantPopup extends PopupForm {

    constructor() {
        super({
            form: [
                [
                    {
                        label: `Permission`,
                        name: 'permission',
                        type: 'customWidget',
                        customWidgetUrl: "/$/modernuser/static/widgets/permission-input/widget.mjs",
                    }
                ],
                [
                    {
                        label: `View`,
                        name: `is_role`,
                        type: 'customWidget',
                        customWidgetUrl: "/$/system/static/html-hc/widgets/dual-switch/switch.mjs",
                        positive: `Roles`,
                        negative: `Users`
                    }
                ],
                [
                    {
                        label: 'User',
                        name: 'subject',
                        type: 'customWidget',
                        customWidgetUrl: '/$/modernuser/static/widgets/user-n-role-input/widget.mjs',
                        mode: 'user'
                    }
                ],
                [
                    {
                        label: 'Expiry',
                        name: 'expiry_date',
                        type: 'date'
                    }
                ],
                [
                    {
                        label: 'Zone',
                        name: 'zone',
                        type: 'customWidget',
                        customWidgetUrl: '/$/modernuser/static/widgets/zone-input/widget.mjs'
                    }
                ]
            ],
            caption: `To avoid mistakes verify the userid or roleid before granting.`,
            title: `Granting a permission`,
            positive: `Grant`,
            negative: `Go back`
        });


        this.addEventListener('complete', () => {
            this.submit()
        });


        this.ready().then(() => {

            this.is_role_switch?.addEventListener('change', () => {
                this.subject_input.mode = this.is_role_switch.value ? 'roles' : 'users'
                this.subject_input.label = this.is_role_switch.value ? `Role` : `User`

                const user_fields = ['expiry_date', 'zone']

                for (let field of user_fields) {

                    this.formWidget[this.is_role_switch.value ? 'hide_field' : 'show_field'](field)
                }

            });

            this.is_role_switch.value = false;
        })


        /** @type {function(('create'), function({detail: object}&CustomEvent), AddEventListenerOptions)} */ this.addEventListener

    }

    /***
     * @returns {UserAndRoleInput}
     */
    get subject_input() {
        return this.formWidget.fieldWidgets.filter(x => x.name === 'subject')[0]?.html.$('.' + UserAndRoleInput.classList.join('.'))?.widgetObject
    }

    /**
     * @returns {DualSwitch}
     */
    get is_role_switch() {
        return this.formWidget.fieldWidgets.filter(x => x.name === 'is_role')[0]?.html.$('.hc-dual-switch').widgetObject
    }

    /**
     * @returns {import("../listings/types.js").FrontendUserPermissions}
     */
    get value() {

        return {
            subject: this.subject_input.value,
            permissions: [
                {
                    name: super.value.permission,
                    freedom: {
                        use: true,
                        grant: false
                    },
                    ...(() => {
                        if (this.is_role_switch.value) {
                            return
                        }
                        return {
                            expires: new Date(super.value.expiry_date).valueOf(),
                            zone: super.value.zone,
                        }
                    })()
                }
            ]
        }
    }

    ready() {
        return new Promise((resolve, reject) => {
            let interval_key = setInterval(() => {
                if (this.html.isConnected && this.is_role_switch) {
                    clearInterval(interval_key)
                    resolve()
                }
            }, 500)
        })
    }

    async submit() {
        if (this[submit_lock_symbol]) {
            return;
        }

        this[submit_lock_symbol] = true;
        this.positiveButton.state = 'waiting';

        try {


            
            await muserRpc.modernuser.permissions.grants.grantPermissions(this.value)
            this.positiveButton.state = 'success'
            
            setTimeout(() => this.hide(), 900);

            this.dispatchEvent(new CustomEvent('create'))

        } catch (e) {
            console.log(e)
            handle(e)
            setTimeout(() => this.positiveButton.state = 'initial', 1000)
        }
        this[submit_lock_symbol] = false;

    }

}


const submit_lock_symbol = Symbol(`PermissionGrantPopup.prototype.submit_lock`)