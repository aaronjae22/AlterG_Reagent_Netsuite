<script setup lang="ts">

import { BomPricingService }    from "@/service/BomPricingService";
import { ref, onMounted }       from 'vue';
import { FilterMatchMode, FilterOperator }      from 'primevue/api';
import ProgressSpinner from 'primevue/progressspinner';

import Checkbox from 'primevue/checkbox';
import Dropdown from "primevue/dropdown";


let bomPricingService = new BomPricingService();

let itemId = ref("3572");

let bomPricingList = ref([] as any[]);
let filteredItems = ref([]as any[]);
let barrierBag = ref(false);


let barrierBagCodes = [1160,1161]

let packagingOnSiteId = 1301;
let packagingRollingId = 1303;


const filters = ref(); // Filters in DataTable

// Export CSV in DataTable
const dt = ref();
const exportCSV = () => {
    dt.value.exportCSV();
};

const packingList = ref(['On Site', 'Rolling']);

let loadingData = ref(false);
let totalCost = 0;

const packaging = ref('');

onMounted(() => {
    refreshData();
});


const refreshData = () => {
    loadingData.value = true;

    bomPricingService.retrieveList(itemId.value).then((data: any) => {
        bomPricingList.value = data.data;
        loadingData.value = false;
        calculateTotalCost();
    }).catch((error: any) => {
        console.log(error);
        loadingData.value = false;
    })
}

const initFilters = () => {
    filters.value = {
        global : { value : null, matchMode : FilterMatchMode.CONTAINS },
        child_item : { operator : FilterOperator.AND, constraints: [{ value : null, matchMode : FilterMatchMode.STARTS_WITH}] },
    }
}

const clearFilter = () => {
    initFilters();
};


const formatCurrency = (value:number) => {
  if(value == null || value == undefined)
    return "--";
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const calculateTotalCost = () => {

  hideElementsBaseOnFilters();

  let total = 0;
  if(bomPricingList.value == null || bomPricingList.value == undefined || bomPricingList.value.length == 0)
    return total;


  bomPricingList.value.forEach((item : any) => {

    if(item.isHidden){
      return;
    }
      total +=  item.lastpurchaseprice; //item.calculatedCost;
  });

  filteredItems.value = bomPricingList.value.filter( i => !i.isHidden);
  totalCost = total;
  return total;
}


const hideElementsBaseOnFilters = () =>
{
  bomPricingList.value.forEach( (i)=> i.isHidden = false);
  let packagingId = 0;

    if(packaging.value === 'On Site')
    {
      packagingId = packagingRollingId;
    }
    else if(packaging.value === 'Rolling')
    {
      packagingId = packagingOnSiteId;
    }

    if(!barrierBag.value)
    {
      bomPricingList.value.filter( (i) =>
      {
        return barrierBagCodes.includes(i.item);
      }).forEach( (i: any) => i.isHidden = true);
    }

  bomPricingList.value.filter( (i) =>
    {
      return i.nodePath.startsWith("/"+ packagingId+"/" ) ||
      i.nodePath === "/"+packagingId;
    }).forEach( (i: any) => i.isHidden = true);
}


initFilters();

</script>


<!-- TEMPLATE -->
<template>


  <div v-if="loadingData" class="spinner-container">
    <ProgressSpinner />
  </div>


    <!-- DATA TABLE -->
    <DataTable v-model:filters="filters"
               :value="filteredItems" tableStyle="min-width: 50rem"
               :class="'p-datatable-sm'" id="bom-list"
                :globalFilterFields="['child_description']"
               ref="dt">
        <template #header>

          <div class="flex justify-content-between" style="margin-bottom: 5px;">

              <InputText v-model="itemId" placeholder="Enter Item ID"/>

              <!-- Search icon -->
              <div class="flex-initial flex align-items-center justify-content-center font-bold text-white m-2  border-round">
                <Button icon="pi pi-search" aria-label="Submit" @click="refreshData" />
              </div>


            <Dropdown v-model="packaging" :options="packingList"
                      @change="calculateTotalCost()"
                      placeholder="Select a Packing" class="w-full md:w-14rem" />


            <div class="flex align-items-center">
              <label for="barrierBagInput" class="ml-2"> Use Barrier Bag? </label>
              &nbsp;&nbsp;&nbsp;
              <Checkbox id="barrierBagInput" v-model="barrierBag" @change="calculateTotalCost()"  :binary="true" />
            </div>


            <span class="p-input-icon-left">
                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" style="margin-left: 20px" outlined @click="clearFilter()" />
                </span>

            <div class="flex ">
              <h2>Total: {{ formatCurrency( totalCost) }}</h2>
            </div>


                <div class="export">
                    <Button class="export-btn" icon="pi pi-external-link" label="Export" @click="exportCSV()" />
                </div>

            </div>

        </template>

        <!-- <template #empty>No Build of Materials Items Found.</template> -->

        <Column field="item" header="Item ID" style="width: 10%"></Column>
        <Column field="child_item" header="Item Part Number" style="width: 22%"></Column>
        <Column field="child_description" header="Item Description" style="width: 35%" header-style="text-align: right" >
          <template #body="slotProps">
            <span v-if="slotProps.data.child_description" :style="'padding-left: ' + (slotProps.data.level * 30) + 'px'  ">
            {{  slotProps.data.child_description }}
            </span>
          </template>
        </Column>
        <Column field="averagecost" style="text-align: right">
          <template #header>
            <div style="text-align: right; width: 100% ">Average Cost</div>
          </template>
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.averagecost) }}
          </template>
        </Column>

      <Column field="calculatedCost" style="text-align: right">
        <template #header>
          <div style="text-align: right; width: 100% ">Calc Cost</div>
        </template>
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.calculatedCost) }}
        </template>
      </Column>

      <Column field="lastpurchaseprice" style="text-align: right">
        <template #header>
          <div style="text-align: right; width: 100% ">Last Purchase Price</div>
        </template>
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.lastpurchaseprice) }}
        </template>
      </Column>

        <Column field="quantity" style="text-align: right">
          <template #header>
            <div style="text-align: right; width: 100% ">Qty</div>
          </template>
          <template #body="slotProps">
            {{ slotProps.data.quantity }}
          </template>
        </Column>
      <!--
      <Column field="itemsource" header="Source"></Column>
      -->

      <Column field="level" header="Level" ></Column>

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

.amount-header
{
  text-align: right;
}

.spinner-container
{
  display: inline;
  position: fixed;
  right: 0;
  z-index: 999;
  bottom: 0;
}
</style>
