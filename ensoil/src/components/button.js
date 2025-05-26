'use client';

import { LoaderCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';

Button.propTypes = {
  title: PropTypes.string.isRequired,
  route: PropTypes.string,
  type: PropTypes.oneOf(['link', 'submit']),
  size: PropTypes.string,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  loading: PropTypes.bool,
};

export default function Button ({label, route, type = "link", size, fullWidth = false, onClick, loading=false}) {  
  const router = useRouter();

  const fullWidthClass = fullWidth ? 'w-full' : '';
  const textSize = size ? size : 'text-h5';
  const style = `bg-primary text-white py-2 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-green-800 hover:shadow-lg hover:-translate-y-0.5`;
  const loadingStyle = `bg-primary text-white py-2 px-4 rounded-lg`;

  const handleClick = () => {
    router.push(route);
  };

  if (route) {
    return (
      <button onClick={handleClick} className={`${fullWidthClass} ${textSize} ${style}`}>
        {label}
      </button>
    );
  }

  if (loading) {
    return (
      <button className={`${fullWidthClass} ${textSize} ${loadingStyle}`} disabled>
        <div className='flex-1 flex justify-center items-center gap-2'>
          <LoaderCircle className='animate-spin'/>{label}
        </div>
      </button>
    );
  }

  return (
    <button type={type} className={`${fullWidthClass} ${textSize} ${style}`}>
      {label}
    </button>
  );
}