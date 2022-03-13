import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { TextField, Autocomplete, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../stores/UserStore';
import { getUserFollows } from '../services/UserService';

const GroupComponentContainer = styled.div`
    margin-bottom: 8px;
`;

const GroupNameContainer = styled.div`
    align-items: center;
    font-weight: 600;
    display: flex;
    svg {
        margin-left: 4px;
    }
`;

const GroupName = styled.div`
    cursor: pointer;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;

const EditGroupNameContainer = styled.div`
    margin-top: 8px;
    align-items: center;
    display: flex;
    svg {
        margin-left: 4px;
    }
`;

const NameContainer = styled.div`
    display: flex;
    svg {
        margin-left: 4px;
    }
`;

const Container = styled.div`
    align-items: center;
    display: flex;
`;

const AddNameContainer = styled.div`
    align-items: center;
    display: flex;
    margin-top: 8px;
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

const Group = (props: {
    id: string;
    isNew: boolean;
    group: GroupType;
    groups: GroupContainer;
    setGroups: Dispatch<SetStateAction<GroupContainer>>;
}) => {
    const { id, isNew, group, groups, setGroups } = props;
    const userFollows: any = useUserStore((state) => state.userFollows);
    const setUserFollows = useUserStore((state) => state.setUserFollows);

    const [selectedUser, setSelectedUser] = useState<any>();
    const [isEditingGroup, setIsEditingGroup] = useState(isNew);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [groupName, setGroupName] = useState(group.name);
    const navigate = useNavigate();

    // const location = useLocation<any>();

    useEffect(() => {
        if (!userFollows) {
            getUserFollows().then((result) => {
                setUserFollows(result);
            });
        }
    }, []);

    const addUser = () => {
        if (
            selectedUser &&
            !group.users.some((user) => {
                return user.id === selectedUser.to_id;
            })
        ) {
            setGroups({
                ...groups,
                [id]: {
                    ...groups[id],
                    users: [...groups[id].users, { name: selectedUser?.to_name, id: selectedUser?.to_id }],
                },
            });
        }
        setIsAddingUser(false);
    };

    const saveGroupName = (name: string) => {
        setGroups({ ...groups, [id]: { ...group, name: name } });
    };

    const deleteGroup = () => {
        const { [id]: removedGroup, ...restOfTheGroups } = groups;
        setGroups(restOfTheGroups);
        setIsEditingGroup(false);
    };

    const removeUser = (userId: string) => {
        const users = group.users.filter((user) => user.id !== userId);
        setGroups({
            ...groups,
            [id]: {
                ...groups[id],
                users: users,
            },
        });
        setIsEditingGroup(false);
    };

    return (
        <>
            <GroupComponentContainer>
                {!isEditingGroup && (
                    <GroupNameContainer>
                        <GroupName
                            title={groupName}
                            onClick={() => {
                                if (group.users.length) {
                                    navigate('clips', {
                                        replace: true,
                                        state: {
                                            title: groupName,
                                            broadcasters: group.users.map((user) => {
                                                return user.id;
                                            }),
                                        },
                                    });
                                }
                            }}
                        >
                            {groupName}
                        </GroupName>
                        <Container>
                            <IconButton aria-label="Edit group" title="Edit group">
                                <EditIcon fontSize="small" onClick={() => setIsEditingGroup(true)} />
                            </IconButton>
                        </Container>
                    </GroupNameContainer>
                )}
                {isEditingGroup && (
                    <EditGroupNameContainer>
                        <TextField
                            label="Group Name"
                            value={groupName}
                            autoFocus={true}
                            required={true}
                            type="text"
                            size="small"
                            onChange={(result) => setGroupName(result.currentTarget.value)}
                            onBlur={(result) => saveGroupName(result.currentTarget.value)}
                            variant="outlined"
                        ></TextField>
                        <IconButton aria-label="Stop editing" title="Stop editing">
                            <EditIcon fontSize="small" onClick={() => setIsEditingGroup(false)} />
                        </IconButton>
                        <IconButton aria-label="Delete group" title="Delete group">
                            <DeleteIcon onClick={() => deleteGroup()} />
                        </IconButton>
                    </EditGroupNameContainer>
                )}
                {group.users.map((user) => {
                    return (
                        <NameContainer key={user.id}>
                            <div>-{user.name}</div>
                            {isEditingGroup && (
                                <IconButton aria-label="Remove user" title="Remove user">
                                    <ClearIcon onClick={() => removeUser(user.id)} />
                                </IconButton>
                            )}
                        </NameContainer>
                    );
                })}
                {isEditingGroup && !isAddingUser && (
                    <IconButton aria-label="Add user" title="Add user">
                        <AddIcon onClick={() => setIsAddingUser(true)} />
                    </IconButton>
                )}
                {isEditingGroup && isAddingUser && (
                    <AddNameContainer>
                        <Autocomplete
                            freeSolo={true}
                            id="combo-box-demo"
                            options={userFollows}
                            getOptionLabel={(option: any) => option.to_name}
                            onChange={(_0, value: any) => setSelectedUser(value)}
                            style={{ width: '100%' }}
                            renderInput={(params: unknown) => (
                                <TextField {...params} label="Username" variant="outlined" size="small" />
                            )}
                        />
                        <IconButton aria-label="Add user" title="Add user">
                            <AddIcon onClick={() => addUser()} />
                        </IconButton>
                    </AddNameContainer>
                )}
            </GroupComponentContainer>
        </>
    );
};

export default Group;
