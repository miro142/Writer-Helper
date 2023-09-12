import React, { useContext, useState} from 'react';
import { TextareaAutosize, Typography } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import storeApi from '../../util/storeApi';
import './Editable.css';


const Editable = ({ title, ListID, type, ID }) => {
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const { updateTitle } = useContext(storeApi);

  let componentClassName = 'editable-title_';

  if (type === 'list' || type === 'cardT') {
    componentClassName += 'title';
  } else if (type === 'cardD') {
    componentClassName += 'description';
  }

  const handleOnChange = (edit) => {
    setNewTitle(edit.target.value);
  };

  const handleOnBlur = () => {
    setOpen(false);
    updateTitle(newTitle, ListID, type, ID);
  };
    
  return (
      <div className='editable-title_container'>
      {open ? (
        <div>
          <TextareaAutosize
            className='editable-title_input'
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            autoFocus
            value={newTitle}
            fullWidth
          />
        </div>
      ) : (
        
          <Typography
            onClick={() => setOpen(!open)}
            className={componentClassName}
          >
            {title || '\u00A0'} {/* This is to ensure the Editable doesn't collapse and become unclickable in the case of an empty input*/}
          </Typography>
          
       
      )}
      {(type === 'cardT' || type === 'list') && <MoreHorizIcon className='editable-title_icon'/>}
      </div>
  );
};

export default Editable;