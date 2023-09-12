import React, { useContext } from 'react';

import Input from '../FormElements/Input';
import Button from '../FormElements/Button';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../util/validators';
import ErrorModal from '../UIElements/ErrorModal';
import LoadingSpinner from '../UIElements/LoadingSpinner';
import { useForm } from '../../hooks/form-hook';
import { useHttpClient } from '../../hooks/http-hook';
import './EntityForm.css';
import { AuthContext } from '../../context/auth-context';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../FormElements/ImageUpload';

const NewEntity = props => {
  const auth =useContext(AuthContext);
  const {isLoading,error,sendRequest,clearError }=useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );
  let errTxt,nameOrTitle;
  switch(props.type){
    case 'character':
        errTxt="Please provide an image of the character (face claim/art)";
        break;
    case 'place':
        errTxt="Please provide an image for this place (place that looks similar/art)";
        break;
    case 'object':
        errTxt="Please provide an image of this object (similar object/prop/art)";
        break;
    case 'organization':
        errTxt="Please provide an image representing this organization (i.e. symbol/flag)";
        break;
    default: errTxt="Unexpected Entity type!";
        break;
  }
  if(props.type==="character" || props.type==="organization"){
    nameOrTitle="Name";
  }else{
    nameOrTitle="Title";
  }
  const history=useNavigate();
  const entitySubmitHandler = async event => {
    event.preventDefault();
    try{
      const formData= new FormData();
      formData.append('title', formState.inputs.title.value);
      formData.append('description', formState.inputs.description.value);
      formData.append('creator', auth.userID);
      formData.append('image', formState.inputs.image.value);
    await sendRequest(`http://localhost:5000/api/${props.type}s`, "POST", formData, {Authorization: 'Bearer ' + auth.token});
    history(`/${auth.userID}/${props.type}s`);
    } catch(err){

    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}/>
      <form className="entity-form" onSubmit={entitySubmitHandler}>
        {isLoading &&<LoadingSpinner asOverlay/>}
        <Input
          id="title"
          element="input"
          type="text"
          label={nameOrTitle}
          validators={[VALIDATOR_REQUIRE()]}
          errorText="This field cannot be empty."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Basic Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least 5 characters)."
          onInput={inputHandler}
        />
        <ImageUpload id = "image" onInput ={inputHandler} errorText= {errTxt}/>
        <Button type="submit" disabled={!formState.isValid}>
          ADD {props.type.toUpperCase()}
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewEntity;