import api from "@/utils/axios";
import { useEffect, useState, useCallback } from "react";
import UserInfoRow from "../UserInfoRow/userInfoRow";
import TabsButton from "../utils/tabsButton";
import { useRouter } from 'next/navigation';

export default function AceptUser({user}) {
    const router = useRouter();
    const [usersList, setUsers] = useState([]);
    const [filterList, setFilter] = useState([]);
    const [tabOption, setTabOption] = useState(1);
    const [option, setOption] = useState('');
    const [update, setUpdate] = useState(false);

    const handleOption1 = useCallback(() => {
        setTabOption(1);
        setOption('role');
        setFilter(usersList.filter((user) => user.permission == true));
    }, [usersList]);

    const handleOption2 = () => {
        setTabOption(2);
        setOption('admin');
        setFilter(usersList.filter((user) => user.permission == true));
    }

    const handleOption3 = () => {
        setTabOption(3);
        setOption('access');
        setFilter(usersList.filter((user) => user.permission == false));
    }

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                console.log('🔄 Cargando solicitudes de registro');
                const response = await api.get('/users');
                if (response.data.success) {
                    console.log('✅ Usuarios cargados:', response.data);
                    setUsers(response.data.users.filter((info) => info.email !== user.email));
                }
            } catch (error) {
                console.error('❌ Error cargando solicitudes:', error.response?.data || error.message);
            }
        };

        fetchUsers();
    }, [update, user.email])

    useEffect(() => {
        handleOption1();
    }, [handleOption1])

    return (
        <div className="m-15">
            <div className="text-h3 text-black dark:text-white pb-2">Administración de usuarios</div>
            <div className="flex gap-3 pb-1">
                <TabsButton label={'Administrar rol'} onUse={tabOption == 1} onClick={handleOption1} />
                <TabsButton label={'Administrar usuarios'} onUse={tabOption == 2} onClick={handleOption2} />
                <TabsButton label={'Solicitudes de acceso'} onUse={tabOption == 3} onClick={handleOption3} />
            </div>
            {filterList.map((requestedUser) => (
                <div key={requestedUser.id} className="py-1">
                    <UserInfoRow user={user} requestedUser={requestedUser} option={option} setUpdate={setUpdate} />
                </div>
            ))}
        </div>
    );
}