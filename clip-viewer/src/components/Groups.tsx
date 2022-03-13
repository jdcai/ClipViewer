import React, { useEffect, useRef, useState } from 'react';
import { Button, TextField, Autocomplete } from '@mui/material';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import useUserStore from '../stores/UserStore';
import axios from 'axios';
import Group from './Group';
import { v4 as uuidv4 } from 'uuid';

const GroupsContainer = styled.div`
    margin: 0.5rem;
`;

interface FollowingUser {
    name: string;
    id: string;
}

interface GroupType {
    name: string;
    users: FollowingUser[];
}

interface GroupContainer {
    [key: string]: GroupType;
}

interface EditingStates {
    [key: string]: boolean;
}

const Groups = () => {
    const location = useLocation();
    const currentUser: any = useUserStore((state) => state.currentUser);
    const [isNew, setIsEditing] = useState<EditingStates>({});
    const [follows, setFollows] = useState([]);
    const [groups, setGroups] = useState<GroupContainer>({});
    const navigate = useNavigate();
    const isInitialMount = useRef(true);

    useEffect(() => {
        const tempGroups = localStorage.getItem('groups');
        if (tempGroups) {
            setGroups(JSON.parse(tempGroups));
        }
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
                setFollows(JSON.parse(result.data.data.follows));
            })
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.

            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    console.log(error);
                }
            });
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            localStorage.setItem('groups', JSON.stringify(groups));
        }
    }, [groups]);

    const createGroup = () => {
        const id = uuidv4();
        setIsEditing({ ...isNew, [id]: true });
        setGroups({ ...groups, [id]: { name: '', users: [] } });
    };

    return (
        <GroupsContainer>
            {groups &&
                Object.keys(groups).map((groupID) => {
                    return (
                        <Group
                            key={groupID}
                            id={groupID}
                            group={groups[groupID]}
                            groups={groups}
                            setGroups={setGroups}
                            isNew={isNew[groupID]}
                        ></Group>
                    );
                })}

            <Button variant="contained" color="primary" onClick={() => createGroup()}>
                Create Group
            </Button>
        </GroupsContainer>
    );
};

export default Groups;
