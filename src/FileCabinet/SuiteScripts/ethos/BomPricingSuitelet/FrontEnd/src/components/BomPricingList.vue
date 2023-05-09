<script setup lang="ts">

import { BomPricingService }    from "@/service/BomPricingService";

import { ref, onMounted }       from 'vue';

/* defineProps<{
    msg: string
}>(); */

let bomPricingService = new BomPricingService();

let cloneText = ref("");
let targetText = ref("");
let hasAgreement = ref(false);

let bomPricingList = ref();
let userItemId = '';

onMounted(() => {
    refreshData();
});


const refreshData = () => {
    bomPricingService.retrieveList(cloneText.value, targetText.value, hasAgreement.value).then((data: any) => {
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

                    <InputText v-model="userItemId" placeholder="Enter Item ID"/>

                    <!-- Search icon -->
                    <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2  border-round">
                        <Button icon="pi pi-search" aria-label="Submit" @click="log(userItemId)"/>
                        <!-- <Button icon="pi pi-search" aria-label="Submit" @click="refreshData" /> -->
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- DATA TABLE -->
    <DataTable :value="bomPricingList" tableStyle="min-width: 50rem" class="p-datatable-sm">

        <Column header="Parent Item ID"></Column>
        <Column header="Parent Item"></Column>
        <Column header="Parent Description"></Column>
        <Column header="Item"></Column>
        <Column header="Child Item ID"></Column>
        <Column header="Child Item Description"></Column>
        <Column header="Average Cost"></Column>
        <Column header="Qty"></Column>


        <!-- <Column field="id" header="Id"></Column>
        <Column field="itemid" header="Item Id"></Column>
        <Column field="description" header="Description"></Column>
        <Column field="averagecost" header="Average Cost"></Column>
        <Column field="pricelevelname" header="Price Level"></Column>
        <Column field="price" header="Price"></Column> -->

    </DataTable>

</template>


<!-- STYLES -->
<style scoped>


</style>
