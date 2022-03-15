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

export const getUsers = (loginNames: string[]) => {
    const formattedLoginNames = loginNames.map((id: string) => `"${id}"`).join(',');
    return (
        axios
            .post('/graphql', {
                method: 'POST',
                query: `
    {
        users(loginNames:[${formattedLoginNames}])
    }
    `,
            })
            .then((result) => {
                return JSON.parse(result.data.data.users);
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
