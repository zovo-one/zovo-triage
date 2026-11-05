import { normalizeLicenseKey, isLicenseShape, responseGrantsAccess } from './ztg-license-core.js';

const LICENSE_ENDPOINT = 'https://zgubxqomnbmxgbdhvwja.supabase.co/functions/v1/verify-extension-license';
const ENTITLEMENT_KEY = 'ztg.v2.entitlement';
const LICENSE_ALARM = 'ztg.v2.license-reverify';

 





async function verifyLicense(value) {
	const key = normalizeLicenseKey(value);
	if (!isLicenseShape(key)) {
		throw new Error('Use ZOVO- followed by four groups of four letters or numbers.');
	}

	const publicKey = "sb_publishable_RG4IVO9Qm23_xPzdQjdFPQ_QHBwbOLv".trim();
	if (!publicKey) {
		throw new Error('Licence service is missing its build key.');
	}

	const controller = new AbortController();
	const timer = setTimeout(() => {
		controller.abort();
	}, 8000);
	try {
		const response = await fetch(LICENSE_ENDPOINT, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'apikey': publicKey,
				'authorization': `Bearer ${publicKey}`,
			},
			// eslint-disable-next-line @typescript-eslint/naming-convention -- Live API contract.
			body: JSON.stringify({license_key: key, extension: 'triage-v2'}),
			signal: controller.signal,
		});
		if (!response.ok) {
			throw new Error('Licence service did not accept the request.');
		}

		const payload = await response.json();
		if (!responseGrantsAccess(payload)) {
			throw new Error('That licence is not valid.');
		}

		const entitlement = {key, valid: true, verifiedAt: Date.now()};
		await chrome.storage.local.set({[ENTITLEMENT_KEY]: entitlement});
		return entitlement;
	} finally {
		clearTimeout(timer);
	}
}

export { ENTITLEMENT_KEY, LICENSE_ALARM, LICENSE_ENDPOINT, verifyLicense };
