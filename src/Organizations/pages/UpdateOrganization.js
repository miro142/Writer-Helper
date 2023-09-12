import React from "react";
import UpdateForm from "../../shared/components/Forms/UpdateForm";
import { useParams } from "react-router-dom";

const UpdateOrganization=()=>{
    const {orgId} = useParams();
    console.log(orgId)
    return <UpdateForm type="organization" id={useParams().organizationId}/>
}
export default UpdateOrganization;