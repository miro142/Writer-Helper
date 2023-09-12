import React from "react";
import UpdateForm from "../../shared/components/Forms/UpdateForm";
import { useParams } from "react-router-dom";

const UpdateCharacter=()=>{
    return <UpdateForm type="character" id={useParams().characterId}/>
}
export default UpdateCharacter;