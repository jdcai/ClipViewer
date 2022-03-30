import axios from 'axios';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useUserStore from '../stores/UserStore';

// Change to axios and set current user
const Authorize = () => {
    const setCurrentUser = useUserStore((state) => state.setCurrentUser);
    const params = new URLSearchParams(useLocation().search);
    const navigate = useNavigate();
    useEffect(() => {
        const callAuthorize = async () => {
            const code = params.has('code') ? params.get('code') : '';
            try {
                await axios.post('/authorize', {
                    code: code,
                });
                const result = await axios.get('/currentUser');

                const user = result?.data;
                if (user?.id) {
                    setCurrentUser(user);
                }
            } catch (error) {
                console.error(error);
            }
        };
        callAuthorize();
        navigate('/');
    }, []);

    return null;
};

export default Authorize;
