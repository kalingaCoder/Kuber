interface IapiUrls {
    endpoint:string,
    websocket:string,
    eodhost:string
}
export const API:IapiUrls = {
    "endpoint": "https://api.shoonya.com/NorenWClientTP",
    "websocket": "wss://api.shoonya.com/NorenWSTP/",
    "eodhost": "https://shoonya.finvasia.com/chartApi/getdata/"
}