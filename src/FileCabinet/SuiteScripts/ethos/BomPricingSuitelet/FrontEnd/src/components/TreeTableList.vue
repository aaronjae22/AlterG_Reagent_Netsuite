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
let barrierBag = ref(false);

// Filter in InputText Search
const filters = ref();

// Store data from get request
let treeTableList = ref([] as any[]);
// Store data from local nodes
let nodes = ref();

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

// Export CSV
const dt = ref();

const exportCSV = () => {
    dt.value.exportCSV();
};


</script>


<!-- TEMPLATE -->
<template>

    <div class="header">
        <h1 class="header-text" style="margin:10px">Tree Table</h1>
    </div>

    <!-- DATA TABLE -->
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
                            placeholder="Select a Packing" class="w-full md:w-14rem"
                />

                <div class="flex align-items-center">
                    <label for="barrierBagInput" class="ml-2">Use Barrier Bag?</label>
                    &nbsp;
                    <Checkbox id="barrierBagInput" v-model="barrierBag" :binary="true" />
                </div>

                <span class="p-input-icon-left">
                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" style="margin-left: 20px;" outlined @click="clearFilter()" />
                </span>

                <div class="flex">
                    <h2>Total: $000.000</h2>
                </div>

                <div class="export">
                    <Button class="export-btn" icon="pi pi-external-link" label="Export" @click="exportCSV()" />
                </div>

            </div>

        </template>

        <Column field="item" header="Item Id"></Column>
        <Column field="child_item" header="Item Part Number"></Column>
        <Column field="child_description" header="Item Description"></Column>
        <Column field="averagecost" header="Average Cost"></Column>
        <Column field="lastpurchaseprice" header="Last Purchase Price"></Column>
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
