
// Todo:

import {IuserCredentials} from '@ku/lb_utils'

import { w3cwebsocket,ICloseEvent,IMessageEvent } from "websocket";
var triggers:any = {
    "open": [],
    "quote": [],
    "order": []

};
export  class websocketIoClient {

    static ws:any;
    url:string;
    cred:IuserCredentials;
    callbacks:any;

    constructor(url:string, cred:IuserCredentials, callbacks:any) {

        this.url = url;
        this.cred = cred;
        this.callbacks = callbacks;
        
    }


    //connect to shoonyas web socket client
    conenctTOWs(cred:IuserCredentials, callbacks:any) {

        console.log(callbacks);
        //callbacks to the app are set here
        this.set_callbacks(callbacks);
        if (this.cred?.apikey === null || this.url === null) return "apikey or url is missing";


        const ws_ = new w3cwebsocket(this.url);

        websocketIoClient.ws.onopen = function () {
            setInterval(function () {
                var _hb_req = '{"t":"h"}';
                console.log("test");
                websocketIoClient.ws.send(_hb_req);
            }, 4000);

            //prepare the data
            let values:any = { "t": "c" };
            // console.log(this.cred,this.url);
            values["uid"] = cred?.uid;
            values["actid"] = cred?.actid;
            values["susertoken"] = cred?.apikey;
            values["source"] = "API";

            websocketIoClient.ws.send(JSON.stringify(values));
            //resolve()

        };
        websocketIoClient.ws.onmessage = function (evt:IMessageEvent) {


            const jsonData: string | undefined = evt?.data as string;

            var result:any = JSON.parse(jsonData);
            console.log("result is : ", result);

            if(result.t == 'ck')
            {
                 trigger("open", [result]);
            }
            if( result.t == 'tk' || result.t == 'tf')
            {
                 trigger("quote", [result]);
            }
            if( result.t == 'dk' || result.t == 'df')
            {
                 trigger("quote", [result]);
            }
            if(result.t == 'om')
            {
                 trigger("order", [result]);
            }

        };
        websocketIoClient.ws.onerror = function (err:Error) {
            console.log("error::", err)
              trigger("error", [JSON.stringify(err.message)]);

            // reject(evt)
        };
        websocketIoClient.ws.onclose = function (evt:ICloseEvent) {
            console.log("Socket closed")
              trigger("close", [JSON.stringify(evt.reason)]);
        };


    }

    set_callbacks = (callbacks:any) => {
        if (callbacks.socket_open !== undefined) {
            this.on('open', callbacks.socket_open);
        }
        if (callbacks.socket_close !== undefined) {
            this.on('close', callbacks.socket_close);
        }
        if (callbacks.socket_error !== undefined) {
            this.on('error', callbacks.socket_error);
        }
        if (callbacks.quote !== undefined) {
            this.on('quote', callbacks.quote);
        }
        if (callbacks.order !== undefined) {
            this.on('order', callbacks.order);
        }
    }

    on =  (e:string, callback:any) =>{
        if (triggers.hasOwnProperty(e)) {
            triggers[e].push(callback);
        }
    };

    send = (data:any) =>{
        websocketIoClient.ws.send(data);
    };

    subscribe(instrument:string|string[]) {
        let values:any = {};
        values['t'] = 't';
        values['k'] = instrument
        console.log('test2');
        this.send(JSON.stringify(values));
    }
    print() {
        console.log("print");
    }

};

function trigger(e:string, args:any) {
    if (!triggers[e]) return
    for (var n = 0; n < triggers[e].length; n++) {
         triggers[e][n].apply(triggers[e][n], args ? args : []);
    }
}