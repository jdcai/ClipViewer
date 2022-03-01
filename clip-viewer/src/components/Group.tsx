import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import 'fontsource-roboto';
// Do https://material-ui.com/guides/minimizing-bundle-size/
import { TextField, Autocomplete } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import styled from 'styled-components';
import { useHistory, useLocation } from 'react-router-dom';
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
    const [groupName, setGroupName] = useState(props.group.name);
    const history = useHistory();

    // const location = useLocation<any>();

    useEffect(() => {
        if (!userFollows) {
            getUserFollows().then((result) => {
                setUserFollows(result);
            });
        }
    }, []);

    const addToGroup = () => {
        if (
            selectedUser &&
            !group.users.some((user) => {
                return user.id === selectedUser.to_id;
            })
        ) {
            props.setGroups({
                ...props.groups,
                [id]: {
                    ...props.groups[id],
                    users: [...props.groups[id].users, { name: selectedUser?.to_name, id: selectedUser?.to_id }],
                },
            });
        }
        setIsAddingUser(false);
    };

    const saveGroupName = (name: string) => {
        props.setGroups({ ...props.groups, [id]: { ...group, name: name } });
    };

    const deleteGroup = () => {
        setIsEditingGroup(false);
        const { [id]: removedGroup, ...groups } = props.groups;
        props.setGroups(groups);
    };

    return (
        <>
            <GroupComponentContainer>
                {!isEditingGroup && (
                    <GroupNameContainer>
                        <GroupName
                            onClick={() =>
                                history.push('clips', {
                                    broadcasters: group.users.map((user) => {
                                        return user.id;
                                    }),
                                })
                            }
                        >
                            {groupName}
                        </GroupName>
                        <Container>
                            <EditIcon fontSize="small" onClick={() => setIsEditingGroup(true)} />
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
                        <EditIcon fontSize="small" onClick={() => setIsEditingGroup(false)} />
                        {/* <SaveIcon onClick={() => saveGroup()} /> */}
                        <DeleteIcon onClick={() => deleteGroup()} />
                    </EditGroupNameContainer>
                )}
                {group.users.map((user) => {
                    return (
                        <NameContainer key={user.id}>
                            <div>-{user.name}</div>
                            {isEditingGroup && <ClearIcon />}
                        </NameContainer>
                    );
                })}
                {isEditingGroup && !isAddingUser && <AddIcon onClick={() => setIsAddingUser(true)} />}
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
                        <AddIcon onClick={() => addToGroup()} />
                    </AddNameContainer>
                )}
            </GroupComponentContainer>
        </>
    );
};

export default Group;
