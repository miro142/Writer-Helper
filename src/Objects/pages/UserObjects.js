import React, { useEffect, useState, useContext } from 'react';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ObjectList from '../components/ObjectList';
import { AuthContext } from '../../shared/context/auth-context';
import { useParams } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Button from '../../shared/components/FormElements/Button';
import SearchBox from '../../shared/components/UIElements/SearchBox';


const UserObjects = () => {
  const auth = useContext(AuthContext);
  const [loadedObjects, setLoadedObjects]= useState();
  const [filtereObjects, setFilteredObjects] = useState();
  const {isLoading, error,sendRequest, clearError}= useHttpClient();
  const userId=useParams().userId;

  useEffect(()=>{
    const fetchObjects = async ()=>{
      try{
        const resData = await sendRequest(`http://localhost:5000/api/objects/user/${userId}`);
        setLoadedObjects(resData.objects);
        setFilteredObjects(resData.objects)
      }catch(err){
    
      }
    }
    fetchObjects();
  }, [sendRequest, userId]);
  const objectDeleteHandler=deletedObjectId=>{
    setLoadedObjects(prevObjects=>prevObjects.filter(object=>object.id!==deletedObjectId))
    setFilteredObjects(prevObjects=>prevObjects.filter(object=>object.id!==deletedObjectId))
  };
  const searchHandler =(event)=>{
    setFilteredObjects(loadedObjects.filter(object=> object.title.toLowerCase().includes(event.target.value.toLowerCase())));
  };

  return <React.Fragment>
    <ErrorModal error={error} onClear={clearError}/>
    {isLoading &&(<div className='center' ><LoadingSpinner /></div>)}
    {!isLoading && auth.userID ===userId && <div className='center'> <Button to={"/objects/new"}>NEW OBJECT</Button> </div>}
    {!isLoading && loadedObjects&&<React.Fragment>
    <SearchBox type = "objects" onChange = {searchHandler}/>
    <ObjectList items={filtereObjects} onDeleteObject= {objectDeleteHandler} />
    </React.Fragment>
    }
  </React.Fragment>
  
};

export default UserObjects;