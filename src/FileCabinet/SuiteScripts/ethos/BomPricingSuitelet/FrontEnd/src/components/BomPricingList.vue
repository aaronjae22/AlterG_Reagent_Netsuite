<script setup lang="ts">

import { BomPricingService }    from "@/service/BomPricingService";

import { ref, onMounted }       from 'vue';

/* defineProps<{
    msg: string
}>(); */

let bomPricingService = new BomPricingService();

/* let cloneText = ref("");
let targetText = ref("");
let hasAgreement = ref(false); */

let itemId = ref("");

let bomPricingList = ref();
let userItemId = '';

onMounted(() => {
    refreshData();
});


const refreshData = () => {
    // bomPricingService.retrieveList(cloneText.value, targetText.value, hasAgreement.value).then((data: any) => {
    bomPricingService.retrieveList(itemId.value).then((data: any) => {
        // debugger;
        bomPricingList.value = data.data;
    })
}

const log = (value: string) => {
    console.log(value);
}


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
                        <!-- <Button icon="pi pi-search" aria-label="Submit" @click="log(itemId)"/> -->
                        <Button icon="pi pi-search" aria-label="Submit" @click="refreshData" />
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- DATA TABLE -->
    <DataTable :value="bomPricingList" tableStyle="min-width: 50rem" class="p-datatable-sm">

        <Column field="parentitem" header="Parent Item ID"></Column>
        <Column field="parent_item" header="Parent Item"></Column>
        <Column field="parent_description" header="Parent Item ID"></Column>
        <Column field="item" header="Item ID"></Column>
        <Column field="child_item" header="Child Item ID"></Column>
        <Column field="child_description" header="Child Item Description"></Column>
        <Column field="averagecost" header="Average Cost"></Column>
        <Column field="quantity" header="Qty"></Column>
        <Column field="level" header="Level"></Column>


    </DataTable>

</template>


<!-- STYLES -->
<style scoped>


</style>
