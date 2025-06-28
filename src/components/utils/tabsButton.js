export default function TabsButton({ label, onUse, onClick }) {
    const styleOnUse = 'rounded-full border-2 border-primary dark:border-[#2a6048] bg-primary dark:bg-[#2a6048] hover:cursor-pointer text-p-medium text-white py-1 px-3';
    const styleDisable = 'rounded-full border-2 border-primary dark:border-white hover:cursor-pointer text-p-medium text-primary dark:text-white py-1 px-3';

    if (onUse) {
        return (
            <button className={styleOnUse} onClick={onClick}>
                {label}
            </button>
        );
    } else {
        return (
            <button className={styleDisable} onClick={onClick}>
                {label}
            </button>
        );
    }
}