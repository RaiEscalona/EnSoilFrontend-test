'use client';

import Link from 'next/link';
import PropTypes from 'prop-types';

ButtonComponent.propTypes = {
  label: PropTypes.string.isRequired,
  route: PropTypes.string,
  type: PropTypes.oneOf(['link', 'submit']),
  size: PropTypes.string,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  disable: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
  isDelete: PropTypes.bool,
};

export default function ButtonComponent ({label, route, type = "link", size, fullWidth = false, onClick, disable=false, icon, className, isDelete=false}) {  
  const fullWidthClass = fullWidth ? 'w-full' : '';
  const textSize = size ? size : 'text-h5';
  const defaultStyle = `bg-primary text-white py-2 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-green-800 hover:shadow-lg hover:-translate-y-0.5`;
  const disableStyle = `bg-primary text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`;
  const deleteStyle = `bg-red-500 text-white py-2 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5`;
  const deleteDisableStyle = `bg-red-500 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`;
  const finalStyle = className || defaultStyle;

  const buttonContent = (
    <>
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </>
  );

  if (route) {
    return (
      <Link href={route}>
        <button className={`${fullWidthClass} ${textSize} ${finalStyle} flex items-center justify-center hover:cursor-pointer`}>
          {buttonContent}
        </button>
      </Link>
    );
  }

  if (disable && isDelete) {
    return (
    <button 
      type={type} 
      className={`${fullWidthClass} ${textSize} ${deleteDisableStyle}`}
      onClick={onClick}
      disabled
    >
      {label}
    </button>
    )
  }

  if (disable) {
    return (
    <button 
      type={type} 
      className={`${fullWidthClass} ${textSize} ${disableStyle} flex items-center justify-center`}
      onClick={onClick}
      disabled
    >
      {buttonContent}
    </button>
    )
  }

  if (isDelete) {
    return (
    <button 
      type={type} 
      className={`${fullWidthClass} ${textSize} ${deleteStyle}`}
      onClick={onClick}
    >
      {label}
    </button>
    )
  }

  return (
    <button 
      type={type} 
      className={`${fullWidthClass} ${textSize} ${finalStyle} flex items-center justify-center hover:cursor-pointer`}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
}