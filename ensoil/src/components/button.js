export default function Button({label}) {
    return (
        <button
          type="submit"
          className="
          w-full 
          bg-primary 
          text-h4 
          text-white 
          py-2 
          px-4 
          rounded 
          border-1 
          border-current 
          hover:bg-white 
          hover:text-black 
          hover:border-primary 
          transition
          dark:border-primary"
        >
          {label}
        </button>
    );
}