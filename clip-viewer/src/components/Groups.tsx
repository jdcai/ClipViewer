import React, { useEffect, useState } from 'react';
import 'fontsource-roboto';
// Do https://material-ui.com/guides/minimizing-bundle-size/
import { Button, TextField, Autocomplete } from '@mui/material';
import styled from 'styled-components';
import { useHistory, useLocation } from 'react-router-dom';
import useUserStore from '../stores/UserStore';
import axios from 'axios';

interface FollowingUser {
    name: string;
    id: string;
}

interface GroupContainer {
    [key: string]: FollowingUser[];
}

const Groups = () => {
    const location = useLocation<any>();
    const currentUser: any = useUserStore((state) => state.currentUser);
    const [selectedUser, setSelectedUser] = useState<any>();
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [follows, setFollows] = useState([]);
    const [addedUsers, setAddedUsers] = useState<FollowingUser[]>([]);
    const [groups, setGroups] = useState<GroupContainer>({});
    const [groupName, setGroupName] = useState('');
    const history = useHistory();

    // localStorage.setItem("state", JSON.stringify(this.state))
    // const Groups = (props: any) => {
    // const location = useLocation<any>();
    // const clips = location.state.clips;
    // const [test, setTest] = useState(0);
    // console.log(location);
    useEffect(() => {
        const tempGroups = localStorage.getItem('groups');
        if (tempGroups) {
            setGroups(JSON.parse(tempGroups));
            console.log(groups);
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

    const addToGroup = () => {
        console.log(selectedUser);
        if (
            selectedUser &&
            !addedUsers.some((user) => {
                return user.id === selectedUser.to_id;
            })
        ) {
            setAddedUsers([...addedUsers, { name: selectedUser?.to_name, id: selectedUser?.to_id }]);
        }
    };
    const createGroup = () => {
        setIsEditingGroup(true);
        console.log(selectedUser);
    };
    const saveGroup = () => {
        setIsEditingGroup(false);
        groups[groupName] = addedUsers;
        localStorage.setItem('groups', JSON.stringify(groups));

        console.log(localStorage.getItem(groupName));
        console.log(selectedUser);
    };
    return (
        <div>
            {groups &&
                Object.keys(groups).map((groupName) => {
                    console.log(groups[groupName]);
                    return (
                        <div key={groupName}>
                            <div
                                onClick={() =>
                                    history.push('clips', {
                                        broadcasters: groups[groupName].map((user) => {
                                            return user.id;
                                        }),
                                    })
                                }
                            >
                                {groupName}
                            </div>
                            {groups[groupName].map((user) => {
                                return <div key={user.id}>-{user.name}</div>;
                            })}
                        </div>
                    );
                })}
            {!isEditingGroup && (
                <Button variant="contained" color="primary" onClick={() => createGroup()}>
                    Create Group
                </Button>
            )}
            {isEditingGroup && (
                <>
                    <Autocomplete
                        freeSolo={true}
                        id="combo-box-demo"
                        options={follows}
                        getOptionLabel={(option: any) => option.to_name}
                        style={{ width: 300 }}
                        onChange={(_0, value: any) => setSelectedUser(value)}
                        renderInput={(params: unknown) => (
                            <TextField {...params} label="Following" variant="outlined" />
                        )}
                    />
                    {addedUsers &&
                        addedUsers.map((user) => {
                            return <div key="user">{user.name}</div>;
                        })}
                    <TextField
                        label="Group Name"
                        value={groupName}
                        autoFocus={true}
                        required={true}
                        type="text"
                        onChange={(result) => setGroupName(result.currentTarget.value)}
                    ></TextField>
                    <Button variant="contained" color="primary" onClick={() => addToGroup()}>
                        Add To Group
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => saveGroup()}>
                        Save
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => setIsEditingGroup(false)}>
                        Cancel
                    </Button>
                </>
            )}
        </div>
    );
};

export default Groups;
