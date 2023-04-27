<script setup lang="ts">

import { BomPricingService }    from "@/service/BomPricingService";

import { ref, onMounted }       from 'vue';

defineProps<{
    msg: string
}>();

let bomPricingService = new BomPricingService();

let cloneText = ref("");
let targetText = ref("");
let hasAgreement = ref(false);

let bomPricingList = ref();

onMounted(() => {
    refreshData();
});

const refreshData = () => {
    bomPricingService.retrieveList(cloneText.value, targetText.value, hasAgreement.value).then((data: any) => {
        debugger;
        bomPricingList.value = data.data;
    })
}


</script>


<!-- TEMPLATE -->
<template>

    <div>
        <div class="card">
            <div class="card-container blue-container">
                <div class="flex">

                    <!-- Target -->
                    <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2 border-round">
                        <span class="p-float-label">
                            <InputText id="target" v-model="targetText" />
                            <!-- <InputText id="target" /> -->
                            <label for="target">Target</label>
                        </span>
                    </div>

                    <!-- Clone -->
                    <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2  border-round">
                        <span class="p-float-label">
                            <InputText id="clone" v-model="cloneText" />
                            <!-- <InputText id="clone" /> -->
                            <label for="clone">Clone</label>
                        </span>
                    </div>

                    <!-- Has Agreement? -->
                    <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2  border-round">
                        <div class="flex align-items-center" style="color: black">
                            <Checkbox v-model="hasAgreement" inputId="hasAgreement" name="hasAgreement" :binary="true" />
                            <!-- <Checkbox name="hasAgreement" :binary="true" /> -->
                            <label for="hasAgreement" class="ml-2"> Has Agreement? </label>
                        </div>
                    </div>

                    <!-- Search icon -->
                    <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2  border-round">
                        <Button icon="pi pi-search" aria-label="Submit" @click="refreshData" />
                        <!-- <Button icon="pi pi-search" aria-label="Submit"/> -->
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- DATA TABLE -->
    <DataTable :value="bomPricingList" tableStyle="min-width: 50rem" class="p-datatable-sm">

        <Column field="id" header="Id"></Column>
        <Column field="itemid" header="Item Id"></Column>

    </DataTable>

    <!--
    <DataTable tableStyle="min-width: 50rem">
        <Column field="code" header="Code"></Column>
        <Column field="name" header="Name"></Column>
        <Column field="category" header="Category"></Column>
        <Column field="quantity" header="Quantity"></Column>
    </DataTable>
    -->

</template>


<!-- STYLES -->
<style scoped>


</style>
