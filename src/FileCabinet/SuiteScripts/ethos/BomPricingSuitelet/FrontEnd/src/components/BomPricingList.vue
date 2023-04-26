<script setup lang="ts">

defineProps<{
    msg: string
}>();

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
                            <!-- <InputText id="target" v-model="targetText" /> -->
                            <InputText id="target" />
                            <label for="target">Target</label>
                        </span>
                    </div>

                    <!-- Clone -->
                    <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2  border-round">
                        <span class="p-float-label">
                            <!-- <InputText id="clone" v-model="cloneText" /> -->
                            <InputText id="clone" />
                            <label for="cloe">Clone</label>
                        </span>
                    </div>

                    <!-- Has Agreement? -->
                    <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2  border-round">
                        <div class="flex align-items-center" style="color: black">
                            <!-- <Checkbox v-model="hasAgreement" inputId="hasAgreement" name="hasAgreement" :binary="true" /> -->
                            <Checkbox name="hasAgreement" :binary="true" />
                            <label for="hasAgreement" class="ml-2"> Has Agreement? </label>
                        </div>
                    </div>

                    <!-- Search icon -->
                    <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2  border-round">
                        <!-- <Button icon="pi pi-search" aria-label="Submit" @click="refreshData" /> -->
                        <Button icon="pi pi-search" aria-label="Submit"/>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- DATA TABLE -->
    <!-- <Datable :value="bomList" tableStyle="min-width: 50rem" class="p-datatable-sm"> -->
    <Datable tableStyle="min-width: 50rem" class="p-datatable-sm">

        <Column field="assembly_item" header="Assembly Item">
            <!-- Code that will display the actual Items -->
        </Column>

        <Column field="description" header="Description"></Column>
        <Column field="raw_material_part" header="Raw Material Part"></Column>
        <Column field="raw_antibody_supplier" header="Raw Antibody Supplier"></Column>
        <Column field="supplier_part" header="Supplier Part"></Column>
        <Column field="agreement_date" header="Agreement Date"></Column>
        <Column field="contract_expiration_date" header="Contract Expiration Date"></Column>
        <Column field="memo" header="Memo"></Column>

    </Datable>

</template>


<!-- STYLES -->
<style scoped>


</style>
