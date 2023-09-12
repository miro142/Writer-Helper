import { Paper , IconButton} from "@mui/material";
import React, {useContext} from "react";
import { Draggable } from "@hello-pangea/dnd";
import Editable from "./Editable";
import './EditableCard.css';
import DeleteIcon from '@mui/icons-material/Delete';
import storeApi from "../../util/storeApi";
const EditableCard = ({ card, index, listID }) => {
  const {removeCard}= useContext(storeApi);
  const handleBtnConfirm = ()=>{
    removeCard( listID, card.id);
}
  return (
    <Draggable draggableId={card.id} index={index} key={card.id}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
          <Paper className="ecard">
            <Editable  title={card.title} ListID={listID} type='cardT' ID={card.id} />
            <Editable title={card.description} ListID={listID} type='cardD' ID={card.id} />
            <IconButton style={{position:'absolute',right:'3px', bottom:'0',maxWidth:'10%'}} onClick={handleBtnConfirm} >
              <DeleteIcon/>
            </IconButton>
          </Paper>
        </div>
      )}
    </Draggable>
  );
};

export default EditableCard;