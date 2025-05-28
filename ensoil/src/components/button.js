import Link from 'next/link';
import PropTypes from 'prop-types';

Button.propTypes = {
  label: PropTypes.string.isRequired,
  route: PropTypes.string,
  type: PropTypes.oneOf(['link', 'submit']),
  size: PropTypes.string,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
};

export default function Button ({label, route, type = "link", size, fullWidth = false, onClick}) {
  const fullWidthClass = fullWidth ? 'w-full' : '';
  const textSize = size ? size : 'text-h5';
  const style = `bg-primary text-white py-2 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-green-800 hover:shadow-lg hover:-translate-y-0.5`

  if (route) {
    return (
      <Link href={route}>
        <button className={`${fullWidthClass} ${textSize} ${style}`}>
          {label}
        </button>
      </Link>
    );
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