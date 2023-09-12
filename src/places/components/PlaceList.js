import React from "react";
import "../../shared/components/UIElements/EntityList.css";
import PlaceItem from "../../shared/components/UIElements/EntityItem";

const PlaceList =props=>{

    return <ul className="entity-list">
        {props.items.map(place =><PlaceItem key={place.id} id={place.id} image={place.image} title={place.title} description={place.description} creatorID={place.creator} onDelete={props.onDeletePlace} type='place'/>)}
    </ul>
};

export default PlaceList;