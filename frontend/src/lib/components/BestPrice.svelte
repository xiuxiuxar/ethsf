<script>
	let price = '10';
	const PRICE_URL = 'http://localhost:5556';

	function getPrice() {}
</script>

<section>
	<h1>Best Price</h1>
	<div class="flex justify-center">
		<input type="text" bind:value={price} placeholder="Best Price" disabled />
	</div>
</section>

<style>
	input {
		margin-bottom: 10px;
		padding: 5px;
		background-color: black;
		border-radius: 4px;
		width: 50%;
		height: 50px;
	}
</style>
