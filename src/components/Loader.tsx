import React, {useEffect, useState} from 'react';
import ImageComponent from "./Image";

type DataProps = {
    url: string,
    width: number,
    height: number
}

const Loader = (): JSX.Element => {

    const [value, setValue] = useState<string>('');
    const [data, setData] = useState<{url: string, width: number, height: number}[]>();
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
    const preloader =  require("../images/preloader.svg");

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) : void => {
        const inputTarget = event.target as HTMLInputElement;
        setValue(inputTarget?.value);
    }

    const handleSubmit = async () : Promise<Promise<() => void> | Promise<void>> => {
        if (value.length === 0) return;
        if (value.substring(value.lastIndexOf('.') + 1) !== 'json') {
            let dataObject: DataProps[] = [{url: '', width: 0, height: 0}];
            const img = new Image();
            img.src = value;
            img.onload = function() {
                dataObject[0].width = img.naturalWidth;
                dataObject[0].height = img.naturalHeight;
                dataObject[0].url = value;
                setData((prevData): DataProps[] | undefined => {
                        return (typeof(prevData) !== undefined) ? prevData?.concat(dataObject) : prevData;
                })
            };
        } else {
            const response = await fetch(value);
            const json = await response.json();
            setData((prevData): DataProps[] | undefined => {
                return (typeof prevData) !== 'undefined' ? prevData?.concat(json['galleryImages']) : json['galleryImages'];
            })
        }
    }

    const clearData = (): void => {
        setData([]);
        setValue('');
    }

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        }
        window.addEventListener('resize', handleResize);
    })


    return (
        <>
            <div className="loader">
                <input className="loader__input" type="url" value={value} onChange={handleInput} onSubmit={handleSubmit}/>
                <button className="loader__button" onClick={handleSubmit}>Submit</button>
                <button className="loader__button" onClick={clearData}>Clear</button>
            </div>
            <div className="gallery">
                {
                    data?.map((element, index) => {
                        return (
                            <ImageComponent width={element.width} height={element.height} url={element.url} key={index} windowWidth={windowWidth} preloader={preloader}/>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Loader;