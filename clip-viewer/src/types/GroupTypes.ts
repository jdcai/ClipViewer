export interface FollowingUser {
    name: string;
    id: string;
}

export interface GroupType {
    name: string;
    users: FollowingUser[];
    expanded: boolean;
}

export interface GroupContainer {
    [key: string]: GroupType;
}
