import React from "react";
import UpdateForm from "../../shared/components/Forms/UpdateForm";
import { useParams } from "react-router-dom";

const UpdateCharacter=()=>{
    return <UpdateForm type="place" id={useParams().placeId}/>
}
export default UpdateCharacter;