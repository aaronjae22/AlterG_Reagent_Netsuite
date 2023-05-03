/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/https', 'N/query', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget'],
    /**
 * @param{file} file
 * @param{https} https
 * @param{query} query
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (file, https, query, record, runtime, search, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            /* log.debug({title: 'On Request', details: 'Testing'});

            let message = 'Testing Suitelet';
            scriptContext.response.write(message); */

            const methodMap = {};

            log.debug({ title: "on request " + scriptContext.request.method, details: scriptContext.request });

            // let itemsList = getItemsList();
            // log.debug({ title: 'Items List', detils: itemsList});
            // scriptContext.response.write(JSON.stringify(purchaseRequisitions));

            methodMap[https.Method.GET] = manageGet;
            methodMap[https.Method.POST] = managePost;
            methodMap[scriptContext.request.method] ? methodMap[scriptContext.request.method](scriptContext) : manageError(scriptContext);

        }

        const manageGet = (context) => {
            const params = context.request.parameters;

            log.debug({title: 'Params', details: params});
            log.debug({title: 'Params', details: params.action});

            //retrieve resource file
            if(params && params.fileId){
                const srcFile = file.load({id: params.fileId});
                context.response.writeFile({file: srcFile, isInline: true});
                return;
            }

            //retrieve data list
            if(params.action === "retrieveReagentList")
            {
                let reagentList = getReagentList(params.clone||"", params.target||"", params.hasAgreement||false);
                // let reagentList = [];
                const count = reagentList.length;
                const remaining = runtime.getCurrentScript().getRemainingUsage();
                context.response.write (  {output:JSON.stringify({count: count, data:reagentList, remaining: remaining})} );
                return;
            }

            // Get items list
            if (params.action === "retrieveBomPricingList")
            {
                let itemList = getItemsList();
                // let itemCount = itemList.length;
                const count = itemList.length;
                const remaining = runtime.getCurrentScript().getRemainingUsage();

                itemListFiltered = itemList.filter(
                    (obj, index) =>
                        itemList.findIndex((item) => item.id === obj.id) === index
                );

                /* itemListFiltered = itemListFiltered.map(function (x) {
                    return {
                        ...x,
                        averagecost: x.averagecost.toFixed(3),
                    };
                }) */


                log.debug({title: 'Item List', details: itemList});
                log.debug({title: 'Item List as Array', details: itemListFiltered});

                // context.response.write (  {output:JSON.stringify({count: count, data: itemList, remaining: remaining})} );
                context.response.write (  {output:JSON.stringify({count: count, data: itemListFiltered, remaining: remaining})} );

                // let contextItemRepsonse = context.response.write (  {output:JSON.stringify({count: count, data: itemList, remaining: remaining})} );
                // log.debug({title: 'Context Response', details: contextItemRepsonse});

                return;
            }


            //else retrieve html page
            const form = serverWidget.createForm({title: 'BOM Pricing'});
            const htmlField = form.addField({
                id: 'custpage_htmlview',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'html'
            });

            const htmlFile = file.load({id: '/SuiteScripts/ethos/BomPricingSuitelet/FrontEnd/dist/index.html'});
            if(htmlFile){
                log.debug({ title: "Processing Html", details: htmlFile.getContents() });
                htmlField.defaultValue = htmlFile.getContents();
                context.response.writePage({pageObject: form});
                //context.response.writeFile({file: htmlFile, isInline: true});
                return;
            }
        }

        const managePost = (scriptContext) => {


        }

        const manageError = (context) => {
            log.debug({ title: "on request " + scriptContext.request.method, details: "error" });
        }

        const getItemsList = () => {

            /* let sql = `SELECT TOP 10 item.id, item.itemid, assemblyitemprice.amount
                                FROM item
                                INNER JOIN assemblyitemprice
                                ON item.id = assemblyitemprice.item`; */

            // let sql = `SELECT * FROM assemblyitemprice`;

            // let sql = `SELECT TOP 10 * FROM item`;

            /* let sql = `SELECT item.id, item.itemid, assemblyitemprice.price
                                FROM item
                                INNER JOIN assemblyitemprice
                                ON item.id = assemblyitemprice.item`; */

            let sql = `SELECT TOP 100 item.id, item.itemid, item.description, item.averagecost, aip.*
                                FROM item
                                INNER JOIN assemblyitemprice AS aip
                                ON item.id = aip.item`;
            // description

            /* let sql = `SELECT TOP 10 *
                                FROM item
                                INNER JOIN assemblyitemprice
                                ON item.id = assemblyitemprice.item`; */

            return query.runSuiteQL({query:sql}).asMappedResults();

        }

        const getReagentList = (clone,target, hasAgreement) =>
        {
            let sql = `
                select * from ( 
                select ROWNUM AS RN,* from (
                    select        
                    assy.id                                        as assembly_item_id            ,         
                    assy.displayname                               as assembly_item               ,               
                    r.custrecord_ra_assy_description               as description                 ,
                    BUILTIN.DF( r.custrecord_ra_raw_material_item) as raw_material_part           ,
                    v.entityid ||  ' ' || v.companyname            as raw_antibody_supplier       ,
                    BUILTIN.DF(r.custrecord_ra_supplier_item)      as supplier_part               ,
                    r.custrecord_ra_agreement_date                 as agreement_date              ,
                    r.custrecord_ra_expiration_date                as contract_expiration_date    ,
                    r.custrecord_ra_memo                           as memo                        /*,      
                    '------------------' as div,
                    r.*,          
                    assy.**/
                    from item assy 
                    left join  customrecord_reagent r on assy.id = r.custrecord_ra_assy_item
                    left join vendor v on v.id = r.custrecord_ra_antibody_supplier
                    
                    where assy.displayname like '%' || ? || '%' || ? || '%'
                    ${ hasAgreement == 'true' ? " and r.custrecord_ra_assy_description is not null " : "" }
                )     ) where rn between 1 and 500           
                `;
            return query.runSuiteQL({query:sql, params:[target,clone]}).asMappedResults();
        }


        return {onRequest}

    });