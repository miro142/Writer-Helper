import React from 'react';
import './SideElement.css';
import Card from './Card';

const SideElement = props=>{
   return  <div className="sticky-component">
   <Card className="entity-item-dt__content">
<div className="entity-item-dt__image">
   <img src={`http://localhost:5000/${props.image}`} alt={props.title}/>
</div>
<div className="entity-item-dt__info">
   <h2>{props.title}</h2>
   <p>{props.description}</p>
</div>
</Card>
   </div>
}
export default SideElement;