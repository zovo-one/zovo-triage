const LICENSE_PATTERN = /^ZOVO-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/;

function normalizeLicenseKey(value) {
	return value.trim().toUpperCase();
}

function isLicenseShape(value) {
	return LICENSE_PATTERN.test(normalizeLicenseKey(value));
}

function responseGrantsAccess(value) {
	return typeof value === 'object' && value !== null && (value ).valid === true;
}

export { LICENSE_PATTERN, isLicenseShape, normalizeLicenseKey, responseGrantsAccess };
