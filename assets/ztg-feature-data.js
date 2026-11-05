import featuresMetasRaw from './ztg-features-meta.json.js';
import importedFeaturesRaw from './ztg-imported-features.json.js';
import renamedFeatures from './ztg-feature-renames.json.js';

// Run `npm run vitest` to update these files

const importedFeatures = importedFeaturesRaw ;
const featuresMeta = featuresMetasRaw ;

function getNewFeatureName(possibleFeatureName) {
	// @ts-expect-error Useless "no index type" error as usual
	const newFeatureName = renamedFeatures[possibleFeatureName]  ?? possibleFeatureName;
	return importedFeatures.includes(newFeatureName) ? newFeatureName : undefined;
}

function getOldFeatureNames(featureName) {
	const oldNames = [];
	for (const [oldName, newName] of Object.entries(renamedFeatures)) {
		if (newName === featureName) {
			oldNames.push(oldName);
		}
	}

	return oldNames;
}

export { featuresMeta, getNewFeatureName, getOldFeatureNames, importedFeatures };
