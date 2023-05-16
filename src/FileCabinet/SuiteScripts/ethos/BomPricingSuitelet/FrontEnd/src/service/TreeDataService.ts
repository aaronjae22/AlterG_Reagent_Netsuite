import { ServiceBase }              from "@/service/ServiceBase";
import type { RequestBase }         from "@/service/ServiceBase";
import { config as ServiceConfig }  from "@/service/ServiceConfig";


export class TreeDataService extends ServiceBase
{

    bomPricingUrl: string = "&d=" + (new Date().getTime());

    retrieveList(itemId: string) : Promise<TreeDataListRequest>
    {
        const params = {
            action: 'tree',
            itemId: itemId,
        } as any;

        const queryString = Object.keys(params).map(key => key  + '=' + params[key]).join('&');

        if(ServiceConfig.isProductionSite)
        {
            return fetch(ServiceConfig.SuiteletUrl + this.bomPricingUrl + "&" + queryString, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }).then(response => response.json());
        }

        else
        {
            let promise = new Promise<TreeDataListRequest>((resolve, reject) => {

                resolve({ data: [
                        {
                            "parentitem": 3572,
                            "parent_item": "AlterG Via 400",
                            "parent_description": "Via 400 Anti Gravity Treadmill ",
                            "item": 1160,
                            "child_item": "105924",
                            "child_description": "Barrier Bag, AoS M320",
                            "averagecost": null,
                            "quantity": 1,
                            "effectivedate": null,
                            "obsoletedate": null,
                            "itemsource": "STOCK",
                            "level": 0,
                            "nodePath": "/1160",
                            isHidden: false
                        },
                    ],
                    success: true,
                    message: 'OK',
                    count: 1,
                    remaining: 1000
                } as TreeDataListRequest );

            })

            return promise;
        }

    }

}


export interface TreeDataListRequest extends RequestBase
{
    data: BomPricingRecord[]
}


export interface BomPricingRecord
{
    "parentitem": number,
    "parent_item": string,
    "parent_description": string,
    "item": number,
    "child_item": string,
    "child_description": string,
    "averagecost": number|null,
    "quantity": number,
    "effectivedate": Date|null,
    "obsoletedate": Date|null,
    "itemsource": string,
    "level": number,
    "nodePath": string,

    isHidden: boolean



}
