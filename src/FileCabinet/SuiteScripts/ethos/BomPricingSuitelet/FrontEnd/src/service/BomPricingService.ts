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
                            assembly_item:              'string',
                            description:                'string',
                            raw_material_part:          'string',
                            raw_antibody_supplier:      'string',
                            supplier_part:              'string',
                            agreement_date:             'string',
                            contract_expiration_date:   'string',
                            memo:                       'string',
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

}


export interface BomPricingListRequest extends RequestBase
{
    data: BomPricingRecord[]
}


export interface BomPricingRecord
{
    assembly_item_id:           string,
    assembly_item:              string,
    description:                string,
    raw_material_part:          string,
    raw_antibody_supplier:      string,
    supplier_part:              string,
    agreement_date:             string,
    contract_expiration_date:   string,
    memo:                       string,
}
