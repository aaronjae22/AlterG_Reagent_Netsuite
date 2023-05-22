<script setup lang="ts">

import { TreeDataService }  from "@/service/TreeDataService";
import { NodeService }      from "@/stores/TreeTableData";

import { ref, onMounted }   from 'vue';

import { FilterMatchMode, FilterOperator } from 'primevue/api';

import ProgressSpinner  from "primevue/progressspinner";
import Checkbox         from "primevue/checkbox";
import Dropdown         from "primevue/dropdown";
import {BomPricingService} from "@/service/BomPricingService";


let treeTableService = new TreeDataService();

let itemId = ref("3572");

let packaging = ref('');
let packingList = ref(['On Site', 'Rolling']);
let packagingOnSiteId = 1301;
let packagingRollingId = 1303;

let barrierBag = ref(false);
let barrierBagCodes = [1160, 1161];

let totalCost = 0;

const filters = ref(); // Filter in InputText Search

let treeTableList = ref([] as any[]); // Store data from get request
let originalItemList = ref([] as any[]);
let filteredItems = ref([] as any[]);

let nodes = ref(); // Store data from local nodes

let loadingData = ref(false);


onMounted(() => {
    //NodeService.getTreeTableNodes().then((data) => (nodes.value = data));
     refreshData();
});

const refreshData = () => {
    loadingData.value = true;

    /*treeTableService.retrieveList(itemId.value).then((data: any) => {
        treeTableList.value = data.data;
        loadingData.value = false;
        calculateTotalCost();
    }).catch((error: any) => {
        console.log(error);
        loadingData.value = false;
    })*/

    let service = new BomPricingService();

    service.retrieveTree(itemId.value).then((data: any) => {

        console.log(data);
        console.log(data.originalList);

        originalItemList.value = data.originalList;
        treeTableList.value = data.root;
        loadingData.value = false;
        calculateTotalCost();

    }).catch((error: any) => {
        console.log(error);
        loadingData.value = false;
    });

};

// Filters
const initFilters = () => {
    filters.value = {
        global : { value : null, matchMode : FilterMatchMode.CONTAINS },
        child_item : { operator : FilterOperator.AND, constraints: [{ value : null, matchMode : FilterMatchMode.STARTS_WITH}] },
    }
}

const clearFilter = () => {
    initFilters();
};

initFilters();

const dt = ref(); // Export CSV

const exportCSV = () => {
    dt.value.exportCSV();
};

// Calculate Total Cost

const formatCurrency = (value: number) => {

    if (value == null || value == undefined)
        return "--"
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD'  });
}

const calculateTotalCost = () => {

    hideElementsBaseOnFilters();

    console.log(originalItemList.value);

    let total = 0;

    if (originalItemList.value == null || originalItemList.value == undefined || originalItemList.value.length == 0) {

        return total;

    }

    originalItemList.value.forEach((item : any) => {
        if (item.isHidden) {
            return;
        }

        total += item.lastpurchaseprice;

    });

    filteredItems.value = originalItemList.value.filter(i => !i.isHidden);

    totalCost = total;
    console.log(totalCost);
    return total;


};



const hideElementsBaseOnFilters = () => {

    originalItemList.value.forEach((i) => i.isHidden = false);

    let packagingId = 0;

    if (packaging.value === 'On Site')
    {
        packagingId = packagingRollingId;
    }
    else if (packaging.value === 'Rolling')
    {
        packagingId = packagingOnSiteId;
    }


    if (!barrierBag.value)
    {
        originalItemList.value.filter((i) => {
            return barrierBagCodes.includes(i.item);
        }).forEach((i: any) => i.isHidden = true);
    }

    originalItemList.value.filter( (i) =>
    {
        return i.nodePath.startsWith("/"+ packagingId+"/" ) ||
            i.nodePath === "/"+packagingId;
    }).forEach( (i: any) => i.isHidden = true);


    /* treeTableList.value.filter((i) => {
        return i.data.nodePath.startsWith("/" + packagingId + "/") ||
            i.data.nodePath === "/" + packagingId;
    }).forEach((i : any) => i.data.isHidden = true); */


}


