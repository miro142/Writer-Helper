import React, { useEffect, useState, useContext } from 'react';
import { useHttpClient } from '../../hooks/http-hook';
import Input from '../FormElements/Input';
import Button from '../FormElements/Button';
import Card from "../UIElements/Card";
import { useNavigate } from 'react-router-dom';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../util/validators';
import { useForm } from '../../hooks/form-hook';
import './EntityForm.css';
import { AuthContext } from '../../context/auth-context';
import LoadingSpinner from '../UIElements/LoadingSpinner';
import ErrorModal from '../UIElements/ErrorModal';

const UpdateEntity = props => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const {isLoading, error, sendRequest, clearError}= useHttpClient();
  const [loadedEntity,setLoadedEntity]=useState();
  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      }
    },
    false
  );
  let nameOrTitle;
  useEffect(()=>{
    const fetchEntity = async () =>{
      try{
      const resData = await sendRequest(`http://localhost:5000/api/${props.type}s/${props.id}`);
      setLoadedEntity(resData.entity)
      setFormData(
        {
          title: {
            value: resData.entity.title,
            isValid: true
          },
          description: {
            value: resData.entity.description,
            isValid: true
          }
        },
        true
      );
    } catch(err){}
    }
    
    fetchEntity();
  },[sendRequest,props, setFormData])


  const entityUpdateSubmitHandler = async event => {
    event.preventDefault();
    try{
      await sendRequest(`http://localhost:5000/api/${props.type}s/${props.id}`, "PATCH", JSON.stringify({
        title: formState.inputs.title.value,
        description: formState.inputs.description.value
      }),{'Content-Type':'application/json',
         Authorization: 'Bearer ' + auth.token
      });
      navigate('/'+ auth.userID+ `/${props.type}s`);
    }catch(err){}
  };
  if(props.type==="character" || props.type==="organization"){
    nameOrTitle="Name";
  }else{
    nameOrTitle="Title";
  }

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner/>
      </div>
    );
  } else if (!loadedEntity && !error ) {
    return (
      <div className="center">
        <Card style={{padding:"2rem"}}>
          <h2>Could not find {props.type}!</h2>
        </Card>
      </div>
    );
  } 
  

  return (
    <React.Fragment>
       <ErrorModal error={error} onClear = {clearError}/> 
      {!isLoading && loadedEntity && <form className="entity-form" onSubmit={entityUpdateSubmitHandler}>
        <Input
          id="title"
          element="input"
          type="text"
          label={nameOrTitle}
          validators={[VALIDATOR_REQUIRE()]}
          errorText="This field cannot be empty."
          onInput={inputHandler}
          initialValue={loadedEntity.title}
          initialValid={true}
        />
        <Input
          id="description"
          element="textarea"
          label="Basic Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (min. 5 characters)."
          onInput={inputHandler}
          initialValue={loadedEntity.description}
          initialValid={true}
        />
        <Button type="submit" disabled={!formState.isValid}>
          UPDATE {props.type.toUpperCase()}
        </Button>
      </form>}
  </React.Fragment>
  );
};

export default UpdateEntity;
