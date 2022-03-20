import axios from 'axios';
import { Moment } from 'moment';

export const getClips = (broadcasters: string[], started_at: Moment | null, ended_at: Moment | null) => {
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
    return (
        axios
            .post('/graphql', {
                method: 'POST',
                query: query,
            })
            .then((result) => {
                return JSON.parse(result.data.data.clips);
            })
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.

            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    console.log(error);
                }
                return [];
            })
    );
};
