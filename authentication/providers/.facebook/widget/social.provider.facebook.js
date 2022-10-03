/*
Copyright 2021 HolyCorn Software
The HCTS Project
This module allows the social login menu to have the login with facebook option

*/

import { HCTSSocialLoginProvider } from "../../../lib/widget.js";



export class HCTSFacebookSocialLogin extends HCTSSocialLoginProvider{

    constructor({client_id}={}){
        super();

        this.html = document.spawn({
            class:'hc-hcts-facebook-social-login',
            innerHTML:`
                <div class='container'>

                </div>
            `
        })

        document.head.spawn({
            async:'',
            defer:'',
            tag:'script',
            crossorigin:"anonymous",
            src:"https://connect.facebook.net/en_US/sdk.js"
        })

        Object.assign(this, arguments[0])
    }

    isReady(){
        return window.FB
    }

    async render(){

        FB.init({
            appId:this.client_id,
            autoLogAppEvents:true,
            xfbml:true,
            version:'v12.0'
        });

        
        
        if(this.html.$('.fb-login-button')){
            return console.log(`Already initialized`)
        }
        
        let onLogin = (response)=>{
            
            if(response.status != 'connected'){
                alert('There was an error logging in with Facebook')
                console.log(`Facebook Login error `, response)
                return
            }

            this.login({token:response?.authResponse?.accessToken})

            console.log(response)

        }

        let onLoginFunctionName = `login_${Math.random().toString().substring(3, 8)}`
        window[onLoginFunctionName] = onLogin
        
        
        this.html.$('.container').spawn({
            class:'fb-login-button',
            'data-size':'large',
            'data-button-type':'continue_with',
            'data-use-continue-as': true,
            'data-auto-logout-link':false,
            'data-width': this.html.parentElement.getBoundingClientRect().width,
            'onlogin':onLoginFunctionName
        })



    }
    
}