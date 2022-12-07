import React, { useEffect, useRef, useState } from 'react';
import { List, ListItemButton, ListItemText, ListSubheader, Divider } from '@mui/material';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import useUserStore from '../../stores/UserStore';
import Group from './Group';
import { v4 as uuidv4 } from 'uuid';
import { GroupContainer } from '../../types/GroupTypes';
import EditGroup from './EditGroup';

const CustomListItemButton = styled.div`
    margin-top: auto;
    width: 100%;
`;

const ListContainer = styled.div`
    overflow-y: auto;
`;

const Groups = () => {
    const location = useLocation();
    const currentUser: any = useUserStore((state) => state.currentUser);
    const [editID, setEditID] = useState<string>();
    const [groups, setGroups] = useState<GroupContainer>({});
    const navigate = useNavigate();
    const isInitialMount = useRef(true);

    useEffect(() => {
        let tempGroups = localStorage.getItem(`${currentUser?.id ?? 'default'}-groups`);
        if (tempGroups) {
            setGroups(JSON.parse(tempGroups));
        } else {
            tempGroups = localStorage.getItem('default-groups');
            if (tempGroups) {
                setGroups(JSON.parse(tempGroups));
            } else {
                setGroups({});
            }
        }
    }, [currentUser]);

    // useEffect(() => {
    //     if (isInitialMount.current) {
    //         isInitialMount.current = false;
    //     } else {
    //         localStorage.setItem(`${currentUser?.id ?? 'default'}-groups`, JSON.stringify(groups));
    //     }
    // }, [groups]);

    const updateGroupHandler = (newGroups: GroupContainer) => {
        localStorage.setItem(`${currentUser?.id ?? 'default'}-groups`, JSON.stringify(newGroups));
        setGroups(newGroups);
    };

    const createGroup = () => {
        const id = uuidv4();
        setEditID(id);
        setGroups({ ...groups, [id]: { name: 'New group', users: [], expanded: false } });
    };

    return (
        <>
            {editID !== undefined && (
                <EditGroup
                    id={editID}
                    group={groups[editID]}
                    groups={groups}
                    setEditID={setEditID}
                    onUpdateGroup={updateGroupHandler}
                ></EditGroup>
            )}
            {editID === undefined && (
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
                                editID === undefined &&
                                Object.keys(groups).map((groupID) => {
                                    return (
                                        <Group
                                            key={groupID}
                                            id={groupID}
                                            group={groups[groupID]}
                                            groups={groups}
                                            onUpdateGroup={updateGroupHandler}
                                            setEditID={setEditID}
                                        ></Group>
                                    );
                                })}
                        </List>
                    </ListContainer>
                    <CustomListItemButton>
                        <Divider />
                        <ListItemButton onClick={() => createGroup()}>
                            <ListItemText>Create new group</ListItemText>
                        </ListItemButton>
                    </CustomListItemButton>
                </>
            )}
        </>
    );
};

export default Groups;
