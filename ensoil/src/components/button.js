import Link from 'next/link';
import PropTypes from 'prop-types';

Button.propTypes = {
  title: PropTypes.string.isRequired,
  route: PropTypes.string,
  type: PropTypes.oneOf(['link', 'submit']),
  size: PropTypes.string,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
};

export default function Button ({label, route, type = "link", size, fullWidth = false, onClick}) {
  const fullWidthClass = fullWidth ? 'w-full' : '';
  const textSize = size ? size : 'text-h5';
  const style = `bg-primary text-white py-2 px-4 rounded border-1 border-current hover:bg-white hover:text-black hover:border-primary transition dark:border-primary`


  if (route) {
    return (
      <Link href={route}>
        <span className={`w-full ${textSize} ${style}`}>
          {label}
        </span>
      </Link>
    );
  }

  return (
    <button type={type} className={`${fullWidthClass} ${textSize} ${style}`}>
      {label}
    </button>
  );
}