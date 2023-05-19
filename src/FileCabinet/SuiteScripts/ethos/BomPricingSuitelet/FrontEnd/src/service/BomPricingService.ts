import { ServiceBase }              from "@/service/ServiceBase";
import type { RequestBase }         from "@/service/ServiceBase";
import { config as ServiceConfig }  from "@/service/ServiceConfig";


export class BomPricingService extends ServiceBase
{

    bomPricingUrl: string = "&d=" + (new Date().getTime());

    // retrieveList(clone: string, target: string, hasAgreement: boolean) : Promise<BomPricingListRequest>
    retrieveList(itemId: string) : Promise<BomPricingListRequest>
    {
        const params = {
            // action: 'retrieveBomPricingList',
            action: 'BomItem',
            itemId: itemId,
            /* clone: clone,
            target: target,
            hasAgreement: hasAgreement, */
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
            let promise = new Promise<BomPricingListRequest>((resolve, reject) => {

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
                } as BomPricingListRequest );

            })

            return promise;
        }

    }


    retrieveTree(itemId: string) : Promise<BomPricingTreeRequest>
    {

        return this.retrieveList(itemId).then((response) => {
            let promise = new Promise<BomPricingTreeRequest>((resolve, reject) => {

                resolve( this.transformListToTree(response.data) );

            });
            return promise;
        });
    }
    transformListToTree(list: BomPricingRecord[]) : BomPricingTreeRequest
    {
        let request: BomPricingTreeRequest = {
            success: true,
            message: 'OK',
            count: list.length,
            remaining: 1000,
            root: list.filter( (item) => item.level == 0)
                .map( (item) => this.getNodeFromRecord(item, list) )
        } ;

        return  request;
    }

    getNodeFromRecord(record: BomPricingRecord, allData: BomPricingRecord[]) : BomPricingRecordNode
    {
        let node : BomPricingRecordNode = {
            key: record.item,
            data: {
                parentitem: record.parentitem,
                parent_item: record.parent_item,
                parent_description: record.parent_description,
                item: record.item,
                child_item: record.child_item,
                child_description: record.child_description,
                averagecost: record.averagecost,
                quantity: record.quantity,
                effectivedate: record.effectivedate,
                obsoletedate: record.obsoletedate,
                itemsource: record.itemsource,
                level: record.level,
                nodePath: record.nodePath,
                isHidden: record.isHidden,
            },
            children: allData.filter( (item) => item.parentitem == record.item)
                .map( (item) => this.getNodeFromRecord(item, allData) )
        }
        return node;
    }
}


export interface BomPricingListRequest extends RequestBase
{
    data: BomPricingRecord[]
}

export interface BomPricingTreeRequest extends RequestBase
{
    root: BomPricingRecordNode[]
}
export interface  BomPricingRecordNode
{
    key: number,
    data: BomPricingRecord,
    children: BomPricingRecordNode[]
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
