import React from "react";
import './SearchBox.css';

const SearchBox = props =>{
 return(
    <div className="search_box-wrapper">
        <input className="search_box-content" type="search" placeholder={`search ${props.type}`} onChange={props.onChange}/>
    </div>
 )
}

export default SearchBox;