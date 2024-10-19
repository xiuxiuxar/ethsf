<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';

	import TableComponent from '$lib/components/TableComponent.svelte';
	import { getData } from '../actions';
	import { PATH } from '../consts';
	import { rfqDataMock } from '../mock';

	let rfqData = rfqDataMock; // TODO: remove mock
	let tradesData = [];
	const TABLE_NAMES = {
		RFQ: 'rfqTable',
		TRADES: 'tradesTable'
	};
	let tabSet = 'rfqTable';

	$: tableData = tabSet === TABLE_NAMES.RFQ ? rfqData : tradesData;

	async function fetchTableData() {
		const data = await getData(PATH.RFQ);
		console.log(data);

		if (data?.length) {
			rfqData = data;
		}
	}

	onMount(() => {
		try {
			fetchTableData();
		} catch (e) {
			console.log('error fetching: ', e);
		}
	});
</script>

<TabGroup>
	<Tab bind:group={tabSet} name="tab1" value={TABLE_NAMES.RFQ}>
		<span>RFQs</span>
	</Tab>
	<Tab bind:group={tabSet} name="tab2" value={TABLE_NAMES.TRADES}>Finalized Trades</Tab>
	<svelte:fragment slot="panel">
		{#if tabSet === TABLE_NAMES.RFQ}
			<TableComponent data={tableData} allowActions={true} />
		{:else if tabSet === TABLE_NAMES.TRADES}
			<TableComponent data={tableData} />
		{/if}
	</svelte:fragment>
</TabGroup>
