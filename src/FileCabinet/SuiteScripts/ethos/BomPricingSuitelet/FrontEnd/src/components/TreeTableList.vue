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

}

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

    <DataTable :value="treeTableList">
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
