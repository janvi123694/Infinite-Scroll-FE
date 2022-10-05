import React, { useState, useEffect, useRef } from 'react'
import { FaSearch, FaSketch } from 'react-icons/fa'
import Photo from './Photo'

const clientID = `?client_id=${process.env.REACT_APP_ACCESS_KEY}`
const mainUrl = `https://api.unsplash.com/photos/`
const searchUrl = `https://api.unsplash.com/search/photos/`

function App() {
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [page, setPage] = useState(1); 
    const [query, setQuery] = useState('')
    const mounted = useRef(false)

    //when u reach the end of teh brwoser window, newImages state is changed to true
    const [newImages, setNewImages] = useState(false)


    const handleSubmit = (e) => {
      e.preventDefault() 
      // useeffect is triggered whne page state changes
      //useeffect calls fetch images ()
      if(!query){
        return
      }
      //if ure performing a query for page 1 but are still on the page 1 => no state change
      // so no compo rerender due to use effect 
      // therefore call fetch images manually  
      if(page == 1){ 
        fetchImages(); 
      }
     
      setPage(1); 
    }

    const fetchImages =  async () => {
       setLoading(true); 
       
      try {
          let url = ''; 
          const urlPage = `&page=${page}`;
          const urlQuery = `&query=${query}`;
          
          //domain/authkey/page-param/query-param
          if(query){
            url = `${searchUrl}${clientID}${urlPage}${urlQuery}`;
          }
          else{
            url = `${mainUrl}${clientID}${urlPage}`;
          }

          const response = await fetch(url);
          const data = await response.json();
        
          setPhotos((curPhotos) => {
              // performed a query && requested for the first page 
              // clear prev results and show new results
              if(query && page === 1){
                return data.results
              }

              //performed a query but uve requested page > 1
              // so combine results -- u shud be able to prev records as well as newone as u scroll
              // search end point's data is in data.results
              else if(query){
                return [...curPhotos, ...data.results]; 
              }
              else{
                return [...curPhotos, ...data];
              }
          });

          setNewImages(false)
          setLoading(false);  
      } 
      catch (err) {
          console.log(err);
          setLoading(false);
      }
      
    }

    //trigger when page state value changes
    //fetch images when a new page is requested
    useEffect(() => {
        fetchImages();
        // eslint-disable-next-line
    }, [page])



    useEffect(() => {
      // set true after initial render
      if(!mounted.current){
        mounted.current  = true; 
      }

      //if loading dont perform another fetch request
      if(loading) return; 

      // newImages is set to false in fetchImages()
      // ie a state change therefore this useeffect wud be triggered
      // so check the state of setImages
      //setImages == true on scroll
      //setImages == false in fetchImages ie to reset
      if(!newImages) return; 


      setPage((curPage) => curPage + 1)
    }, [newImages])

    //inner ht == window - task bar 
    // scrolly == how much uve scrolled 
    // -10 to perform fetch before uve reached the end of the browser window
    const event = () => {
        if(window.innerHeight + window.scrollY >= document.body.scrollHeight - 10){
            setNewImages(true) // state change
        }
    }
    
    useEffect(() => {
        window.addEventListener("scroll", event);
        return () => window.removeEventListener("scroll", event);
    }, []);



    return (
        <main>
            <section className="search">
                <form className="search-form">
                    <input type="text" 
                     className="form-input"
                     value={query}
                     placeholder="Search"
                     onChange={(e)=>setQuery(e.target.value)} 
                     />
                    <button className="submit-btn" onClick={handleSubmit}>
                        <FaSearch />
                    </button>
                </form>
            </section>
            <section className='photos'>
              <div className='photos-center'>
                {
                  photos.map((photo)=>{
                    return <Photo {...photo} key={photo.id}/>
                  })
                }
              </div>
              {loading && <h2 className='loading'> loading </h2>}
            </section>
        </main>
    );
}

export default App
