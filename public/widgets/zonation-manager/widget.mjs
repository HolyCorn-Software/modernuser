/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System 
 * The Modern Faculty of Users
 * 
 * This widget allows a qualified user to manage the zones
 */


import * as zm_utils from './util.mjs'
import { handle } from "/$/system/static/errors/error.mjs";
import CreatePopup from "./create-popup.mjs";
// import ZonationExplorer from "../zone-explorer/widget.mjs";
import NavigationItemRenamePopup from "./item/edit-popup.mjs";
import NavigationItemDeletePopup from './item/delete-popup.mjs';
import FileExplorer from '/$/system/static/lib/hc/file-explorer/widget.mjs';




export default class ZonationManager extends FileExplorer {

    constructor() {
        super(undefined, {
            actions: [

                {
                    label: 'Rename',

                    /// The option to rename a zone
                    onclick: (zone) => {
                        let popup = new NavigationItemRenamePopup(zone.data);
                        const on_complete = async () => {
                            try {
                                popup.positiveButton.state = 'waiting'

                                await zm_utils.renameZone(zone.data.id, popup.value.label)

                                popup.positiveButton.state = 'success'
                                await new Promise(x => setTimeout(x, 2000));

                                zone.data.label = popup.value.label
                                popup.hide();
                                popup.removeEventListener('complete', on_complete)
                            } catch (e) {
                                popup.positiveButton.state = 'initial'
                                handle(e);
                            }
                        }
                        popup.addEventListener('complete', on_complete);

                        popup.show();
                    },

                    locations: ['context_root', 'context_noneroot']

                },


                {
                    label: 'Delete',
                    onclick: (zone) => {
                        let popup = new NavigationItemDeletePopup(zone.data)
                        popup.show();
                        popup.addEventListener('complete', () => {
                            zone.dispatchEvent(new CustomEvent('delete'))
                        })
                    },
                    locations: ['context_noneroot']
                }
                ,

                {
                    label: 'New Zone',
                    onclick: () => {
                        this.createNewZone()
                    },
                    locations: ['global_noneroot']
                },



            ]
        });




        this.fetch_zones().then(() => {
            this.statedata.current_path = ''

            this.statedata.$0.removeEventListener(`items-$array-item-change`, this.draw);

            this.statedata.$0.addEventListener(`items-$array-item-change`, () => {
                this.draw()
            });

        }).catch(e => handle(e))


    }



    async fetch_zones() {
        this.loadBlock();
        try {
            let zones = zm_utils.toFileStructure(await zm_utils.fetchZones())
            this.statedata.items = zones
        } catch (e) {
            handle(e)
        }


        this.loadUnblock();
    }

    async createNewZone() {

        const { current_path } = this.statedata

        let popup = new CreatePopup({
            superzone_label: current_path === '' ? undefined : this.statedata.items.filter(x => x.id === current_path)[0].label
        });

        popup.show();


        //So this is what happens when the user clicks on the create button on the popup
        const on_complete = async () => {
            try {
                popup.positiveButton.state = 'waiting'

                const label = popup.formWidget.value.label

                let new_id = await zm_utils.createZone({ label, superzone: current_path })

                popup.positiveButton.state = 'success'

                cleanup();

                this.statedata.items.push(
                    zm_utils.toFileStructure(
                        [
                            {
                                id: new_id,
                                label,
                                superzone: current_path
                            }
                        ]
                    )[0]
                )

                await new Promise(x => setTimeout(x, 2000));
                popup.hide();
            } catch (e) {
                popup.positiveButton.state = 'initial'
                handle(e)
            }
        }

        const cleanup = () => {
            popup.removeEventListener('complete', on_complete)
            popup.removeEventListener('cancel', cleanup)
        }

        popup.addEventListener('complete', on_complete)
        popup.addEventListener('cancel', cleanup)

    }

}