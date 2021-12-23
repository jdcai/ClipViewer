import axios from 'axios';

export const getUserFollows = () => {
    return (
        axios
            .post('/graphql', {
                method: 'POST',
                query: `
    {
        follows(userId:"")
    }
    `,
            })
            .then((result) => {
                console.log('result', JSON.parse(result.data.data.follows));
                return JSON.parse(result.data.data.follows);
            })
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.

            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    console.log(error);
                }
            })
    );
};
