'use client'

import { UserAuth } from "@/components/Authentication/AuthContext";
import WithSidebarLayout from "@/components/layouts/layoutWithSidebar";
import UserInfo from "@/components/UserInfoComponent/UserInfo";

export default function ProfilePage() {
    return (
        <WithSidebarLayout>
            <Profile/>
        </WithSidebarLayout>
    );
}

function Profile() {
    const { user } = UserAuth();

    return (
        <UserInfo user={user}/>
    );
};