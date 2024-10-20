// @ts-nocheck
import { URLS } from "./consts";

export async function postData(path, payload) {
    console.log(payload)
    const response = await fetch(`${URLS.BASE}${path}`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        return { errro: true, status: response.status, message: 'Failed to post' };
    }

    const data = await response.json();
    return data;
}

export async function getData(path) {
    const response = await fetch(`${URLS.BASE}${path}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log('response', response)
    if (!response.ok) {
        return { errro: true, status: response.status, message: 'Failed to get' };
    }

    const data = await response.json();
    console.log('data', data)
    return data;
}
