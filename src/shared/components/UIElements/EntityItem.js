import React, {useContext, useState} from "react";
import "./EntityItem.css";
import Card from "./Card";
import Button from "../FormElements/Button";
import Modal from "./Modal";
import { AuthContext } from "../../context/auth-context";
import ErrorModal from "./ErrorModal";
import LoadingSpinner from "./LoadingSpinner";
import { useHttpClient } from "../../hooks/http-hook";


const EntityItem =props=>{
    const {isLoading, error,sendRequest, clearError}= useHttpClient();
    const auth=useContext(AuthContext);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const showDeleteWarningHandler=()=>{
        setShowConfirmModal(true);
    }
    const cancelDeleteHandler=()=>{
        setShowConfirmModal(false);
    }
    const confirmDeleteHandler= async()=>{
        setShowConfirmModal(false);
        try{
            await sendRequest(`http://localhost:5000/api/${props.type}s/${props.id}`, "DELETE", null, {Authorization: 'Bearer ' + auth.token});
            props.onDelete(props.id);
          }catch(err){}
    }
 return <React.Fragment>
    <ErrorModal error={error} onClear={clearError}/>
    <Modal show={showConfirmModal} onCancel={cancelDeleteHandler} header="Warning" footerClass="entity-item__modal-actions" footer={
        <div>
            <Button inverse onClick={cancelDeleteHandler}>CANCEL</Button>
            <Button danger onClick={confirmDeleteHandler}>DELETE</Button>
        </div>
    }>
        <p>Are you sure you want to delete this {props.type}? Deletion can not be undone.</p>

    </Modal>

  <li className="entity-item">
    <Card className="entity-item__content">
        {isLoading && <LoadingSpinner asOverlay/>}
    <div className="entity-item__image">
        <img src={`http://localhost:5000/${props.image}`} alt={props.title}/>
    </div>
    <div className="entity-item__info">
        <h2>{props.title}</h2>
        <p>{props.description}</p>
    </div>

    <div className="entity-item__actions">
        {auth.userID ===props.creatorID &&(<Button inverse to={`/${props.type}s/details/${props.id}`}>VIEW DETAILED INFO</Button>)} 
        {auth.userID ===props.creatorID &&(<Button to={`/${props.type}s/${props.id}`}>EDIT BASIC INFO</Button>)} 
        {auth.userID ===props.creatorID &&(<Button danger onClick={showDeleteWarningHandler}>DELETE</Button>)}  
         
    </div>
    </Card>
 </li>
 </React.Fragment>
};

export default EntityItem;