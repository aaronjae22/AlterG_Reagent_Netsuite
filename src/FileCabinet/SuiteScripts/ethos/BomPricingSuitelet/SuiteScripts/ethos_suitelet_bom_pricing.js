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

            // Retrieve resource file
            if(params && params.fileId){
                const srcFile = file.load({id: params.fileId});
                context.response.writeFile({file: srcFile, isInline: true});
                return;
            }

            // Retrieve data list
            /* if(params.action === "retrieveReagentList")
            {
                let reagentList = getReagentList(params.clone||"", params.target||"", params.hasAgreement||false);
                // let reagentList = [];
                const count = reagentList.length;
                const remaining = runtime.getCurrentScript().getRemainingUsage();
                context.response.write (  {output:JSON.stringify({count: count, data:reagentList, remaining: remaining})} );
                return;
            } */

            if(params.action){

                context.response.setHeader({
                    name: 'Content-Type',
                    value: 'application/json'
                });

                // Get items list
                if (params.action === "retrieveBomPricingList") {
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


                    // log.debug({title: 'Item List', details: itemList});
                    // log.debug({title: 'Item List as Array', details: itemListFiltered});

                    // context.response.write (  {output:JSON.stringify({count: count, data: itemList, remaining: remaining})} );
                    context.response.write({
                        output: JSON.stringify({
                            count: count,
                            data: itemListFiltered,
                            remaining: remaining
                        })
                    });

                    return;
                }

                // BOM Items
                if (params.action === 'BomItem') {
                    let bomItem = getBomItem(params.itemId); // AlterG Via 400 : id 3572
                    // let bomItem = getBomItem();
                    const count = bomItem.length;
                    const remaining = runtime.getCurrentScript().getRemainingUsage();
                    context.response.write({
                        output: JSON.stringify({
                            count: count,
                            data: bomItem,
                            remaining: remaining,
                            assyId: params.itemId
                        })
                    });
                    return;
                }

                // Break down BOM Item
                if (params.action === 'BomItemBD') {
                    let bomItem = getBomItemBrokenDown(params.itemId);
                    const count = bomItem.length;
                    const remaining = runtime.getCurrentScript().getRemainingUsage();
                    context.response.write({
                        output: JSON.stringify({
                            count: count,
                            data: bomItem,
                            remaining: remaining,
                            assyId: params.itemId
                        })
                    })

                    return;
                }

                // Testing recursive queries
                if (params.action === 'BomQueries') {
                    let bomItem = getQueryByLevel(params.itemId);
                    log.debug({title: 'BOMQueries', details: bomItem}); // It's empty
                    const count = bomItem.length;
                    const remaining = runtime.getCurrentScript().getRemainingUsage();
                    context.response.write({
                        output: JSON.stringify({
                            count: count,
                            data: bomItem,
                            remaining: remaining,
                            assyId: params.itemId
                        })
                    })

                    return;
                }

            }


            // Else retrieve html page
            const form = serverWidget.createForm({title: 'BOM Pricing'});
            const htmlField = form.addField({
                id: 'custpage_htmlview',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'html'
            });


            const htmlFile = file.load({id: '/SuiteScripts/ethos/BomPricingSuitelet/FrontEnd/dist/index.html'});
            if (htmlFile) {
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

            /* let sql = `SELECT TOP 10 *
                                FROM item
                                INNER JOIN assemblyitemprice
                                ON item.id = assemblyitemprice.item`; */

            return query.runSuiteQL({query:sql}).asMappedResults();

        }


        // Getting BOM items
        const getBomItem = (assyId) => {

            /*
           // const getBomItem = () => {

            // let sql = `SELECT * FROM item WHERE (item.itemtype = 'Assembly' AND id = ?)`;
*/

            /* //THIS IS FOR LEVEL 0
            let sql = `
                        WITH levelQuery0 AS (
                            SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                            FROM item i
                            INNER JOIN itemmember im on i.id = im.parentitem
                            where i.id = ?
                        ) 
                        select l.parentitem, l.item, l.quantity,l.effectivedate, l.obsoletedate, l.itemsource from levelQuery0 l
                        `;*/


                let sql = `WITH levelQuery0 AS (
                                SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                                FROM item i
                                INNER JOIN itemmember im on i.id = im.parentitem
                                where i.id = ?
                            ), levelQuery1 AS (
                                 SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                                FROM itemmember im
                                where im.parentitem in ( select l.item from levelQuery0 l)
                            ),
                            levelQuery2 AS (
                                 SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                                FROM itemmember im
                                where im.parentitem in ( select l.item from levelQuery1 l)
                            ),
                             levelQuery3 AS (
                                 SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                                FROM itemmember im
                                where im.parentitem in ( select l.item from levelQuery2 l)
                            ),
                             levelQuery4 AS (
                                 SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                                FROM itemmember im
                                where im.parentitem in ( select l.item from levelQuery3 l)
                            ),
                            levelQuery5 AS (
                                 SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                                FROM itemmember im
                                where im.parentitem in ( select l.item from levelQuery4 l)
                            ),
                              levelQuery6 AS (
                                SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                                FROM itemmember im
                                where im.parentitem in ( select l.item from levelQuery5 l)
                            ),
                            levelQuery7 AS (
                                 SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                                FROM itemmember im
                                where im.parentitem in ( select l.item from levelQuery6 l)
                            )
                            
                            select                             
                            l.parentitem, ip.itemid as parent_item, ip.description as parent_description,                              
                            l.item, i.itemid as child_item , i.description as child_description    --  ip.itemid as parent_itemid, i.itemid as child_itemid , l.parentitem, l.item, l.quantity,l.effectivedate, l.obsoletedate, l.itemsource 
                            from levelQuery7 l
                            inner join item i on l.item = i.id
                            inner join item ip on l.parentitem = ip.id
                        `;


            return query.runSuiteQL({query: sql, params: [assyId]}).asMappedResults();
            // return query.runSuiteQL({query: sql}).asMappedResults();

        }



        const getQueryByLevel = (assyId) => {

            let sql = "";
            let queryResult = [];
            let lastLevel = 0;

            let baseLevel = `SELECT
                                i.id as item_id_code,
                                i.itemid as item_id,
                                i.description as item_description,
                                i.displayname as item_displayname,
                                im.parentitem as parentitem,
                                im.item as itemmember_item,
                                im.itemsource as itemmember_itemsource,
                                im.quantity as itemmember_qty,
                            FROM item as i
                            INNER JOIN itemmember as im
                            ON i.id = im.parentitem
                            WHERE i.id = ?`;

            let retrieveFields = `im.parentitem, im.item, im.quantity, im.effectivedate,im.obsoletedate,im.itemsource`;

            let retrieveTables = `itemmember im`;

            /* let lastPartQuery = `SELECT
                                            l.parentitem, ip.itemid as parent_item,
                                            ip.description as parent_description,
                                            l.item, i.itemid as child_item,
                                            i.description as child_description
                                        FROM levelQuery0 l
                                        INNER JOIN item i ON l.item = i.id
                                        INNER JOIN item ip ON l.parentitem = ip.id` */

            // If level 0, then just the base query
            sql += baseLevel;


            queryResult = query.runSuiteQL({query: sql, params: [assyId]}).asMappedResults();

            log.debug({title: 'SQL', details: queryResult.length});
            log.debug({title: 'SQL', details: queryResult});

            return queryResult;




        }



        const getBomItemBrokenDown = (assyId) => {

            /* let sql = `SELECT i.id, i.itemid, i.description, i.displayname
                                FROM item as i
                                WHERE id = ?`; */

            /*
            im.displayname as itemmember_displayname,
            im.description as itemmember_description,
             */

            let sql = `SELECT
                                i.id as item_id_code,
                                i.itemid as item_id,
                                i.description as item_description,
                                i.displayname as item_displayname,
                                im.parentitem as parentitem,
                                im.item as itemmember_item,
                                im.itemsource as itemmember_itemsource,
                                im.quantity as itemmember_qty,
                            FROM item as i
                            INNER JOIN itemmember as im
                            ON i.id = im.parentitem
                            WHERE i.id = ?`;


            return query.runSuiteQL({query: sql, params: [assyId]}).asMappedResults();
        }



        // NO USAGE
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
                    r.custrecord_ra_memo                           as memo                        ,      
                    // '------------------' as div,
                    // r.*,          
                    // assy.
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
