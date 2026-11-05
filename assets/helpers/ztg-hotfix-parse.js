import compareVersions from '../npm/ztg-tiny-version-compare.js';

function parseBrokenFeaturesCsv(content, currentVersion) {
	const entries = [];
	const [, ...rows] = content.trim().split('\n');
	for (const row of rows) {
		if (!row.trim()) {
			continue;
		}

		const [featureId, relatedIssue, unaffectedVersion] = row.split(',').map(cell => cell.trim());
		if (featureId && relatedIssue && (!unaffectedVersion || compareVersions(unaffectedVersion, currentVersion) > 0)) {
			entries.push([featureId , relatedIssue, unaffectedVersion]);
		}
	}

	return entries;
}

export { parseBrokenFeaturesCsv };
