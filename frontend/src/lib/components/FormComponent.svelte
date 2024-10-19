<script>
	// @ts-nocheck
	import { getToastStore } from '@skeletonlabs/skeleton';

	import { signerAddress, chainId } from 'ethers-svelte';
	import { postData } from '../actions';
	import { PATH } from '../consts';

	let amount;
	let selectedTokenAsk;
	let selectedTokenBid;
	let time;

	const toastStore = getToastStore();

	async function onSubmit() {
		// Get the current timestamp in milliseconds
		const now = Date.now();

		// Add 30 seconds (30 * 1000 milliseconds)
		const timestampIn30Seconds = now + 30 * 1000;

		const payload = {
			amount_in: amount,
			bid_token_id: selectedTokenAsk,
			ask_token_id: selectedTokenBid,
			chain_id: Number($chainId),
			buyer_wallet_address: String($signerAddress),
			expiration_time: timestampIn30Seconds
		};
		try {
			const resp = await postData(PATH.RFQ, payload);
			const toast = {
				message: 'Submitted new RFQ!',
				timeout: 5000
			};
			toastStore.trigger(toast);
			amount = null;
		} catch (e) {
			const toast = {
				message: e,
				timeout: 5000
			};
			toastStore.trigger(toast);
			amount = null;
		}
	}
</script>

<section>
	<h1>New RFQs</h1>
	<div class="rfq-form flex gap-2">
		<label class="label">
			<span> Amount In </span>
			<input class="input" requred type="text" placeholder="Amount In" bind:value={amount} />
		</label>
		<label class="label">
			<span> Ask </span>
			<select bind:value={selectedTokenAsk} class="select">
				<option value="WETH">WETH</option>
				<option value="WBTC">WBTC</option>
				<option value="DAI">DAI</option>
				<option value="USDC">USDC</option>
			</select>
		</label>
		<label class="label">
			<span> Bid </span>
			<select bind:value={selectedTokenBid} class="select">
				<option value="WETH">WETH</option>
				<option value="WBTC">WBTC</option>
				<option value="DAI">DAI</option>
				<option value="USDC">USDC</option>
			</select>
		</label>
		<div class="flex justify-end flex-col">
			<button
				disabled={!$signerAddress}
				type="submit"
				class="btn-sm btn variant-ghost-surface"
				on:click={onSubmit}>Submit</button
			>
		</div>
	</div>
</section>

<style>
	span {
		color: #f682aa;
		text-transform: uppercase;
		font-size: 10px;
	}
	button {
		height: 43px;
	}
</style>
