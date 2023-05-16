<script setup lang="ts">

import { TreeDataService }  from "@/service/TreeDataService";
import { NodeService }      from "@/stores/TreeTableData";

import { ref, onMounted }   from 'vue';

import { FilterMatchMode, FilterOperator } from 'primevue/api';

import ProgressSpinner  from "primevue/progressspinner";
import Checkbox         from "primevue/checkbox";
import Dropdown         from "primevue/dropdown";


let treeTableService = new TreeDataService();

let itemId = ref("3572");

let packaging = ref('');
let packingList = ref(['On Site', 'Rolling']);
let packagingOnSiteId = 1301;
let packagingRollingId = 1303;

let barrierBag = ref(false);
let barrierBagCodes = [1160, 1161];

let totalCost = 0;

const dt = ref(); // Export CSV

const filters = ref(); // Filter in InputText Search

let treeTableList = ref([] as any[]); // Store data from get request
let filteredItems = ref([] as any[]);

let nodes = ref(); // Store data from local nodes

let loadingData = ref(false);


onMounted(() => {
    NodeService.getTreeTableNodes().then((data) => (nodes.value = data));
    refreshData();
});

const refreshData = () => {
    loadingData.value = true;

    treeTableService.retrieveList(itemId.value).then((data: any) => {
        treeTableList.value = data.data;
        loadingData.value = false;
        calculateTotalCost();
    }).catch((error: any) => {
        console.log(error);
        loadingData.value = false;
    })
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

    let total = 0;

    if (treeTableList.value == null || treeTableList.value == undefined || treeTableList.value.length == 0) {
        return total;
    }

    treeTableList.value.forEach((item : any) => {

        if (item.isHidden) {
            return;
        }

        total += item.lastpurchaseprice; // item.calculatedCost;

    });

    filteredItems.value = treeTableList.value.filter(i => !i.isHidden);
    totalCost = total;

    return total;

};

const hideElementsBaseOnFilters = () => {

    // treeTableList.value.forEach((i) => i.isHidden = false);

    let packagingId = 0;

    if (packaging.value === 'On Site')
    {
        console.log(packaging.value);
        packagingId = packagingRollingId;
    }
    else if (packaging.value === 'Rolling')
    {
        packagingId = packagingOnSiteId;
    }

    if (!barrierBag.value)
    {
        treeTableList.value.filter((i) => {
            return barrierBagCodes.includes(i.item);
        }).forEach((i: any) => i.isHidden = true);
    }

    treeTableList.value.filter((i) => {
        return i.nodePath.startsWith("/" + packagingId + "/") ||
            i.nodePath === "/" + packagingId;
    }).forEach((i : any) => i.isHidden = true);


}


</script>


<!-- TEMPLATE -->
<template>

    <div class="header">
        <h1 class="header-text" style="margin:10px">Tree Table</h1>
    </div>

    <!-- TREE TABLE -->
    <!-- TODO: CHANGED IT TO TREETABLE -->
    <div class="card">
        <TreeTable :value="nodes">
            <Column field="item" header="Item" expander></Column>
            <Column field="itempart" header="Item Part Number"></Column>
            <Column field="itemdescription" header="Item Description" />
            <Column field="averagecost" header="Average Cost" />
            <Column field="qty" header="Qty" />
            <Column field="level" header="Level" />
        </TreeTable>
    </div>

    <div class="header" style="margin: 10px;">
        <h1 class="header-text">DataTable</h1>
    </div>

    <div v-if="loadingData" class="spinner-container">
        <ProgressSpinner />
    </div>

    <DataTable :value="treeTableList" v-model:filters="filters" ref="dt" tableStyle="min-width: 50rem">

        <template #header>
            <div class="flex justify-content-between" style="margin-bottom: 10px;">

                <InputText v-model="itemId" placeholder="Enter Item ID" />

                <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2 border-round">
                    <Button icon="pi pi-search" aria-label="Submit" @click="refreshData" />
                </div>

                <Dropdown v-model="packaging" :options="packingList"
                          @change="calculateTotalCost()"
                          placeholder="Select a Packing" class="w-full md:w-14rem"
                />

                <div class="flex align-items-center">
                    <label for="barrierBagInput" class="ml-2">Use Barrier Bag?</label>
                    &nbsp;
                    <Checkbox id="barrierBagInput" v-model="barrierBag" @change="calculateTotalCost()" :binary="true" />
                </div>

                <span class="p-input-icon-left">
                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" style="margin-left: 20px;" outlined @click="clearFilter()" />
                </span>

                <div class="flex">
                    <h2>Total: {{ formatCurrency(totalCost) }}</h2>
                </div>

                <div class="export">
                    <Button class="export-btn" icon="pi pi-external-link" label="Export" @click="exportCSV()" />
                </div>

            </div>

        </template>

        <Column field="item" header="Item Id"></Column>
        <Column field="child_item" header="Item Part Number"></Column>
        <Column field="child_description" header="Item Description"></Column>

        <Column field="averagecost">
            <template #header>
                <div>Average Cost</div>
            </template>
            <template #body="slotProps">
                {{ formatCurrency(slotProps.data.averagecost) }}
            </template>
        </Column>

        <Column field="lastpurchaseprice">
            <template #header>
                <div>Last Purchase Price</div>
            </template>
            <template #body="slotProps">
                {{ formatCurrency(slotProps.data.lastpurchaseprice) }}
            </template>
        </Column>

        <Column field="quantity" header="Qty"></Column>
        <Column field="level" header="Level"></Column>

    </DataTable>

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


</style>
