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

            methodMap[https.Method.GET] = manageGet;
            methodMap[https.Method.POST] = managePost;
            methodMap[scriptContext.request.method] ? methodMap[scriptContext.request.method](scriptContext) : manageError(scriptContext);

        }

        const manageGet = (context) => {
            const params = context.request.parameters;

            //retrieve resource file
            if(params && params.fileId){
                const srcFile = file.load({id: params.fileId});
                context.response.writeFile({file: srcFile, isInline: true});
                return;
            }

            //retrieve data list
            if(params.action === "retrieveReagentList")
            {
                // let reagentList = getReagentList(params.clone||"", params.target||"", params.hasAgreement||false);
                let reagentList = [];
                const count = reagentList.length;
                const remaining = runtime.getCurrentScript().getRemainingUsage();
                context.response.write (  {output:JSON.stringify({count: count, data:reagentList, remaining: remaining})} );
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

        return {onRequest}

    });
