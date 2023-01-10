import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
    TextField,
    Autocomplete,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    ListItem,
    ListSubheader,
    createFilterOptions,
    AutocompleteRenderInputParams,
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../stores/UserStore';
import { getUsers } from '../../services/UserService';
import { GroupType, GroupContainer } from '../../types/GroupTypes';

const ListFooter = styled.div`
    margin-top: auto;
    width: 100%;
`;
const ConfirmDeleteLabel = styled.div`
    padding: 8px 16px 0 16px;
`;

const CustomListItemButtonContainer = styled.div`
    display: flex;
`;

const ListContainer = styled.div`
    overflow-y: auto;
    margin-bottom: 0.5rem;
`;

const GroupComponentContainer = styled.div`
    margin-bottom: 8px;
`;

const FooterButton = styled(ListItemButton)`
    width: 50%;
`;

const NameContainer = styled.div`
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
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

type EditGroupProps = {
    id: string;
    group: GroupType;
    groups: GroupContainer;
    setEditID: Dispatch<SetStateAction<string | undefined>>;
    onUpdateGroup: (newGroups: GroupContainer) => void;
};

const EditGroup = ({ id, group, groups, onUpdateGroup, setEditID }: EditGroupProps) => {
    const userFollows: any[] = useUserStore((state) => state.userFollows);

    const [isAddingUser, setIsAddingUser] = useState(false);
    const [groupName, setGroupName] = useState(group.name);
    const [hasUserError, setHasUserError] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [expanded, setExpanded] = useState(group.expanded);
    const filter = createFilterOptions<any>();
    const navigate = useNavigate();

    const resetEditing = () => {
        setEditID(undefined);
        setIsAddingUser(false);
    };

    useEffect(() => {
        onUpdateGroup({
            ...groups,
            [id]: {
                ...groups[id],
                expanded: expanded,
            },
        });
    }, [expanded]);

    const addUser = (newUser: any) => {
        if (
            newUser &&
            !group.users.some((user) => {
                return user.id === newUser.to_id;
            })
        ) {
            onUpdateGroup({
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
        onUpdateGroup({ ...groups, [id]: { ...group, name: name } });
    };

    const confirmDeleteGroup = () => {
        setConfirmDelete(true);
    };
    const cancelDeleteGroup = () => {
        setConfirmDelete(false);
    };

    const deleteGroup = () => {
        const { [id]: removedGroup, ...restOfTheGroups } = groups;

        onUpdateGroup(restOfTheGroups);
        setEditID(undefined);
    };

    const removeUser = (userId: string) => {
        const users = group.users.filter((user) => user.id !== userId);
        onUpdateGroup({
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
            <ListContainer>
                <List
                    component="nav"
                    dense
                    aria-labelledby="groups-subheader"
                    subheader={
                        <ListSubheader component="div" id="groups-subheader">
                            Editing group
                        </ListSubheader>
                    }
                ></List>
                <GroupComponentContainer>
                    <ListItem>
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
                    </ListItem>

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

                                    <IconButton
                                        size="small"
                                        aria-label="Remove user"
                                        title="Remove user"
                                        onClick={() => removeUser(user.id)}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </ListItem>
                            );
                        })}
                    </List>

                    {!isAddingUser && (
                        <IndentedListItemButton
                            aria-label="Add user"
                            title="Add user"
                            onClick={() => setIsAddingUser(true)}
                        >
                            <AddIcon />
                        </IndentedListItemButton>
                    )}
                    {isAddingUser && (
                        <IndentedListItem>
                            <Autocomplete
                                freeSolo
                                id="add-group-user"
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
                                renderInput={(params: AutocompleteRenderInputParams) => (
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
            </ListContainer>
            <ListFooter>
                <Divider />

                {confirmDelete && (
                    <>
                        <ConfirmDeleteLabel>Delete this group?</ConfirmDeleteLabel>
                        <CustomListItemButtonContainer>
                            <FooterButton aria-label="Delete group" title="Delete group" onClick={deleteGroup}>
                                <ListItemText>Delete</ListItemText>
                                <DeleteIcon fontSize="small" />
                            </FooterButton>
                            <FooterButton aria-label="Cancel delete" title="Cancel delete" onClick={cancelDeleteGroup}>
                                <ListItemText>Cancel</ListItemText>
                                <ClearIcon fontSize="small" />
                            </FooterButton>
                        </CustomListItemButtonContainer>
                    </>
                )}

                {!confirmDelete && (
                    <CustomListItemButtonContainer>
                        <FooterButton aria-label="Delete group" title="Delete group" onClick={confirmDeleteGroup}>
                            <ListItemText>Delete</ListItemText>
                            <DeleteIcon fontSize="small" />
                        </FooterButton>
                        <FooterButton aria-label="Finish editing" title="Finish editing" onClick={resetEditing}>
                            <ListItemText>Finish</ListItemText>
                            <CheckIcon fontSize="small" />
                        </FooterButton>
                    </CustomListItemButtonContainer>
                )}
            </ListFooter>
        </>
    );
};

export default EditGroup;
