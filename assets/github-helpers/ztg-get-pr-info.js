import api from './ztg-api.js';
import { getConversationNumber } from './ztg-index.js';

async function getPrInfo(base, number = getConversationNumber()) {
	const {repository} = await api.v4uncached(`
		repository() {
			pullRequest(number: ${number}) {
				id
				baseRefOid
				headRefOid
				mergeable
				viewerCanUpdate
				viewerCanEditFiles
				headRef {
					compare(headRef: "${base}") {
						status
						aheadBy
					}
				}
				headRepository {
					viewerPermission
				}
			}
		}
	`);

	const {
		id,
		baseRefOid,
		headRefOid,
		mergeable,
		viewerCanUpdate,
		viewerCanEditFiles,
		headRef,
		headRepository,
	} = repository.pullRequest;
	return {
		id,
		baseRefOid,
		headRefOid,
		viewerCanUpdate,
		mergeable,
		viewerCanEditFiles,
		// The comparison in the API is base -> head, so it must be flipped
		behindBy: headRef.compare.aheadBy,
		needsUpdate: headRef.compare.status === 'DIVERGED',
		headRepoPerm: headRepository.viewerPermission,
	};
}

export { getPrInfo as default };
