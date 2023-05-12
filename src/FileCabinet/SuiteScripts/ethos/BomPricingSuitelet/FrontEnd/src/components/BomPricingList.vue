<script setup lang="ts">

import { BomPricingService }    from "@/service/BomPricingService";
import { ref, onMounted }       from 'vue';
import { FilterMatchMode, FilterOperator }      from 'primevue/api';


let bomPricingService = new BomPricingService();

let itemId = ref("");

let bomPricingList = ref();
// let userItemId = '';

const filters = ref(); // Filters in DataTable

// Export CSV in DataTable
const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};

const packaging = ref('');

onMounted(() => {
    refreshData();
});


const refreshData = () => {
    // bomPricingService.retrieveList(cloneText.value, targetText.value, hasAgreement.value).then((data: any) => {
    bomPricingService.retrieveList(itemId.value).then((data: any) => {
        bomPricingList.value = data.data;
    })
}

const initFilters = () => {
    filters.value = {
        global : { value : null, matchMode : FilterMatchMode.CONTAINS },
        child_item : { operator : FilterOperator.AND, constraints: [{ value : null, matchMode : FilterMatchMode.STARTS_WITH}] },
    }
}

initFilters();




</script>


<!-- TEMPLATE -->
<template>

    <div>
        <div class="card">
            <div class="card-container blue-container">
                <div class="flex">

                    <InputText v-model="itemId" placeholder="Enter Item ID"/>

                    <!-- Search icon -->
                    <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2  border-round">
                        <Button icon="pi pi-search" aria-label="Submit" @click="refreshData" />
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- DATA TABLE -->
    <DataTable v-model:filters="filters" :value="bomPricingList" tableStyle="min-width: 50rem" class="p-datatable-sm" id="bom-list"
               style="font-size: 18px; margin-top: 15px"
                :globalFilterFields="['child_item']"
               ref="dt"
    >
        <template #header>

            <div class="flex justify-content-between" style="margin-bottom: 5px;">

                <div class="radio-btns flex align-items-center">

                    <RadioButton v-model="packaging" value="packaging1" />
                    <label class="ml-2" for="packaging1" style="margin-right: 15px;">Packaging 1</label>

                    <RadioButton v-model="packaging" value="packaging2" />
                    <label class="ml-2" for="packaging2">Packaging 2</label>

                </div>

                <span class="p-input-icon-left">
                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    <i class="pi pi-search" />
                </span>

                <div class="export">
                    <Button class="export-btn" icon="pi pi-external-link" label="Export" @click="exportCSV()" />
                </div>

                <!-- <span clas="p-input-icon-left">
                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    <i class="pi pi-search" />
                </span> -->

            </div>

        </template>

        <!-- <template #empty>No Build of Materials Items Found.</template> -->

        <Column field="item" header="Item ID" style="width: 10%"></Column>
        <Column field="child_item" header="Item Part Number" style="width: 22%"></Column>
        <Column field="child_description" header="Item Description" style="width: 35%"></Column>
        <Column field="averagecost" header="Average Cost"></Column>
        <Column field="quantity" header="Qty"></Column>
        <Column field="itemsource" header="Source"></Column>


    </DataTable>

</template>



<!-- STYLES -->
<style scoped>

/* #bom-list th {
    font-weight: bold !important;
} */

/* p-datatable-thead {
    font-weight: bold !important;
} */

.export-btn {
    border: 0;
}

</style>
