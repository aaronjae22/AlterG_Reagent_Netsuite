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


                // log.debug({title: 'Item List', details: itemList});
                // log.debug({title: 'Item List as Array', details: itemListFiltered});

                // context.response.write (  {output:JSON.stringify({count: count, data: itemList, remaining: remaining})} );
                context.response.write (  {output:JSON.stringify({count: count, data: itemListFiltered, remaining: remaining})} );

                return;
            }


            // Testing Costed BOM
            if (params.action === 'getBuildMaterials')
            {
                let buildMaterials = getMFGBuildOfMaterials(1902);
                const count = buildMaterials.length;
                const remaining = runtime.getCurrentScript().getRemainingUsage();
                context.response.write (  {output:JSON.stringify({count: count, data: buildMaterials, remaining: remaining})} );
                return;
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



        /* COSTEM BOM TESTING */

        const getAllData = (assyId) =>
        {
            if(assyId)
            {
                let allRows = [],startLevel = 0;
                let  rowCount = 0;

                let brake = 0;

                do {
                    const assyObj = extractAssyItemsTest(assyId,startLevel);
                    rowCount = assyObj.length;
                    allRows.push( ...assyObj);
                    startLevel++;
                    brake++;

                }while(rowCount != 0); //iterate until no rows found in the level


                const remaining_usage = runtime.getCurrentScript().getRemainingUsage();
                return {remaining_usage: remaining_usage, length: allRows.length, data: allRows};
            }
        }


        const extractAssyItemsTest = (assyId, level) => {

            let sql = getQueryByLevel(level);
            log.debug({title:"Execution", details: sql});


            let records = [],allRecords = [];
            let pageIndex = 0, pageSize = 5000;

            let hasMoreRecords = false;

            let max = 10;
            let cont = 0;

            do {
                //read all the data from this page
                records =  readAllPageData(assyId, sql, pageIndex, pageSize  );

                cont++;
                pageIndex++;
                if(records && records.length > 0)
                {
                    allRecords.push( ... records);
                    hasMoreRecords = records.length == pageSize;
                }
                else
                    hasMoreRecords =false;
                // log.debug({title:'Execution info', details: {  assyId: assyId,sql: '', pageIndex: pageIndex, pageSize: pageSize } })
            }
            while(hasMoreRecords); //iterate over all pages, until all records get processed

            sqlGlobal = sql;


            return allRecords;
        }


        let sqlGlobal =null;


        const readAllPageData = (assyId,sql, pageIndex, pageSize) =>
        {

            let startRow = (pageIndex * pageSize)
                + (  pageIndex == 0 ? 0 : 1  ); // if pageIndex == 0, then start from 0, but if


            let resultsObj = query.runSuiteQL({
                query: sql,
                params: [assyId, startRow, startRow + pageSize],
                pageSize: 100
            }).asMappedResults();


            return resultsObj;
        }


        const getQueryByLevel = (level) =>
        {
            let sql = "", lastLevel = 0 ;
            let retrieveFields  = `
                        ,assy.billofmaterials as build_of_material,
                        rev.id as rev_id, 
                        rev.effectivestartdate, 
                        rev.effectiveenddate,
                        item.itemtype,
                        item.itemid as item_name, 
                        CUSTOMRECORD_PART_REVISION.name as item_rev,
                        item.itemtype as item_type,
                        cls.name as Prod_Line, 
                        member.quantity, 
                        member.bomquantity,
                        item.lastpurchaseprice,
                        item.averagecost, 
                        member.itemsource, 
                        item.vendorname,
                        vendor.companyname as vendor_companyname, 
                        itemVendor.vendorcode,
                        itemVendor.preferredvendor  ,
                        item.displayname,
                        parent.itemid as parent                      
                         `;
            let lastRetrieveFields = `            
            ,build_of_material          
            ,rev_id                     
            ,effectivestartdate         
            ,effectiveenddate           
            ,itemtype                   
            ,item_name                  
            ,item_rev                   
            ,item_type                  
            ,Prod_Line                  
            ,quantity                   
            ,bomquantity                
            ,lastpurchaseprice          
            ,averagecost                
            ,itemsource                 
            ,vendorname                 
            ,vendor_companyname         
            ,vendorcode                 
            ,preferredvendor
            ,displayname
            ,parent       
                `;

            let retrieveTables = `
                                LEFT OUTER JOIN classification cls ON item.class = cls.id
                                LEFT OUTER JOIN itemVendor ON item.id = itemVendor.item  
                                LEFT OUTER JOIN vendor ON itemVendor.vendor = vendor.id
                                LEFT OUTER JOIN CUSTOMRECORD_PART_REVISION ON item.custitem_pr_revision = CUSTOMRECORD_PART_REVISION.id
                                `;

            let baseLevel = `WITH levelQuery0 AS (
                                SELECT   
                                assy.assembly   , member.item as item_id     
                                ${ level == 0 ? retrieveFields : "" }                                  
                                FROM bom
                                INNER  JOIN bomAssembly assy ON bom.id = assy.billofmaterials
                                INNER  JOIN item parent ON assy.assembly = parent.id                                
                                LEFT OUTER JOIN bomRevision rev ON bom.id = rev.billofmaterials
                                LEFT OUTER JOIN bomRevisionComponentMember member ON rev.id = member.bomrevision
                                LEFT OUTER JOIN item ON member.item = item.id
                                
                                ${ level == 0 ? retrieveTables : "" }
                                
                                 WHERE rev.effectiveenddate IS EMPTY AND  assy.assembly = ?)
                                `;



            //if level 0, then just the base query
            sql += baseLevel;

            //${ i==level ? retrieveTables: "" /*if is the last level, retrieve all fields */ }


            for(var i = 1 ; i <= level ; i++)
            {
                sql += `, levelQuery${i} as (
                                    SELECT                                       
                                     assy.assembly   , 
                                     member.item as item_id
                                    ${ i == level ? retrieveFields : "" }
                                    FROM bom
                                    INNER  JOIN bomAssembly assy ON bom.id = assy.billofmaterials
                                    INNER  JOIN item parent ON assy.assembly = parent.id                                
                                    LEFT OUTER JOIN bomRevision rev ON bom.id = rev.billofmaterials
                                    LEFT OUTER JOIN bomRevisionComponentMember member ON rev.id = member.bomrevision
                                    LEFT OUTER  JOIN item ON member.item = item.id
                                    ${retrieveTables}
                                    where rev.effectiveenddate IS EMPTY and assy.assembly in (SELECT  item_id FROM levelQuery${i-1})
                                )` ;
                lastLevel = i;
            }

            let query = `    
                            select ${level} as l, assembly ,item_id 
                             ${ lastRetrieveFields }
                             from (
                                    select ROWNUM AS RN,assembly,item_id
                                     ${ lastRetrieveFields }
                                    from (
                                        SELECT assembly, item_id 
                                        ${ lastRetrieveFields }
                                        FROM levelQuery${lastLevel}
                                    )
                                ) where (RN between ? and ?) order by assembly
                                `
            return sql + query;

        }


        let parentCache = null;


        const setSortAttr = (dataArray)=>
        {
            dataArray.forEach( (currentValue, index, array) =>{

                if(currentValue.l === 0) //if level is 0, then set default value
                    currentValue.s = currentValue.item_id+""; //set item_id as default sort value
                else //
                {
                    let parentRecord = findParent(currentValue.assembly, index, array); //find the parent and use cache
                    if(parentRecord)
                        currentValue.s = parentRecord.s+"-"+ currentValue.item_id;
                }

                currentValue.l++;
            });
        }


        let findParent = ( parentId , currentIndex, data ) =>
        {

            if(parentCache != null && parentCache.item_id == parentId) //check if is the same parent
            {
                return parentCache;
            }


            for(let i = currentIndex ; i >= 0 ; i --)
            {
                let record = data[i];
                if(record.item_id == parentId)
                {
                    parentCache = record;
                    return record;
                }
            }

            return null;
        }


        const sortData = ( dataObj ) =>
        {
            //set data id "s"
            setSortAttr(dataObj.data);

            //sort by the attribute
            dataObj.data.sort((previous, next) => previous.s.localeCompare(next.s));
        }


        const getMFGBuildOfMaterials = (assyId) => {
            let data = getAllData(assyId);

            sortData(data);
            return data;
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
