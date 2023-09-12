import React from "react";
import "../../shared/components/UIElements/EntityList.css"
import ObjectItem from "../../shared/components/UIElements/EntityItem";

const ObjectList =props=>{
    
    return <ul className="entity-list">
        {props.items.map(object =><ObjectItem key={object.id} id={object.id} image={object.image} title={object.title} description={object.description} creatorID={object.creator} onDelete={props.onDeleteObject} type="object"/>)}
    </ul>
};

export default ObjectList;