</script>


<!-- TEMPLATE -->
<template>

    <div v-if="loadingData" class="spinner-container">
        <ProgressSpinner />
    </div>

    <!-- TODO: ADD FILTERS -->

        <TreeTable :value="treeTableList"
                   :class="`p-treetable-sm`"
                   :tableProps="{ style: { minWidth: '50rem' } }"
                   :globalFilterFields="['child_description']"
                   key="item" ref="dt" id="bom-list">

            <template #header>

                <div class="flex justify-content-between" style="margin-bottom: 0px;">

                    <!-- INPUT TEXT SEARCH ITEM -->
                    <InputText v-model="itemId" placeholder="Enter Item Id" />

                    <!-- SEARCH ICON -->
                    <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2 border-round">
                        <Button icon="pi pi-search" aria-label="Submit" @click="refreshData" />
                    </div>

                    <!-- DROPDOWN TO SELECT PACKAGING -->
                    <Dropdown v-model="packaging" :options="packingList"
                              @change="calculateTotalCost()"
                              placeholder="Select a Packing"
                              class="w-fulll md:w-14rem"
                    />

                    <!-- CHECKBOX FOR BARRIER BAG SELECTION -->
                    <div class="flex align-items-center">
                        <label for="barrierBagInput" class="ml-2">Use Barrier Bag?</label>
                        &nbsp;
                        <Checkbox id="barierBagInput" v-model="barrierBag" @change="calculateTotalCost()" :binary="true" />
                    </div>

                    <!-- KEYWORD SEARCH AND CLEAR BUTTON -->
                    <span class="p-input-icon-left">
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        <Button type="button" icon="pi pi-filter-slash" label="Clear" style="margin-left: 20px;" outlined @click="clearFilter()" />
                    </span>

                    <!-- TOTAL AMOUNT -->
                    <div class="flex">
                        <h2>Total: {{formatCurrency(totalCost)}} </h2>
                    </div>

                    <!-- EXPORT BUTTON -->
                    <!-- TODO: FIX@click="exportCSV()" -->
                    <div class="export">
                        <Button class="export-btn" icon="pi pi-external-link" label="Export" @click="exportCSV()" />
                    </div>

                </div>
            </template>
            <Column field="item" header="Item ID" expander headerStyle="width: 16rem" style="font-weight:bold"></Column>
            <Column field="child_item" header="Item Part Number" headerStyle="width: 24rem"></Column>
            <Column field="child_description" header="Item Description" headerStyle="width: 20rem"></Column>

            <Column field="averagecost" style="text-align: right">
                <template #header>
                    <div style="text-align: right; width: 100%">Average Cost</div>
                </template>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.node.data.averagecost) }}
                </template>
            </Column>

            <Column field="calculatedCost" style="text-align: right" headerStyle="width: 7rem">
                <template #header>
                    <div style="text-align: right; width: 100% ">Calc Cost</div>
                </template>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.node.data.calculatedCost) }}
                </template>
            </Column>

            <Column field="lastpurchaseprice" style="text-align: right;" headerStyle="width: 10rem">
                <template #header>
                    <div style="text-align: right; width: 100%">Last Purchase Price</div>
                </template>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.node.data.lastpurchaseprice) }}
                </template>
            </Column>

            <Column field="quantity" style="text-align: right;" headerStyle="width: 3rem">
                <template #header>
                    <div style="text-align: right;">Qty</div>
                </template>
                <template #body="slotProps">
                    {{ slotProps.node.data.quantity }}
                </template>
            </Column>

            <Column field="level" style="text-align: right" headerStyle="width: 3rem">
                <template #header>
                    <div style="text-align: left;">Level</div>
                </template>
                <template #body="slotProps">
                    {{ slotProps.node.data.level }}
                </template>
            </Column>


        </TreeTable>


</template>


<!-- STYLE -->
<style scoped>


.spinner-container {
    display: inline;
    position: fixed;
    right: 0;
    z-index: 999;
    bottom: 0;
}

.export-btn {
    border: 0;
}

</style>
