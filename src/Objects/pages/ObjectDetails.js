import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import "../../shared/components/UIElements/EntityDetails.css";
import Wrapper from '../../shared/components/UIElements/Wrapper';
import SideElement from '../../shared/components/UIElements/SideElement';

const ObjectDetails =()=>{
    const auth = useContext(AuthContext);
    const {isLoading, error, sendRequest, clearError}= useHttpClient();
    const objectId = useParams().objectId;
    const [loadedDetails, setLoadedDetails]=useState([]);
    const [loadedImage, setLoadedImage]=useState();
    const [loadedTitle, setLoadedTitle]=useState();
    const [loadedDescription, setLoadedDescription]=useState();
    useEffect(()=>{
        const fetchObject = async () =>{
            try{
                const resData = await sendRequest(`http://localhost:5000/api/objects/${objectId}`);
                const fetchedDetails =resData.entity.details
                setLoadedDetails(fetchedDetails);
                setLoadedImage(resData.entity.image);
                setLoadedTitle(resData.entity.title);
                setLoadedDescription(resData.entity.description);
            } catch(err){}
        }
        fetchObject();
        
    },[sendRequest,objectId])

    return  <React.Fragment>
        <ErrorModal error={error} onClear={clearError}/>
        {isLoading &&(<div className='center' ><LoadingSpinner /></div>)}
        {!isLoading && loadedDetails.length > 0 && <React.Fragment>
        <SideElement image={loadedImage} title={loadedTitle} description={loadedDescription}/>
        <div className="entity-item-dt_details"><Wrapper auth={auth} id={objectId} items={loadedDetails} type="object"/></div>
        </React.Fragment>
        }
  </React.Fragment>
}


export default ObjectDetails;