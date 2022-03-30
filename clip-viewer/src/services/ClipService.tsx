import axios from 'axios';
import { Moment } from 'moment';

export const getClips = async (
    broadcasters: string[],
    startedAt: Moment | null,
    endedAt: Moment | null,
    topEach: boolean,
) => {
    const broadcastersString = broadcasters.map((id: string) => `"${id}"`).join(',');
    let query = `
    {
        clips(broadcasterIds: [${broadcastersString}], topEach: ${topEach})
    }
    `;
    if (startedAt && endedAt) {
        query = `
        {
            clips(broadcasterIds: [${broadcastersString}], startedAt: "${startedAt.toISOString()}", endedAt: "${endedAt.toISOString()}", topEach: ${topEach})
        }
        `;
    }
    return axios.post('/graphql', {
        method: 'POST',
        query: query,
    });
};
