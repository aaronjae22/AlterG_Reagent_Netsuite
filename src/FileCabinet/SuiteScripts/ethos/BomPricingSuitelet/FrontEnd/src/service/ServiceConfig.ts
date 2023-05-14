const config: ServiceConfig = {

    // netsuiteBaseUrl = 'https://910658.app.netsuite.com/',

    SuiteletUrl: '/app/site/hosting/scriptlet.nl?script=801&deploy=1',

    isProductionSite: true,
    useProxy: false,

};

if (config.useProxy)
{
    config.SuiteletUrl = 'https://910658.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=801&deploy=1&compid=910658&h=b3417a4a23f0aa78b46a';
    config.SuiteletUrl = "https://cors-anywhere.herokuapp.com/" + config.SuiteletUrl;
}
/* else
{
    config.SuiteletUrl = config.isProductionSite ? "/app/site/hosting/scriptlet.nl?script=801&deploy=1" : "/app/site/hosting/scriptlet.nl?script=801&deploy=1";
} */


export interface ServiceConfig {
    SuiteletUrl:        string;
    isProductionSite:   boolean;
    useProxy:           boolean;
}

export { config };
