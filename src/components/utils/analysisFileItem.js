
import { File } from 'lucide-react';
import PropTypes from 'prop-types';

AnalysisFileItem.propTypes = {
  name: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};

export default function AnalysisFileItem({name, date}) {
    return (
        <div className='h-[95%] grid grid-cols-15 justify-items items-center bg-quaternary hover:bg-[#bababa] dark:bg-base dark:hover:bg-[#252424] text-h5 text-black dark:text-white transition-all duration-300 ease-in-out hover:shadow-lg rounded-xl p-3'>
            <div className='col-start-1'>
                <File size={35} />
            </div>
            <div className='col-start-2 col-span-10'>
                {name}
            </div>
            <div className='col-start-14 col-span-2 text-center'>
                {date}
            </div>
        </div>
    );
}