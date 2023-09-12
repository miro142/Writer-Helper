import React, { useEffect, useState, useContext, useCallback } from 'react';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import createEngine, { DiagramModel,DefaultNodeModel, DefaultNodeFactory} from '@projectstorm/react-diagrams';
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import "./RelationshipWeb.css"
import { useParams } from 'react-router-dom';
import { AdvancedLinkFactory, AdvancedPortModel, AdvancedPortFactory, } from '../components/CustomLinks';
import Button from '../../shared/components/FormElements/Button';

const RelationshipWeb=()=>{
    const { error,clearError,sendRequest}= useHttpClient();
    const [loadedCharacters, setLoadedCharacters] = useState([]);
    const [loadedObjects, setLoadedObjects] = useState([]);
    const [loadedOrganizations, setLoadedOrganizations] = useState([]);
    const [loadedPlaces, setLoadedPlaces] = useState([]);
    const [prevWeb, setPrevWeb] = useState();
    const auth = useContext(AuthContext);
    const userId= useParams().userId;
    const [engineRef, ] = useState(() => {
      const engine = createEngine();
      engine.getPortFactories().registerFactory(new AdvancedPortFactory());
      engine.getNodeFactories().registerFactory(new DefaultNodeFactory());
      engine.getLinkFactories().registerFactory(new AdvancedLinkFactory());
      engine.setModel(new DiagramModel());
      return engine;
    });
    const entityNodes = (loadedEntities, type, pos) =>{
      let entityY=0;
      let color;
      switch(type){
        case 'cha':
          color ='lightblue';
          break;
          case 'plc':
            color = 'lightgreen';
          break;
          case 'obj':
            color = '#C4A484';
          break;
          case 'org':
            color = 'red';
          break;
          default:
          break;
      }
        loadedEntities.forEach((entity) => {
          let notNewNode = false;
          if(prevWeb){
            const models = prevWeb.data.layers[1].models;
            for (const nodeId in models) {
              if (models.hasOwnProperty(nodeId)) {
                const node = models[nodeId];
                if (node.id === entity.id + type) {
                  notNewNode = true;
                  if(node.name !==entity.title){
                    engineRef.getModel().getNode(node.id).getOptions().name=entity.title;//Update the node's name when entity's name has been updated
                  }
                  break; // Stop the loop once the node is found
                }
              }
            }
          }
            if(!notNewNode){
          const node = new DefaultNodeModel({
            id: entity.id +type,
            name: entity.title,
            color: color,
          });
          // Add input port to the node
          node.addPort(new AdvancedPortModel({
            in: true,
            name: 'to',
          }));
          if(type !=='obj'){
            // Add output port to the node
            node.addPort(new AdvancedPortModel({
              in: false,
              name: 'from',
            }));
         }

          node.setPosition(pos, 100+entityY);
          engineRef.getModel().addNode(node);
        }
          entityY+=100;
        });
        
        // Refresh the engine to update the canvas
        engineRef.repaintCanvas();
    }
   const RenderEntityNodes = useCallback(entityNodes,[engineRef, prevWeb]);
    
    const handleClick = async()=>{
      const data = JSON.stringify(engineRef.getModel().serialize());
      let res;
      if(prevWeb){
        try{
          res= await sendRequest(`http://localhost:5000/api/relations/user/${userId}`, "PATCH", data,{'Content-Type':'application/json',Authorization: 'Bearer ' + auth.token});
          }catch(err){}
      }
      else{ 
        try{
          res = await sendRequest(`http://localhost:5000/api/relations/`,"POST",data, {'Content-Type':'application/json',Authorization: 'Bearer ' + auth.token});
       }catch(err){}
        setPrevWeb(res.relationshipWeb);// in case the user attempts to save twice when first using the function
      }
      if(res){alert("Save successful")};
    }

    useEffect(()=>{
        const fetchData = async ()=>{
          try{
            const prevData = await sendRequest(`http://localhost:5000/api/relations/user/${userId}`,'GET',null, {Authorization: 'Bearer ' + auth.token});
            setPrevWeb(prevData.web)
            const charData = await sendRequest(`http://localhost:5000/api/characters/user/${userId}`);
            setLoadedCharacters(charData.characters);
            const objData = await sendRequest(`http://localhost:5000/api/objects/user/${userId}`);
            setLoadedObjects(objData.objects);
            const placeData = await sendRequest(`http://localhost:5000/api/places/user/${userId}`);
            setLoadedPlaces(placeData.places);
            const orgData = await sendRequest(`http://localhost:5000/api/organizations/user/${userId}`);
            setLoadedOrganizations(orgData.organizations);
          }catch(err){
            
          }
        }
        fetchData();
      }, [sendRequest, userId, auth.token]);


      useEffect(()=>{
        var model2 = engineRef.getModel();
        if(prevWeb){
        delete prevWeb.data.id;
	      model2.deserializeModel(prevWeb.data, engineRef);
	      engineRef.setModel(model2);
      }
      },[engineRef, prevWeb])

      //Render nodes for chatacters
      useEffect(() => {
        RenderEntityNodes(loadedCharacters, 'cha', 50);
      }, [loadedCharacters, RenderEntityNodes]);
      //Render nodes for places
      useEffect(()=>{
        RenderEntityNodes(loadedPlaces, 'plc', 350);
    }, [loadedPlaces,RenderEntityNodes]);
    //Render nodes for objects
    useEffect(()=>{
      RenderEntityNodes(loadedObjects, 'obj', 650);
  }, [loadedObjects, RenderEntityNodes]);
  //Render nodes for organizations
  useEffect(()=>{
    RenderEntityNodes(loadedOrganizations, 'org', 950);
}, [loadedOrganizations,RenderEntityNodes]);

    
      return (
        <React.Fragment>
           <ErrorModal error={error} onClear={clearError}/>
            <div className='relationship-container'>
              <div className='relationship-canvas'>
                <CanvasWidget engine={engineRef} />
              </div>
              <div className='relationship-save_button'>
                <Button onClick = {handleClick}>Save</Button>
              </div>
            </div>
        </React.Fragment>
      );
}
export default RelationshipWeb;