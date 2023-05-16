<script setup lang="ts">

import { TreeDataService }  from "@/service/TreeDataService";
import { NodeService }      from "@/stores/TreeTableData";

import { ref, onMounted }   from 'vue';

import { FilterMatchMode, FilterOperator } from 'primevue/api';

import ProgressSpinner  from "primevue/progressspinner";
import Checkbox         from "primevue/checkbox";
import Dropdown         from "primevue/dropdown";

const nodes = ref();

onMounted(() => {
    NodeService.getTreeTableNodes().then((data) => (nodes.value = data));
})

</script>


<!-- TEMPLATE -->
<template>

    <div class="header">
        <h1 class="header-text">Tree Table</h1>
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

</template>


<!-- STYLE -->
<style scoped>


</style>
