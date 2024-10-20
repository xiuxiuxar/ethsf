<script>
	// @ts-nocheck
	import { onMount } from "svelte";
	import { getToastStore } from "@skeletonlabs/skeleton";

	import { signerAddress, chainId } from "ethers-svelte";
	import { postData } from "../actions";
	import { PATH } from "../consts";
	import { formConfigMock as formConfig } from "../mock";

	// let formConfig = {};
	let formData = {};

	const toastStore = getToastStore();

	// Function to fetch configuration based on form name
	async function fetchFormConfig() {
		try {
			// const response = await fetch(`/api/${PATH.FORM_CONFIG}`);
			// if (!response.ok) throw new Error('Failed to fetch configuration data.');

			// formConfig = await response.json();
			initializeFormData(formConfig.fields);
		} catch (error) {
			console.error("Error fetching form configuration:", error);
			toastStore.trigger({
				message: "Error loading form configuration",
				timeout: 5000,
			});
		}
	}

	// Initialize form data based on dynamic keys from configuration
	function initializeFormData(fields) {
		formData = {};
		fields.forEach((field) => {
			formData[field.name] = field.defaultValue || null; // Initialize fields with default values if available
		});
	}

	// Example to call fetchFormConfig on mount with a form name
	onMount(() => fetchFormConfig());

	async function onSubmit() {
		const payload = {
			data: {
				...formData,
			},
			form_name: formConfig.form_name,
			chain_id: Number($chainId),
			user_address: String($signerAddress),
		};

		try {
			const response = await postData(
				`${PATH.SUBMIT}/${PATH.FORM}`,
				payload,
			);
			if (response.status === "success") {
				toastStore.trigger({
					message: "Form submitted successfully!",
					timeout: 5000,
				});
				initializeFormData(formConfig.fields); // Reset the form
			} else {
				throw new Error(response.message || "Failed to submit form");
			}
		} catch (error) {
			toastStore.trigger({
				message: error.message || "Submission error",
				timeout: 5000,
			});
			console.error(error);
		}
	}
</script>

<section>
	<h1>{formConfig.form_name || "Form"}</h1>
	<div class="form-container flex gap-2">
		{#each formConfig.fields as field}
			<label class="label">
				<span>{field.label}</span>
				{#if field.type === "select"}
					<select bind:value={formData[field.name]} class="select">
						{#each field.options as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				{:else if field.type === "number"}
					<input
						type="number"
						class="input"
						min={field.min}
						max={field.max}
						placeholder={field.placeholder}
						bind:value={formData[field.name]}
					/>
				{:else}
					<input
						type="text"
						class="input"
						placeholder={field.placeholder}
						bind:value={formData[field.name]}
					/>
				{/if}
			</label>
		{/each}
		<div class="flex justify-end flex-col">
			<button
				disabled={!$signerAddress}
				type="submit"
				class="btn-sm btn variant-ghost-surface"
				on:click={onSubmit}
			>
				Submit
			</button>
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
