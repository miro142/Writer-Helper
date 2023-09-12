import React from "react";
import UpdateForm from "../../shared/components/Forms/UpdateForm";
import { useParams } from "react-router-dom";

const UpdateObject=()=>{
    const {objectId}= useParams();
    console.log(objectId)
    return <UpdateForm type="object" id={objectId}/>
}
export default UpdateObject;