import { IconButton} from "@mui/material";
import React, { useContext } from "react";
import AddIcon from '@mui/icons-material/Add';
import StoreApi from "../../util/storeApi";


const ElementInput=({listID,type})=>{
    const {addMoreCard, addMoreList}=useContext(StoreApi);
    const handleBtnConfirm= ()=>{
        if(type==='card'){ 
            addMoreCard(listID) ;
        }
           else if(type==='list'){ 
            addMoreList();
           }
    }

    return (
            <div style={{display: 'flex'}}>
                <IconButton style={{position: 'sticky'}} onClick={handleBtnConfirm}>
                    <AddIcon/>
                </IconButton>
            </div>

    )
}
export default ElementInput;