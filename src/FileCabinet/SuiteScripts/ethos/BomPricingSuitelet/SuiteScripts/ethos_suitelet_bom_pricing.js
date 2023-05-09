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

                    let bomItem =  getBomItem(params.itemId);  // AlterG Via 400
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

        const getBomItem = (itemId) => {

            let startLevel = 0;
            let data = [], allData = [];
            do {

                data = getBomItemByLevel(itemId, startLevel);
                data.forEach( d=> d.level = startLevel);
                allData = allData.concat(data);
                startLevel++;
            }while( data.length > 0);

            createNodePath(allData);


            //sor allData by nodePath
            allData.sort(function(a, b){
                return a.nodePath.localeCompare(b.nodePath);
            });

            return allData;
        }

        const createNodePath = (data) => {

            // Iterate data
            for(let i = 0; i < data.length; i++)
            {
                // Get parent node
                let parentNode = getParentNodeByParentItem(data[i].parentitem, data, i-1);
                if(parentNode)
                {
                    //data[i].parentNode = parentNode;
                    data[i].nodePath = parentNode.nodePath + '/' + data[i].item;
                }
                else
                {
                    //data[i].parentNode = null;
                    data[i].nodePath = '/'+data[i].item;
                }

                data[i].child_description =  (data[i].child_description || data[i].child_item);

            }

        }

        const manageError = (context) => {
            log.debug({ title: "on request " + scriptContext.request.method, details: "error" });
        }

        const getItemsList = () => {

           let sql = `SELECT TOP 100 item.id, item.itemid, item.description, item.averagecost, aip.*
                                FROM item
                                INNER JOIN assemblyitemprice AS aip
                                ON item.id = aip.item`;

            return query.runSuiteQL({query:sql}).asMappedResults();

        }


        // Getting BOM items
        const getBomItemByLevel = (assyId, level) => {

            let sql = getQueryByLevel(level);

            return query.runSuiteQL({query: sql, params: [assyId]}).asMappedResults();
        }

        const getParentNodeByParentItem = (parentItem, data, startIndex) =>
        {

            //iterate data from startIndex to 0
            for(let i = startIndex; i >= 0; i--)
            {
                if(data[i].item == parentItem)
                {
                    return data[i];
                }
            }

            return null;
        }


        const getQueryByLevel = (level) => {

            let level0Query = `WITH levelQuery0 AS (
                                SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                                FROM item i
                                INNER JOIN itemmember im on i.id = im.parentitem
                                where i.id = ?
                            )`;

            let selectQuery = ` select                             
                            l.parentitem, ip.itemid as parent_item, ip.description as parent_description,                              
                            l.item, i.itemid as child_item , i.description as child_description,    
                            i.averagecost, l.quantity, l.effectivedate, l.obsoletedate, l.itemsource 
                            from levelQuery${level} l
                            inner join item i on l.item = i.id
                            inner join item ip on l.parentitem = ip.id`;

            let levelQuery = ``;

            let sqls = [level0Query];

            for(let i = 1 ; i <= level ; i++)
            {
                 sqls.push(`
                            levelQuery${i} AS (
                                 SELECT im.parentitem, im.item, im.quantity,im.effectivedate,im.obsoletedate,im.itemsource
                                FROM itemmember im
                                where im.parentitem in ( select l.item from levelQuery${i - 1 } l)
                            )`);
            }
            levelQuery = sqls.join(',');
            return levelQuery + selectQuery;
        }


        return {onRequest}

    });
