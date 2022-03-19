import React, { useEffect, useRef, useState } from 'react';
import { List, ListItemButton, ListItemText, ListSubheader } from '@mui/material';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import useUserStore from '../stores/UserStore';
import Group from './Group';
import { v4 as uuidv4 } from 'uuid';

const CustomListItemButton = styled.div`
    margin-top: auto;
    width: 100%;
`;

const ListContainer = styled.div`
    overflow-y: auto;
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
    const [groups, setGroups] = useState<GroupContainer>({});
    const navigate = useNavigate();
    const isInitialMount = useRef(true);

    useEffect(() => {
        const tempGroups = localStorage.getItem(`${currentUser.id}-groups`);
        if (tempGroups) {
            setGroups(JSON.parse(tempGroups));
        }
    }, [currentUser]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            localStorage.setItem(`${currentUser.id}-groups`, JSON.stringify(groups));
        }
    }, [groups]);

    const createGroup = () => {
        const id = uuidv4();
        setIsEditing({ ...isNew, [id]: true });
        setGroups({ ...groups, [id]: { name: '', users: [] } });
    };

    return (
        <>
            <ListContainer>
                <List
                    component="nav"
                    dense
                    aria-labelledby="groups-subheader"
                    subheader={
                        <ListSubheader component="div" id="groups-subheader">
                            Groups
                        </ListSubheader>
                    }
                >
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
                </List>
            </ListContainer>
            <CustomListItemButton>
                <ListItemButton onClick={() => createGroup()}>
                    <ListItemText>Create new group</ListItemText>
                </ListItemButton>
            </CustomListItemButton>
        </>
    );
};

export default Groups;
