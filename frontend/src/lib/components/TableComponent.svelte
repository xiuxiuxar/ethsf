<script>
	// @ts-nocheck

	import { signerAddress } from 'ethers-svelte';
	import { Table, tableMapperValues, getToastStore } from '@skeletonlabs/skeleton';

	import { postData } from '../actions';
	import { PATH } from '../consts';

	export let data;
	export let allowActions = false;

	const toastStore = getToastStore();

	const tableSimple = {
		// A list of heading labels.
		head: ['AMOUNT IN', 'ASK', 'BID', 'BUYER', 'CHAIN', 'EXPIRATION'],
		// The data visibly shown in your table body UI.
		body: tableMapperValues(data, [
			'amount_in',
			'ask_token_id',
			'bid_token_id',
			'buyer_wallet_address',
			'chain_id',
			'expiration_time'
		])
	};

	async function mySelectionHandler(e) {
		const payload = {};
		const id = 1;
		const path = `${PATH.RFQ}/${id}/${PATH.ACCEPT}`;
		try {
			const res = await postData(path, payload);
			const toast = {
				message: 'Accepted the RFQ!',
				timeout: 5000
			};
			toastStore.trigger(toast);
		} catch (e) {
			const toast = {
				message: e,
				timeout: 5000
			};
			toastStore.trigger(toast);
		}
	}
</script>

<Table source={tableSimple} interactive={true} on:selected={mySelectionHandler} />
