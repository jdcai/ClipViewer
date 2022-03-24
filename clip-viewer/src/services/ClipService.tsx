import axios from 'axios';
import { Moment } from 'moment';

export const getClips = async (broadcasters: string[], started_at: Moment | null, ended_at: Moment | null) => {
    const broadcastersString = broadcasters.map((id: string) => `"${id}"`).join(',');
    let query = `
    {
        clips(broadcasterIds: [${broadcastersString}])
    }
    `;
    if (started_at && ended_at) {
        query = `
        {
            clips(broadcasterIds: [${broadcastersString}], startedAt: "${started_at.toISOString()}", endedAt: "${ended_at.toISOString()}")
        }
        `;
    }
    return axios.post('/graphql', {
        method: 'POST',
        query: query,
    });
};
