import React from "react";
import './UserItem.css';
import Avatar from '../../shared/components/UIElements/Avatar'
import Card from "../../shared/components/UIElements/Card";

const UserItem = props=>{
    return (
        <li className="user-item">
                <Card className="user-item__content">
                <div className="user-item__wrapper">
                <div className="user-item__image">
                    <Avatar image={`http://localhost:5000/${props.image}`} alt={props.name} />
                </div>
                <div className="user-item__info">
                    <h2>{props.name}</h2>
                    <h3>{props.characterCount} {props.characterCount===1? 'Character':'Characters'}</h3>
                    <h3>{props.placeCount} {props.placeCount===1? 'Place':'Places'}</h3>
                    <h3>{props.objectCount} {props.objectCount===1? 'Object':'Objects'}</h3>
                    <h3>{props.organizationCount} {props.organizationCount===1? 'Organization':'Organizations'}</h3>
                    
                </div>
                </div>
                </Card>
        </li>
    );

};
export default UserItem;