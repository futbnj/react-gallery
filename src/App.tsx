import React, {useEffect, useState} from 'react';
import Loader from './components/Loader/Loader';
import Gallery from "./components/Gallery/Gallery";

export type DataProps = {
    url: string,
    width: number,
    height: number
}

const App = (): JSX.Element => {
    const preloader =  require("./images/preloader.svg");

    const [data, setData] = useState<DataProps[]>([]);
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        }
        window.addEventListener('resize', handleResize);
    })

    return (
        <>
            <Loader setData={setData} />
            <Gallery data={data} windowWidth={windowWidth} preloader={preloader}/>
        </>
    );
}

export default App; 