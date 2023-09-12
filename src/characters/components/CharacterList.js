import React from "react";
import "../../shared/components/UIElements/EntityList.css"
import CharacterItem from "../../shared/components/UIElements/EntityItem";

const CharacterList =props=>{

    return <ul className="entity-list">
        {props.items.map(character =><CharacterItem key={character.id} id={character.id} image={character.image} title={character.title} description={character.description} creatorID={character.creator} onDelete={props.onDeleteCharacter} type="character"/>)}
    </ul>
};

export default CharacterList;