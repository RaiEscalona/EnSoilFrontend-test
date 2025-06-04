'use client';

import { LoaderCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

Button.propTypes = {
  label: PropTypes.string.isRequired,
  route: PropTypes.string,
  type: PropTypes.oneOf(['link', 'submit']),
  size: PropTypes.string,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  disable: PropTypes.bool,
};

export default function Button ({label, route, type = "link", size, fullWidth = false, onClick, disable=false}) {  
  const fullWidthClass = fullWidth ? 'w-full' : '';
  const textSize = size ? size : 'text-h5';
  const style = `bg-primary text-white py-2 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-green-800 hover:shadow-lg hover:-translate-y-0.5`;
  const disableStyle = `bg-primary text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`;

  if (route) {
    return (
      <Link href={route}>
        <button className={`${fullWidthClass} ${textSize} ${style}`}>
          {label}
        </button>
      </Link>
    );
  }

  if (disable) {
    return (
    <button 
      type={type} 
      className={`${fullWidthClass} ${textSize} ${disableStyle}`}
      onClick={onClick}
      disabled
    >
      {label}
    </button>
    )
  }

  return (
    <button 
      type={type} 
      className={`${fullWidthClass} ${textSize} ${style}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}