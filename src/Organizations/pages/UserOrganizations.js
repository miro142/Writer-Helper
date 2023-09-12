import React, { useEffect, useState, useContext } from 'react';
import { useHttpClient } from '../../shared/hooks/http-hook';
import OrganizationList from '../components/OrganizationList';
import { AuthContext } from '../../shared/context/auth-context';
import { useParams } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Button from '../../shared/components/FormElements/Button';
import SearchBox from '../../shared/components/UIElements/SearchBox';


const UserOrganizations = () => {
  const auth = useContext(AuthContext);
  const [loadedOrganizations, setLoadedOrganizations]= useState();
  const [filteredOrganizations, setFilteredOrganizations] = useState();
  const {isLoading, error,sendRequest, clearError}= useHttpClient();
  const userId=useParams().userId;

  useEffect(()=>{
    const fetchOrganizations = async ()=>{
      try{
        const resData = await sendRequest(`http://localhost:5000/api/organizations/user/${userId}`);
        setLoadedOrganizations(resData.organizations);
        setFilteredOrganizations(resData.organizations);
      }catch(err){
    
      }
    }
    fetchOrganizations();
  }, [sendRequest, userId]);
  const organizationDeleteHandler=deletedOrgId=>{
    setLoadedOrganizations(prevOrgs=>prevOrgs.filter(org=>org.id!==deletedOrgId));
    setFilteredOrganizations(prevOrgs=>prevOrgs.filter(org=>org.id!==deletedOrgId))
  };
  const searchHandler =(event)=>{
    setFilteredOrganizations(loadedOrganizations.filter(org=> org.title.toLowerCase().includes(event.target.value.toLowerCase())));
  };

  return <React.Fragment>
    <ErrorModal error={error} onClear={clearError}/>
    {isLoading &&(<div className='center' ><LoadingSpinner /></div>)}
    {!isLoading && auth.userID ===userId && <div className='center'> <Button to={"/organizations/new"}>NEW ORGANIZATION</Button> </div>}
    {!isLoading && loadedOrganizations&&<React.Fragment>
    <SearchBox type = "organizations" onChange = {searchHandler}/>
    <OrganizationList items={filteredOrganizations} onDeleteOrganization= {organizationDeleteHandler} />
    </React.Fragment>
    }
  </React.Fragment>
  
};

export default UserOrganizations;
