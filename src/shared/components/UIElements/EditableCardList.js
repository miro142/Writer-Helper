import React,{useContext} from "react";
import { CssBaseline, Paper, IconButton} from '@mui/material'
import Editable from "./Editable";
import EditableCard from "./EditableCard";
import CardInput from "./ElementInput";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import './EditableCardList.css'
import DeleteIcon from '@mui/icons-material/Delete';
import storeApi from "../../util/storeApi";

const EditableCardList=({list, index})=>{
    const {removeList}= useContext(storeApi);
    const handleBtnConfirm = ()=>{
        removeList(list.id);
    }
    return (
        <Draggable draggableId={list.id} index={index}>
            {(provided)=>(  
                <div ref={provided.innerRef}  {...provided.draggableProps}>
                    <Paper   className="card-list_root" {... provided.dragHandleProps}>
                        <CssBaseline/>
                        <Editable title={list.title} ListID={list.id} type='list'/>
                            <Droppable   droppableId={list.id}>
                                {(provided)=>(<div ref={provided.innerRef} {...provided.droppableProps}>
                                    {list.items.map((card, index)=>(
                                    <EditableCard key={card.id} card={card} index={index} listID={list.id}/>
                                ))}
                                {provided.placeholder}
                                </div>)}
                            </Droppable>
                            <div className="card-list_buttons">
                            <CardInput listID={list.id} type="card"/>
                            <IconButton onClick={handleBtnConfirm}>
                                <DeleteIcon/>
                            </IconButton>
                            </div>
                    </Paper>
                </div>
            )}
        </Draggable>
    )
}
export default EditableCardList;