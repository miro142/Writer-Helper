import React from "react";
import "../../shared/components/UIElements/EntityList.css";
import OrganizationItem from "../../shared/components/UIElements/EntityItem";

const OrganizationList =props=>{

    return <ul className="entity-list">
        {props.items.map(organization =><OrganizationItem key={organization.id} id={organization.id} image={organization.image} title={organization.title} description={organization.description} creatorID={organization.creator} onDelete={props.onDeleteOrganization} type='organization'/>)}
    </ul>
};

export default OrganizationList;