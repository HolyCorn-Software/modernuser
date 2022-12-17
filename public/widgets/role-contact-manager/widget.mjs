/**
 * Copyright 2022 HolyCorn Software
 * The CAYOFED People System
 * This widget allows a user to manage the people to a role
 */

import muserRpc from "../../lib/rpc.mjs";
import logic from "./logic.mjs";
import { handle } from "/$/system/static/errors/error.mjs";
import FileExplorer from "/$/system/static/html-hc/widgets/file-explorer/widget.mjs";
import { hc } from "/$/system/static/html-hc/lib/widget/index.mjs";
import { Widget } from "/$/system/static/html-hc/lib/widget/index.mjs";

export default class RoleContactManager extends Widget {

    constructor() {
        super();

        this.html = hc.spawn({
            classes: ['hc-cayofedpeople-role-play-manager'],
            innerHTML: `
                <div class='container'>

                    <div class='explorer'>
                        
                    </div>
                
                </div>
            `
        });

        /** @type {FileExplorer} */ this.explorer

        this.widgetProperty(
            {
                selector:`.${FileExplorer.classList.join('.')}`,
                parentSelector: '.container >.explorer',
                property: 'explorer',
                childType: 'widget',
            }
        );


        this.explorer = new FileExplorer();
        

        this.waitTillDOMAttached().then(()=>{
            this.populate_ui().catch((e)=>{
                handle(e)
            })
        })

    }

    /**
     * This method fetches the data and puts it on the UI
     */
    async populate_ui() {
        let role_data = await muserRpc.modernuser.role.data.getAll()

        let explorable = logic.draw_actions_for_all_roles(role_data, this)

        this.explorer.statedata.items = explorable
        this.explorer.statedata.current_path = ''

    }

}