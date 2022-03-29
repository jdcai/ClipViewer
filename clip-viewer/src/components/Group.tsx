import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
    TextField,
    Autocomplete,
    IconButton,
    Collapse,
    List,
    ListItemButton,
    ListItemText,
    ListItem,
    createFilterOptions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import { ExpandLess, ExpandMore, OpenInNew } from '@mui/icons-material';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../stores/UserStore';
import { getUsers } from '../services/UserService';

const GroupComponentContainer = styled.div`
    margin-bottom: 8px;
`;

const GroupName = styled.div`
    cursor: pointer;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;

const NameContainer = styled.div`
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;

const Container = styled.div`
    align-items: center;
    display: flex;
`;

const IndentedListItemButton = styled(ListItemButton)`
    padding: 0 2rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;

const IndentedListItem = styled(ListItem)`
    padding-left: 2rem;
`;

const CustomTextField = styled(TextField)`
    & .MuiFormHelperText-root.Mui-error {
        position: absolute;
        top: 80%;
    }
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
    const userFollows: any[] = useUserStore((state) => state.userFollows);
    const setUserFollows = useUserStore((state) => state.setUserFollows);
    const currentUser: any = useUserStore((state) => state.currentUser);
    const [isEditingGroup, setIsEditingGroup] = useState(isNew);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [groupName, setGroupName] = useState(group.name);
    const [hasUserError, setHasUserError] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const filter = createFilterOptions<any>();
    const navigate = useNavigate();

    const resetEditing = () => {
        setIsEditingGroup(false);
        setIsAddingUser(false);
    };

    const addUser = (newUser: any) => {
        if (
            newUser &&
            !group.users.some((user) => {
                return user.id === newUser.to_id;
            })
        ) {
            setGroups({
                ...groups,
                [id]: {
                    ...groups[id],
                    users: [...groups[id].users, { name: newUser?.to_name, id: newUser?.to_id }],
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
    };

    const checkSelectedUser = async (value: any) => {
        if (!value) {
            setHasUserError(false);
            return;
        }

        if (typeof value === 'string') {
            try {
                const result = await getUsers([value]);
                const users = JSON.parse(result?.data?.data?.users);
                if (users?.length) {
                    addUser({ to_name: users[0].display_name, to_id: users[0].id });
                    setHasUserError(false);
                } else {
                    setHasUserError(true);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            addUser(value);
            setHasUserError(false);
        }
    };

    return (
        <>
            <GroupComponentContainer>
                {!isEditingGroup && (
                    <>
                        <ListItemButton
                            onClick={(event: any) => {
                                event.stopPropagation();

                                navigate('/', {
                                    replace: true,
                                    state: {
                                        title: groupName,
                                        broadcasters: group.users.map((user) => {
                                            return user.id;
                                        }),
                                    },
                                });
                            }}
                        >
                            <ListItemText primary={<GroupName title={groupName}>{groupName}</GroupName>} />
                            <Container>
                                <IconButton
                                    aria-label="Edit group"
                                    title="Edit group"
                                    onClick={(event: any) => {
                                        event.stopPropagation();
                                        setIsEditingGroup(true);
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    aria-label={expanded ? 'Collapse' : 'Expand'}
                                    title={expanded ? 'Collapse' : 'Expand'}
                                    onClick={(event: any) => {
                                        event.stopPropagation();
                                        setExpanded(!expanded);
                                    }}
                                >
                                    {expanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Container>
                        </ListItemButton>
                    </>
                )}
                {isEditingGroup && (
                    <ListItem disablePadding>
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
                        <IconButton aria-label="Stop editing" title="Stop editing" onClick={() => resetEditing()}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton aria-label="Delete group" title="Delete group" onClick={() => deleteGroup()}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </ListItem>
                )}

                <Collapse in={expanded || isEditingGroup} timeout="auto" unmountOnExit>
                    <List dense component="div" disablePadding>
                        {group.users.map((user) => {
                            return (
                                <ListItem key={user.id} disablePadding>
                                    <IndentedListItemButton
                                        onClick={() =>
                                            navigate('/', {
                                                replace: true,
                                                state: { title: user.name, broadcasters: [user.id] },
                                            })
                                        }
                                    >
                                        <ListItemText primary={<NameContainer>{user.name}</NameContainer>} />
                                    </IndentedListItemButton>
                                    {isEditingGroup && (
                                        <IconButton
                                            size="small"
                                            aria-label="Remove user"
                                            title="Remove user"
                                            onClick={() => removeUser(user.id)}
                                        >
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </ListItem>
                            );
                        })}
                    </List>
                </Collapse>

                {isEditingGroup && !isAddingUser && (
                    <IndentedListItemButton
                        aria-label="Add user"
                        title="Add user"
                        onClick={() => setIsAddingUser(true)}
                    >
                        <AddIcon />
                    </IndentedListItemButton>
                )}
                {isEditingGroup && isAddingUser && (
                    <IndentedListItem>
                        <Autocomplete
                            freeSolo
                            id="combo-box-demo"
                            options={userFollows}
                            onChange={(_0: any, value: any) => checkSelectedUser(value)}
                            style={{ width: '100%' }}
                            getOptionLabel={(option: any) => option.to_name ?? option}
                            isOptionEqualToValue={(option: any, value: any) => {
                                const valueUser = typeof value === 'string' ? value : value.to_login;
                                return option?.to_login === valueUser?.toLowerCase();
                            }}
                            filterOptions={(options: any, params: any) => {
                                const filtered = filter(options, params);

                                const { inputValue } = params;

                                // Suggest the creation of a new value
                                const isExisting = options.some((option: any) => inputValue === option.to_name);

                                if (inputValue !== '' && !isExisting) {
                                    filtered.push(inputValue);
                                }

                                return filtered;
                            }}
                            openOnFocus
                            renderInput={(params: unknown) => (
                                <CustomTextField
                                    {...params}
                                    label="Username"
                                    autoFocus
                                    variant="outlined"
                                    size="small"
                                    error={hasUserError}
                                    helperText={hasUserError ? 'User does not exist' : ''}
                                />
                            )}
                        />
                    </IndentedListItem>
                )}
            </GroupComponentContainer>
        </>
    );
};

export default Group;
