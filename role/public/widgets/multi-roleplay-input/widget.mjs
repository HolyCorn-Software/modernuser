/**
 * Copyright 2022 HolyCorn Software
 * The HCTS Project
 * This widget allows, multiple roles played, to be entered
 */

import muserRpc from "/$/modernuser/static/lib/rpc.mjs";
import ZoneInput from "/$/modernuser/static/widgets/zone-input/widget.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import LabelList from "/$/system/static/lib/hc/label-list/widget.mjs";



export default class MultiRolePlayInput extends LabelList {


    constructor() {

        super(
            {
                items_store: [
                    {
                        id: '0',
                        label: 'Accountant'
                    },
                    {
                        id: '1',
                        label: 'Bikeman'
                    },
                    {
                        id: '2',
                        label: 'Others'
                    }
                ]
            }
        );

        //Now, we want that when an input is added, it is parameterized.
        //We then keep a map of which role is played in which zone

        /** @type {{[role: string]: string}} This is a map of role, and zone where the role is played */
        this.map = {

        }

        this.waitTillDOMAttached().then(() => this.load())



    }

    /**
     * It returns a promise that will resolve once the widget is ready to be used
     * @returns {Promise<void>}
     */
    async ready() {

        while (!(this[data_symbol]?.length > 0)) {
            await new Promise(x => setTimeout(x, 500))
        }
    }

    async load() {
        this[load_promise_symbol] = (async () => {
            this.loadBlock()

            try {

                this[data_symbol] = await muserRpc.modernuser.role.data.getAll()

                /** @type {[import("/$/system/static/lib/hc/label-list/types.js").LabelListItemData]} */
                const store_data = this[data_symbol].map(x => {
                    return {
                        id: x.id,
                        label: x.label
                    }
                })

                this.items_store = store_data
            } catch (e) {
                handle(e)
                delete this[load_promise_symbol]
            }

            this.loadUnblock()
        })();
    }

    onAdd() {

        const popup = super.onAdd()

        popup.addEventListener('complete', () => {

            const zoneInput = new ZoneInput({ label: `Where do you play this role?`, modal: true })
            zoneInput.show()
            zoneInput.addEventListener('change', () => {
                this.map[popup.value.id] = zoneInput.value
            })
        })
    }

    /**
     * @returns {[Omit<import("faculty/modernuser/role/membership/types.js").RolePlay, "userid">]}
     */
    get value() {

        return super.value.map(val => {
            return {
                role: val.id,
                zone: this.map[val.id]
            }
        })

    }

    /**
     * @param {[Omit<import("faculty/modernuser/role/membership/types.js").RolePlay, "userid">]} value
     */
    set value(value) {
        (async () => {
            await this.ready()

            /** @type {[import("/$/system/static/lib/hc/label-list/types.js").LabelListItemData]} */
            const newValue = value.map(x => {
                return {
                    id: x.role,
                    label: this[data_symbol].find(r => r.id === x.role)?.label || 'Invalid Role'
                }
            });

            this.items = newValue
        })()
    }


}


const load_promise_symbol = Symbol()
const data_symbol = Symbol()