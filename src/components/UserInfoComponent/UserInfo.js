import { CircleUserRound } from "lucide-react";
import './userInfo.css';
import { auth } from "@/firebase";
import { 
    EmailAuthProvider, 
    getIdToken, 
    onAuthStateChanged, 
    reauthenticateWithCredential, 
    updateEmail, 
    updatePassword, 
    updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import AceptUser from "../AceptUserComponent/aceptUser";
import UpdateProfile from "../UpdateProfileComponents/updateProfile";
import Alert from "../Alert/Alert";
import UpdatePassword from "../UpdateProfileComponents/updatePassword";

export default function UserInfo({ user }) {
    const [isAdmin, setAdmin] = useState(false);
    const [userInfo, setUserInfo] = useState('');
    const [hierarchy, setHierarchy] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [profileForm, setProfileForm] = useState({ name: '', lastName: '' });
    const [passwordForm, setPasswordForm] = useState({ password: '', newPassword: '' });
    const [change, setChange] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const handleUpdateProfile = async () => {
        try {
            await updateProfile(user, {
                displayName: `${profileForm.name} ${profileForm.lastName}`,
            });

            const token = await getIdToken(user);
            const auth = {
                Authorization: `Bearer ${token}`
            }
            const response = await api.patch('/users/me', {
                name: profileForm.name,
                lastName: profileForm.lastName
            }, {
                headers: auth
            })
            
            if (response.data.success) {
                setAlertMessage('Datos actualizados correctamente');
                setShowAlert(true);
            }
        } catch (error) {
            setAlertMessage('El correo ingresado ya está siendo utilizado');
            setShowAlert(true);
        }
        setChange(prev => !prev);
    }

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>_-]/.test(password);
        
        if (password.length < minLength) {
        return 'La contraseña debe tener al menos 8 caracteres';
        } if (!hasUpper) {
        return 'Debe contener al menos una letra mayúscula';
        } if (!hasNumber) {
        return 'Debe contener al menos un número';
        } if (!hasSpecial) {
        return 'Debe contener al menos un carácter especial';
        }

        return null;
    };

    const handleChangePassword = async () => {
        try {
            const error = validatePassword(passwordForm.newPassword);
            if (error) {
                setShowAlert(true);
                setAlertMessage(error);
                return;
            } else {
                const credential = EmailAuthProvider.credential(user.email, passwordForm.password);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, passwordForm.newPassword);
            }
        } catch (error) {
            setShowAlert(true);
            setAlertMessage('Contraseña incorrecta');
        }
    };

    const handleHierarchyInfo = (data) => {
        if (data.hierarchy === 1) {
            setHierarchy('Baja');
        } else if (data.hierarchy === 2) {
            setHierarchy('Media Baja');
        } else if (data.hierarchy === 3) {
            setHierarchy('Media Baja');
        } else if (data.hierarchy === 4) {
            setHierarchy('Media Alta');
        } else if (data.hierarchy === 5) {
            setHierarchy('Admin');
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                const token = await getIdToken(user);
                const headers = {
                    Authorization: `Bearer ${token}`,
                };
                const response = await api.get('/users/verify-admin', { headers });
                const userResponse = await api.get('/users/me', { headers });
                if (response.data.success) {
                    setAdmin(true);
                }
                if (userResponse.data.success) {
                    setUserInfo(userResponse.data.user);
                    handleHierarchyInfo(userResponse.data.user)
                }
            } catch (error) {
                setAdmin(false);
            } finally {
                setIsLoading(false)
            }
        });
        return () => unsubscribe();
    }, [user, change])

    if (user) {
        return (
            <>
                {showAlert && (
                    <Alert message={alertMessage} onClose={() => setShowAlert(false)} />
                )}
                <div className="info-container">
                    <div className="text-h2 pb-2">Perfil</div>
                    <div className="flex justify-center">
                        <div className="grid grid-flow-col grid-cols-4 grid-rows-3 justify-items-center items-center gap-2">
                            <div className="row-span-2 col-start-1">
                                <CircleUserRound 
                                    size={55}
                                    strokeWidth={1}/>
                            </div>
                            <div className="row-start-1 col-start-2 justify-self-start">{userInfo.name} {userInfo.lastName}</div>
                            <div className="row-start-2 col-start-2 justify-self-start">{userInfo.email}</div>
                            <div className="row-start-3 col-start-2 justify-self-start">{hierarchy}</div>
                            <div className="row-start-1 col-start-4 justify-self-stretch">
                                <UpdateProfile handleUpdateProfile={handleUpdateProfile} form={profileForm} setForm={setProfileForm} />
                            </div>
                            <div className="row-start-2 col-start-4 justify-self-stretch">
                                <UpdatePassword handleChangePassword={handleChangePassword} form={passwordForm} setForm={setPasswordForm} />
                            </div>
                        </div>
                    </div>
                    {isAdmin && (
                        <AceptUser user={user} />
                    )}
                </div>
            </>
        );
    }
}