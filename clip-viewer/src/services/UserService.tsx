import axios from 'axios';

export const getUserFollows = async (userId: string) => {
    return axios.post('/graphql', {
        method: 'POST',
        query: `
    {
        follows(userId:"${userId}")
    }
    `,
    });
};

export const getUsers = async (loginNames: string[]) => {
    const formattedLoginNames = loginNames.map((id: string) => `"${id}"`).join(',');
    return axios.post('/graphql', {
        method: 'POST',
        query: `
    {
        users(loginNames:[${formattedLoginNames}])
    }
    `,
    });
};
