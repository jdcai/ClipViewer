import React, { Dispatch, ElementType, SetStateAction, useEffect, useState } from 'react';
import { IconButton, Collapse, List, ListItemButton, ListItemText, ListItem, ListItemBaseProps } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { GroupType, GroupContainer } from '../../types/GroupTypes';

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

// component prop on ListItem doesn't show up so need to readd it
const ModifiedListItem = styled(ListItem)<ListItemBaseProps & { component: ElementType }>(() => ({
    paddingRight: '76px',
}));

const IndentedListItemButton = styled(ListItemButton)`
    padding: 0 2rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;

const Group = (props: {
    id: string;
    group: GroupType;
    groups: GroupContainer;
    setEditID: Dispatch<SetStateAction<string | undefined>>;
    onUpdateGroup: (newGroups: GroupContainer) => void;
}) => {
    const { id, group, groups, onUpdateGroup, setEditID } = props;
    const [expanded, setExpanded] = useState(group.expanded);
    const navigate = useNavigate();

    // useEffect(() => {
    //     onUpdateGroup({
    //         ...groups,
    //         [id]: {
    //             ...groups[id],
    //             expanded: expanded,
    //         },
    //     });
    // }, [groups, id, expanded]);

    return (
        <>
            <ModifiedListItem
                component="div"
                disableGutters
                secondaryAction={
                    <Container>
                        <IconButton
                            aria-label="Edit group"
                            title="Edit group"
                            onClick={(event: any) => {
                                event.stopPropagation();
                                setEditID(id);
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
                }
            >
                <ListItemButton
                    onClick={(event: any) => {
                        event.stopPropagation();

                        navigate('/', {
                            replace: true,
                            state: {
                                title: group.name,
                                broadcasters: group.users.map((user) => {
                                    return user.id;
                                }),
                            },
                        });
                    }}
                >
                    <ListItemText primary={<GroupName title={group.name}>{group.name}</GroupName>} />
                </ListItemButton>
            </ModifiedListItem>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <List dense disablePadding>
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
                            </ListItem>
                        );
                    })}
                </List>
            </Collapse>
        </>
    );
};

export default Group;
